<?php

require_once $_SERVER['DOCUMENT_ROOT'] . '/inc/prerequisites.inc.php';

if (!isset($_SESSION['mailcow_cc_role']) || $_SESSION['mailcow_cc_role'] !== 'admin') {
    http_response_code(403);
    exit;
}

if (isset($_GET['id'])) {
    header('Content-Type: text/plain');
    echo fail2ban('banlist', 'get', preg_replace('/[^a-zA-Z0-9._-]/', '', $_GET['id']));
} else {
    header('HTTP/1.1 404 Not Found');
    exit;
}
