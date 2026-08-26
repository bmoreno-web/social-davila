<?php
/**
 * Authentication and Session Management
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

class Auth {
    public static function user(): ?array {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT u.*, c.name as client_name, c.slug as client_slug FROM users u LEFT JOIN clients c ON u.client_id = c.id WHERE u.id = ? AND u.active = 1");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if (!$user) {
            self::logout();
            return null;
        }
        return $user;
    }

    public static function check(): bool {
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }

    public static function requireAuth(): array {
        $user = self::user();
        if (!$user) {
            header('Location: ' . APP_URL . '/login.php');
            exit;
        }
        return $user;
    }

    public static function requireAdminOrTeam(): array {
        $user = self::requireAuth();
        if ($user['role'] === 'CLIENT') {
            header('Location: ' . APP_URL . '/portal.php');
            exit;
        }
        return $user;
    }

    public static function login(string $email, string $password): array {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND active = 1");
        $stmt->execute([trim($email)]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return ['success' => false, 'error' => 'Correo electrónico o contraseña incorrectos'];
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['client_id'] = $user['client_id'];

        // Audit Log
        $db->prepare("INSERT INTO audit_logs (id, user_id, user_name, user_email, action, resource_type, details) VALUES (?, ?, ?, ?, ?, ?, ?)")
           ->execute([uniqid('log_', true), $user['id'], $user['name'], $user['email'], 'LOGIN', 'AUTH', 'Inicio de sesión exitoso']);

        return ['success' => true, 'user' => $user];
    }

    public static function logout(): void {
        if (isset($_SESSION['user_id'])) {
            $db = Database::getConnection();
            $db->prepare("INSERT INTO audit_logs (id, user_id, user_name, user_email, action, resource_type, details) VALUES (?, ?, ?, ?, ?, ?, ?)")
               ->execute([uniqid('log_', true), $_SESSION['user_id'], $_SESSION['user_name'] ?? 'Usuario', $_SESSION['user_email'] ?? '', 'LOGOUT', 'AUTH', 'Cierre de sesión']);
        }
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }
}
