<?php
/**
 * AI Proxy endpoint for SOGo AI Assistant.
 * Replaces the Node.js webmail-backend AI proxy.
 * Supports OpenAI-compatible and Claude APIs with SSE streaming.
 */
require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

// Auth check - same key as SOGo custom-sogo.js
$ai_key = $_SERVER['HTTP_X_AI_KEY'] ?? '';
if ($ai_key !== 'mailcow-ai-2024') {
    http_response_code(401);
    echo "data: " . json_encode(['error' => 'Invalid AI proxy key']) . "\n\n";
    echo "data: [DONE]\n\n";
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo "data: " . json_encode(['error' => 'Method not allowed']) . "\n\n";
    echo "data: [DONE]\n\n";
    exit;
}

// Read AI settings from Redis
$settings_json = $redis->get('ai:settings');
if (!$settings_json) {
    echo "data: " . json_encode(['error' => 'AI settings not configured. Please configure in Admin > AI Settings.']) . "\n\n";
    echo "data: [DONE]\n\n";
    exit;
}

$settings = json_decode($settings_json, true);
$provider = $settings['provider'] ?? 'openai';
$apiKey = $settings['apiKey'] ?? '';
$model = $settings['model'] ?? 'gpt-4o';
$baseUrl = $settings['baseUrl'] ?? '';
$maxTokens = $settings['maxTokensChat'] ?? 2048;
$temperature = $settings['temperature'] ?? 0.7;

if (empty($apiKey)) {
    echo "data: " . json_encode(['error' => 'API Key not configured']) . "\n\n";
    echo "data: [DONE]\n\n";
    exit;
}

// Parse request body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['messages'])) {
    echo "data: " . json_encode(['error' => 'Invalid request: messages required']) . "\n\n";
    echo "data: [DONE]\n\n";
    exit;
}

$messages = $input['messages'];

// Default system prompt
$systemPrompt = 'You are a helpful email assistant embedded in a webmail client. You can help users understand emails, draft responses, translate content, and answer questions about their email. Be concise and helpful. If the user references an email, the content will be provided in the context.';

// Send initial SSE padding (2048 bytes for nginx buffering)
echo str_repeat(' ', 2048) . "\n";
ob_flush();
flush();

if ($provider === 'openai') {
    streamOpenAI($apiKey, $baseUrl, $model, $messages, $systemPrompt, $maxTokens, $temperature);
} elseif ($provider === 'claude') {
    streamClaude($apiKey, $model, $messages, $systemPrompt, $maxTokens, $temperature);
} else {
    echo "data: " . json_encode(['error' => 'Unknown provider: ' . $provider]) . "\n\n";
    echo "data: [DONE]\n\n";
}

function streamOpenAI($apiKey, $baseUrl, $model, $messages, $systemPrompt, $maxTokens, $temperature) {
    $url = rtrim($baseUrl, '/') . '/chat/completions';

    $apiMessages = [['role' => 'system', 'content' => $systemPrompt]];
    foreach ($messages as $msg) {
        $apiMessages[] = ['role' => $msg['role'], 'content' => $msg['content']];
    }

    $payload = json_encode([
        'model' => $model,
        'messages' => $apiMessages,
        'max_tokens' => $maxTokens,
        'temperature' => $temperature,
        'stream' => true,
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $buffer = '';
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) use (&$buffer) {
        $buffer .= $chunk;
        $lines = explode("\n", $buffer);
        $buffer = array_pop($lines);

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            if (!str_starts_with($line, 'data: ')) continue;

            $data = substr($line, 6);
            if ($data === '[DONE]') {
                echo "data: [DONE]\n\n";
                ob_flush();
                flush();
                continue;
            }

            $parsed = json_decode($data, true);
            if ($parsed && isset($parsed['choices'][0]['delta']['content'])) {
                $text = $parsed['choices'][0]['delta']['content'];
                echo "data: " . json_encode(['text' => $text]) . "\n\n";
                ob_flush();
                flush();
            }
        }

        return strlen($chunk);
    });

    curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        echo "data: " . json_encode(['error' => 'Connection error: ' . $error]) . "\n\n";
        echo "data: [DONE]\n\n";
        ob_flush();
        flush();
    }
}

function streamClaude($apiKey, $model, $messages, $systemPrompt, $maxTokens, $temperature) {
    $url = 'https://api.anthropic.com/v1/messages';

    $apiMessages = [];
    foreach ($messages as $msg) {
        $apiMessages[] = ['role' => $msg['role'], 'content' => $msg['content']];
    }

    $payload = json_encode([
        'model' => $model,
        'max_tokens' => $maxTokens,
        'system' => $systemPrompt,
        'messages' => $apiMessages,
        'stream' => true,
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 120);

    $buffer = '';
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) use (&$buffer) {
        $buffer .= $chunk;
        $lines = explode("\n", $buffer);
        $buffer = array_pop($lines);

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            if (!str_starts_with($line, 'data: ')) continue;

            $data = substr($line, 6);
            $parsed = json_decode($data, true);
            if (!$parsed) continue;

            if ($parsed['type'] === 'content_block_delta' &&
                isset($parsed['delta']['text'])) {
                echo "data: " . json_encode(['text' => $parsed['delta']['text']]) . "\n\n";
                ob_flush();
                flush();
            } elseif ($parsed['type'] === 'message_stop') {
                echo "data: [DONE]\n\n";
                ob_flush();
                flush();
            }
        }

        return strlen($chunk);
    });

    curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        echo "data: " . json_encode(['error' => 'Connection error: ' . $error]) . "\n\n";
        echo "data: [DONE]\n\n";
        ob_flush();
        flush();
    }
}
