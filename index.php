<?php
// Root entry point - redirect to frontend editor
// This handles both direct root requests and potential rewrite fallbacks

$currentPath = $_SERVER['REQUEST_URI'];

// If accessing the root or index, redirect to frontend
if ($currentPath === '/dashboard-builder/' || $currentPath === '/dashboard-builder' || $currentPath === '/dashboard-builder/index.php') {
    header('Location: /dashboard-builder/frontend/index.html');
    exit;
}

// Fallback: serve frontend index for any undefined routes
header('Location: /dashboard-builder/frontend/index.html');
exit;
?>
