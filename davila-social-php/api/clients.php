<?php
/**
 * Clients API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = $data['action'] ?? 'save';

    if ($action === 'save') {
        $id = !empty($data['id']) ? $data['id'] : uniqid('cli_', true);
        $name = trim($data['name'] ?? '');
        $slug = trim($data['slug'] ?? strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name)));
        $industry = trim($data['industry'] ?? '');
        $contactName = trim($data['contact_name'] ?? '');
        $contactEmail = trim($data['contact_email'] ?? '');
        $metricoolBlogId = trim($data['metricool_blog_id'] ?? '');
        $metricoolUserId = trim($data['metricool_user_id'] ?? '');
        $logo = trim($data['logo'] ?? 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=150&auto=format&fit=crop&q=60');

        if (empty($name)) {
            echo json_encode(['success' => false, 'error' => 'El nombre del cliente es obligatorio']);
            exit;
        }

        if (!empty($data['id'])) {
            $stmt = $db->prepare("UPDATE clients SET name = ?, slug = ?, industry = ?, contact_name = ?, contact_email = ?, metricool_blog_id = ?, metricool_user_id = ?, logo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$name, $slug, $industry, $contactName, $contactEmail, $metricoolBlogId, $metricoolUserId, $logo, $id]);
            $msg = "Cliente {$name} actualizado";
        } else {
            $stmt = $db->prepare("INSERT INTO clients (id, name, slug, industry, contact_name, contact_email, metricool_blog_id, metricool_user_id, logo, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
            $stmt->execute([$id, $name, $slug, $industry, $contactName, $contactEmail, $metricoolBlogId, $metricoolUserId, $logo]);
            $msg = "Cliente {$name} creado";
        }

        $db->prepare("INSERT INTO audit_logs (id, user_id, user_name, user_email, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
           ->execute([uniqid('log_', true), $user['id'], $user['name'], $user['email'], 'SAVE', 'CLIENT', $id, $msg]);

        echo json_encode(['success' => true, 'id' => $id, 'message' => $msg]);
        exit;
    }
}
