<?php

if (!isset($_GET['file']) ) {
    http_response_code(404);
    exit;
}
$pathinfo = pathinfo($_GET['file']);

if (!array_key_exists('extension', $pathinfo)) {
    http_response_code(404);
    exit;
}
$extension = strtolower($pathinfo['extension']);

$filepath = '/tmp/' . $pathinfo['basename'];
$content = '';

if (file_exists($filepath)) {
    $lastModified = filemtime($filepath);
    $etag = '"' . md5_file($filepath) . '"';

    if ($extension === 'js') {
        header('Content-Type: application/javascript');
    } elseif ($extension === 'css') {
        header('Content-Type: text/css');
    } else {
        //currently just css and js should be supported!
        exit();
    }

    header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $lastModified) . ' GMT');
    header('ETag: ' . $etag);
    header('Cache-Control: public, must-revalidate');

    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
        http_response_code(304);
        exit;
    }
    if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) >= $lastModified) {
        http_response_code(304);
        exit;
    }

    $content = file_get_contents($filepath);
}

echo $content;
