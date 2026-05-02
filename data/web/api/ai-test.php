<?php
/**
 * AI Connection Test endpoint.
 * Tests the AI service connection by making a simple request.
 */
require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

header('Content-Type: application/json');

if (!isset($_SESSION['mailcow_cc_username']) || $_SESSION['mailcow_cc_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$settings_json = $redis->get('mailcow:ai:settings');
if (!$settings_json) {
    echo json_encode(['success' => false, 'error' => 'AI settings not configured']);
    exit;
}

$settings = json_decode($settings_json, true);
$provider = $settings['provider'] ?? 'openai';
$apiUrl = $settings['apiUrl'] ?? '';
$apiKey = $settings['apiKey'] ?? '';
$model = $settings['model'] ?? 'gpt-4o';

if (empty($apiKey)) {
    echo json_encode(['success' => false, 'error' => 'API Key is empty']);
    exit;
}

if ($provider === 'openai') {
    if (empty($apiUrl)) {
        echo json_encode(['success' => false, 'error' => 'API URL is empty']);
        exit;
    }

    $url = rtrim($apiUrl, '/') . '/chat/completions';
    $payload = json_encode([
        'model' => $model,
        'messages' => [['role' => 'user', 'content' => 'Hi']],
        'max_tokens' => 5,
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        echo json_encode(['success' => false, 'error' => 'Connection error: ' . $error]);
    } elseif ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode(['success' => true, 'message' => 'Connected successfully (HTTP ' . $httpCode . ')']);
    } else {
        echo json_encode(['success' => false, 'error' => 'HTTP ' . $httpCode . ': ' . substr($response, 0, 200)]);
    }
} elseif ($provider === 'claude') {
    $url = 'https://api.anthropic.com/v1/messages';
    $payload = json_encode([
        'model' => $model,
        'max_tokens' => 5,
        'messages' => [['role' => 'user', 'content' => 'Hi']],
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        echo json_encode(['success' => false, 'error' => 'Connection error: ' . $error]);
    } elseif ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode(['success' => true, 'message' => 'Connected successfully (HTTP ' . $httpCode . ')']);
    } else {
        echo json_encode(['success' => false, 'error' => 'HTTP ' . $httpCode . ': ' . substr($response, 0, 200)]);
    }
}
