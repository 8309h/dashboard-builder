<?php

header("Content-Type: application/json");

require_once "../config/db.php";

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!$data) {

    echo json_encode([
        "success" => false,
        "message" => "No data received"
    ]);

    exit;
}

$layoutName = "Default Dashboard";

$layoutJson =
    json_encode(
        $data,
        JSON_UNESCAPED_UNICODE
    );

$sql = "
INSERT INTO dashboard_layouts
(
    layout_name,
    layout_json
)
VALUES
(
    ?,
    ?
)
";

$stmt =
    $conn->prepare($sql);

$stmt->bind_param(
    "ss",
    $layoutName,
    $layoutJson
);

$success = $stmt->execute();

echo json_encode([
    "success" => $success
]);