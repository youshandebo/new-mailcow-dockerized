<?php
/**
 * AI Proxy endpoint for SOGo AI Assistant.
 * Supports OpenAI-compatible and Claude APIs with SSE streaming.
 * Requires authenticated session.
 */
require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

// Session authentication - require logged-in user
if (!isset($_SESSION['mailcow_cc_username'])) {
    http_response_code(401);
    echo "data: " . json_encode(['error' => 'Authentication required']) . "\n\n";
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

// CSRF protection: require Sec-Fetch-Dest header or valid referer
$sec_fetch = $_SERVER['HTTP_SEC_FETCH_DEST'] ?? '';
$http_referer = $_SERVER['HTTP_REFERER'] ?? '';
if ($sec_fetch !== 'empty' && $sec_fetch !== 'document') {
    if (empty($http_referer) || strpos($http_referer, $_SERVER['HTTP_HOST']) === false) {
        http_response_code(403);
        echo "data: " . json_encode(['error' => 'CSRF validation failed']) . "\n\n";
        echo "data: [DONE]\n\n";
        exit;
    }
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

// Validate messages array
if (!is_array($messages) || count($messages) > 50) {
    echo "data: " . json_encode(['error' => 'Too many messages (max 50)']) . "\n\n";
    echo "data: [DONE]\n\n";
    exit;
}

foreach ($messages as $msg) {
    if (!isset($msg['role'], $msg['content'])) {
        echo "data: " . json_encode(['error' => 'Invalid message format']) . "\n\n";
        echo "data: [DONE]\n\n";
        exit;
    }
    if (strlen($msg['content']) > 50000) {
        echo "data: " . json_encode(['error' => 'Message too long (max 50000 chars)']) . "\n\n";
        echo "data: [DONE]\n\n";
        exit;
    }
}

$systemPrompt = 'You are a helpful email assistant embedded in a webmail client. You can help users understand emails, draft responses, translate content, and answer questions about their email. Be concise and helpful.';

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

function isPrivateIP($url) {
    $host = parse_url($url, PHP_URL_HOST);
    if (!$host) return false;
    $ip = gethostbyname($host);
    if ($ip === $host) return false; // DNS resolution failed
    // Store resolved IP for CURLOPT_RESOLVE to prevent DNS rebinding
    $GLOBALS['_resolved_hosts'][$host] = $ip;
    return !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
}

function streamOpenAI($apiKey, $baseUrl, $model, $messages, $systemPrompt, $maxTokens, $temperature) {
    $url = rtrim($baseUrl, '/') . '/chat/completions';

    // SSRF protection
    if (isPrivateIP($url)) {
        echo "data: " . json_encode(['error' => 'Invalid API URL']) . "\n\n";
        echo "data: [DONE]\n\n";
        return;
    }

    $apiMessages = [['role' => 'system', 'content' => $systemPrompt]];
    foreach ($messages as $msg) {
        $apiMessages[] = ['role' => $msg['role'], 'content' => $msg['content']];
    }

    $payload = json_encode([
        'model' => $model,
        'messages' => $apiMessages,
        'max_tokens' => min($maxTokens, 4096),
        'temperature' => max(0, min(2, $temperature)),
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
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    // Pin resolved IP to prevent DNS rebinding (TOCTOU fix)
    if (!empty($GLOBALS['_resolved_hosts'])) {
        $resolve = [];
        foreach ($GLOBALS['_resolved_hosts'] as $h => $i) {
            $resolve[] = $h . ':443:' . $i;
            $resolve[] = $h . ':80:' . $i;
        }
        curl_setopt($ch, CURLOPT_RESOLVE, $resolve);
    }

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
        echo "data: " . json_encode(['error' => 'Connection error']) . "\n\n";
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
        'max_tokens' => min($maxTokens, 4096),
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
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

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

            if ($parsed['type'] === 'content_block_delta' && isset($parsed['delta']['text'])) {
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
        echo "data: " . json_encode(['error' => 'Connection error']) . "\n\n";
        echo "data: [DONE]\n\n";
        ob_flush();
        flush();
    }
}
