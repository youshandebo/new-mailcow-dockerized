<?php
/**
 * AI Settings API for mailcow admin panel.
 * Reads/writes AI configuration to Redis.
 */
require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

header('Content-Type: application/json');

if (!isset($_SESSION['mailcow_cc_username']) || $_SESSION['mailcow_cc_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$redis_key = 'ai:settings';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $settings = $redis->get($redis_key);
    if ($settings) {
        $data = json_decode($settings, true);
        // Mask API key - never expose full key
        if (!empty($data['apiKey'])) {
            $key = $data['apiKey'];
            $data['apiKeyPreview'] = substr($key, 0, 8) . '...' . substr($key, -4);
            unset($data['apiKey']);
        }
        echo json_encode($data);
    } else {
        echo json_encode([
            'provider' => 'openai',
            'baseUrl' => '',
            'model' => 'gpt-4o',
            'maxTokensCompose' => 2048,
            'maxTokensChat' => 2048,
            'maxTokensSummarize' => 1024,
            'maxTokensClassify' => 256,
            'temperature' => 0.7
        ]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CSRF protection for JSON requests
    $sec_fetch = $_SERVER['HTTP_SEC_FETCH_DEST'] ?? '';
    $http_referer = $_SERVER['HTTP_REFERER'] ?? '';
    if ($sec_fetch !== 'empty' && $sec_fetch !== 'document') {
        if (empty($http_referer) || strpos($http_referer, $_SERVER['HTTP_HOST']) === false) {
            http_response_code(403);
            echo json_encode(['error' => 'CSRF validation failed']);
            exit;
        }
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = json_decode($_POST['attr'] ?? '{}', true);
    }

    if (!$input || !isset($input['provider'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid settings data']);
        exit;
    }

    // Read existing settings to preserve fields not in form
    $existing = json_decode($redis->get($redis_key) ?: '{}', true);

    $settings = [
        'provider' => in_array($input['provider'], ['openai', 'claude']) ? $input['provider'] : 'openai',
        'baseUrl' => filter_var($input['baseUrl'] ?? $input['apiUrl'] ?? '', FILTER_SANITIZE_URL),
        'apiKey' => $input['apiKey'] ?? $existing['apiKey'] ?? '',
        'model' => $input['model'] ?? 'gpt-4o',
        'maxTokensCompose' => intval($input['maxTokensCompose'] ?? $input['maxTokens'] ?? 2048),
        'maxTokensChat' => intval($input['maxTokensChat'] ?? $input['maxTokens'] ?? 2048),
        'maxTokensSummarize' => intval($input['maxTokensSummarize'] ?? 1024),
        'maxTokensClassify' => intval($input['maxTokensClassify'] ?? 256),
        'temperature' => floatval($input['temperature'] ?? 0.7),
    ];

    $redis->set($redis_key, json_encode($settings));

    echo json_encode(['success' => true, 'message' => 'AI 设置已保存']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
