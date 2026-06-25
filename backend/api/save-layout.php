<?php

header('Content-Type: application/json');

require_once '../config/db.php';

$input = file_get_contents('php://input');
if (empty($input)) {
    echo json_encode([
        'success' => false,
        'message' => 'No data received'
    ]);
    exit;
}

$data = json_decode($input, true);
if (!is_array($data)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON format'
    ]);
    exit;
}

if (!isset($data['elements']) || !is_array($data['elements'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Layout must include an elements array'
    ]);
    exit;
}

foreach ($data['elements'] as $element) {
    if (!isset($element['id'], $element['type'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Element missing required fields (id, type)'
        ]);
        exit;
    }
}

$layoutName = 'Default Dashboard';
$layoutJson = json_encode($data, JSON_UNESCAPED_UNICODE);

if (strlen($layoutJson) > 1000000) {
    echo json_encode([
        'success' => false,
        'message' => 'Layout data too large'
    ]);
    exit;
}

$layoutId = isset($data['layoutId']) && is_numeric($data['layoutId']) ? intval($data['layoutId']) : null;

if ($layoutId !== null) {
    $sql = 'UPDATE dashboard_layouts SET layout_json = ? WHERE id = ?';
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $conn->error
        ]);
        exit;
    }
    $stmt->bind_param('si', $layoutJson, $layoutId);
    $success = $stmt->execute();
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Layout updated successfully',
            'layoutId' => $layoutId
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update layout'
        ]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

$sql = 'INSERT INTO dashboard_layouts (layout_name, layout_json) VALUES (?, ?)';

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param('ss', $layoutName, $layoutJson);
$success = $stmt->execute();

if ($success) {
    echo json_encode([
        'success' => true,
        'message' => 'Layout saved successfully',
        'layoutId' => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save layout'
    ]);
}

$stmt->close();