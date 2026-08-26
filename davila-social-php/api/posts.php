<?php
/**
 * Posts API Endpoint (Update media_url, permalink, caption, metrics)
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
    $action = $data['action'] ?? 'update';
    $postId = $data['id'] ?? null;

    if (!$postId) {
        echo json_encode(['success' => false, 'error' => 'ID de publicación requerido']);
        exit;
    }

    if ($action === 'update') {
        $permalink = trim($data['permalink'] ?? '');
        $mediaUrl = trim($data['media_url'] ?? '');
        $caption = trim($data['caption'] ?? '');

        $stmt = $db->prepare("UPDATE report_posts SET 
            permalink = COALESCE(NULLIF(?, ''), permalink),
            media_url = COALESCE(NULLIF(?, ''), media_url),
            thumbnail_url = COALESCE(NULLIF(?, ''), thumbnail_url),
            caption = COALESCE(NULLIF(?, ''), caption)
            WHERE id = ?");
        
        $stmt->execute([$permalink, $mediaUrl, $mediaUrl, $caption, $postId]);

        echo json_encode(['success' => true, 'message' => 'Publicación actualizada correctamente']);
        exit;
    }
}
