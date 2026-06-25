<?php

header('Content-Type: application/json');

$uploadDirectory = __DIR__ . '/../../uploads/';
$maxFileSize = 5 * 1024 * 1024;
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        'success' => false,
        'message' => 'No file uploaded or upload error'
    ]);
    exit;
}

$file = $_FILES['image'];

if ($file['size'] > $maxFileSize) {
    echo json_encode([
        'success' => false,
        'message' => 'File size exceeds 5 MB limit'
    ]);
    exit;
}

$fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($fileExt, $allowedExtensions)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid file extension'
    ]);
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedMimes)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid file type. Allowed: JPG, PNG, GIF, WebP'
    ]);
    exit;
}

if (!is_dir($uploadDirectory)) {
    if (!mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
        echo json_encode([
            'success' => false,
            'message' => 'Unable to create upload directory'
        ]);
        exit;
    }
}

$fileName = 'img_' . bin2hex(random_bytes(16)) . '.' . $fileExt;
$targetFile = $uploadDirectory . $fileName;

if (move_uploaded_file($file['tmp_name'], $targetFile)) {
    echo json_encode([
        'success' => true,
        'path' => '/dashboard-builder/uploads/' . $fileName,
        'message' => 'Image uploaded successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save uploaded file'
    ]);
}