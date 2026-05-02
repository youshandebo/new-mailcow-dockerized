<?php
/**
 * Webmail authentication endpoint for custom webmail backend.
 * Validates credentials using mailcow's check_login() function.
 */
require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password required']);
    exit;
}

$result = check_login($username, $password, array('role' => 'user', 'service' => 'NONE'));

if ($result === 'user' || $result === 'admin' || $result === 'domainadmin') {
    echo json_encode([
        'success' => true,
        'role' => $result,
        'username' => $username,
    ]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
