<?php
/**
 * User Management API Endpoint (RBAC, CRUD & Password Reset)
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if ($method === 'POST') {
    $action = $data['action'] ?? 'save';

    if ($action === 'save') {
        $id = !empty($data['id']) ? $data['id'] : uniqid('usr_', true);
        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $role = in_array($data['role'] ?? '', ['ADMIN', 'TEAM', 'CLIENT']) ? $data['role'] : 'TEAM';
        $clientId = ($role === 'CLIENT' && !empty($data['client_id'])) ? $data['client_id'] : null;
        $active = isset($data['active']) ? (int)$data['active'] : 1;
        $password = trim($data['password'] ?? '');

        if (empty($name) || empty($email)) {
            echo json_encode(['success' => false, 'error' => 'Nombre y correo son obligatorios']);
            exit;
        }

        if (!empty($data['id'])) {
            // Update existing user
            if (!empty($password)) {
                $passwordHash = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $db->prepare("UPDATE users SET name = ?, email = ?, role = ?, client_id = ?, active = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                $stmt->execute([$name, $email, $role, $clientId, $active, $passwordHash, $id]);
            } else {
                $stmt = $db->prepare("UPDATE users SET name = ?, email = ?, role = ?, client_id = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                $stmt->execute([$name, $email, $role, $clientId, $active, $id]);
            }
            $msg = "Usuario {$name} actualizado";
        } else {
            // Check if email exists
            $check = $db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
            $check->execute([$email]);
            if ($check->fetchColumn() > 0) {
                echo json_encode(['success' => false, 'error' => 'Ya existe un usuario con este correo electrónico']);
                exit;
            }

            if (empty($password)) {
                $password = 'davila2026!';
            }
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $db->prepare("INSERT INTO users (id, name, email, password_hash, role, client_id, active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $name, $email, $passwordHash, $role, $clientId, $active]);
            $msg = "Usuario {$name} creado";
        }

        // Audit Log
        $db->prepare("INSERT INTO audit_logs (id, user_id, user_name, user_email, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
           ->execute([uniqid('log_', true), $user['id'], $user['name'], $user['email'], 'SAVE', 'USER', $id, $msg]);

        echo json_encode(['success' => true, 'id' => $id, 'message' => $msg]);
        exit;
    }

    if ($action === 'toggle_active') {
        $id = $data['id'] ?? '';
        $active = (int)($data['active'] ?? 0);
        $stmt = $db->prepare("UPDATE users SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$active, $id]);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'delete') {
        $id = $data['id'] ?? '';
        if ($id === $user['id']) {
            echo json_encode(['success' => false, 'error' => 'No puedes eliminar tu propio usuario']);
            exit;
        }
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit;
    }
}
