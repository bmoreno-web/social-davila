<?php
/**
 * Recommendations API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../auth.php';

$user = Auth::requireAuth();
$db = Database::getConnection();

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (isset($data['id']) && isset($data['status'])) {
    $stmt = $db->prepare("UPDATE recommendations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$data['status'], $data['id']]);

    $db->prepare("INSERT INTO audit_logs (id, user_id, user_name, user_email, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
       ->execute([uniqid('log_', true), $user['id'], $user['name'], $user['email'], 'UPDATE_STATUS', 'RECOMMENDATION', $data['id'], "Estado cambiado a {$data['status']}"]);

    echo json_encode(['success' => true]);
    exit;
}

if (isset($data['action']) && $data['action'] === 'create') {
    $id = uniqid('rec_', true);
    $clientId = $data['client_id'];
    $category = $data['category'] ?? 'CONTENIDO';
    $priority = $data['priority'] ?? 'MEDIA';
    $title = trim($data['title']);
    $description = trim($data['description']);

    if (empty($title) || empty($clientId)) {
        echo json_encode(['success' => false, 'error' => 'Título y cliente son obligatorios']);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO recommendations (id, client_id, category, priority, title, description, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')");
    $stmt->execute([$id, $clientId, $category, $priority, $title, $description]);

    echo json_encode(['success' => true, 'id' => $id]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Acción no válida']);
