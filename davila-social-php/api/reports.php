<?php
/**
 * Reports API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$id = uniqid('rep_', true);
$clientId = $data['client_id'] ?? '';
$title = trim($data['title'] ?? '');
$periodStart = $data['period_start'] ?? date('Y-m-01');
$periodEnd = $data['period_end'] ?? date('Y-m-d');
$executiveSummary = trim($data['executive_summary'] ?? '');
$editorialAnalysis = trim($data['editorial_analysis'] ?? '');

if (empty($clientId) || empty($title)) {
    echo json_encode(['success' => false, 'error' => 'Cliente y título son requeridos']);
    exit;
}

$stmt = $db->prepare("INSERT INTO reports (id, client_id, title, period_start, period_end, status, executive_summary, editorial_analysis, created_by_id) 
    VALUES (?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?)");
$stmt->execute([$id, $clientId, $title, $periodStart, $periodEnd, $executiveSummary, $editorialAnalysis, $user['id']]);

// Audit Log
$db->prepare("INSERT INTO audit_logs (id, user_id, user_name, user_email, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
   ->execute([uniqid('log_', true), $user['id'], $user['name'], $user['email'], 'CREATE', 'REPORT', $id, "Reporte '{$title}' generado"]);

echo json_encode(['success' => true, 'id' => $id]);
