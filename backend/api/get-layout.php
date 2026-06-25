<?php

header('Content-Type: application/json');

require_once '../config/db.php';

$sql = 'SELECT id, layout_json FROM dashboard_layouts ORDER BY id DESC LIMIT 1';

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $data = json_decode($row['layout_json'], true);
    if ($data !== null) {
        $output = [
            'layoutId' => intval($row['id']),
            'elements' => $data['elements'] ?? []
        ];
        echo json_encode($output);
    } else {
        echo json_encode(['layoutId' => null, 'elements' => []]);
    }
} else {
    echo json_encode(['layoutId' => null, 'elements' => []]);
}

$conn->close();