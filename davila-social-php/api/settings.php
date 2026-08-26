<?php
/**
 * Settings API Endpoint (Save & Test Gemini / Metricool API Keys)
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
        if (isset($data['gemini_api_key'])) {
            Database::setSetting('gemini_api_key', trim($data['gemini_api_key']));
        }
        if (isset($data['metricool_api_key'])) {
            Database::setSetting('metricool_api_key', trim($data['metricool_api_key']));
        }
        if (isset($data['agency_name'])) {
            Database::setSetting('agency_name', trim($data['agency_name']));
        }

        // Audit Log
        $db->prepare("INSERT INTO audit_logs (id, user_id, user_name, user_email, action, resource_type, details) VALUES (?, ?, ?, ?, ?, ?, ?)")
           ->execute([uniqid('log_', true), $user['id'], $user['name'], $user['email'], 'UPDATE', 'SETTINGS', 'Ajustes del sistema y API keys actualizados']);

        echo json_encode(['success' => true, 'message' => 'Ajustes guardados correctamente']);
        exit;
    }

    if ($action === 'test_gemini') {
        $apiKey = trim($data['gemini_api_key'] ?? Database::getSetting('gemini_api_key', defined('GEMINI_API_KEY') ? GEMINI_API_KEY : ''));

        if (empty($apiKey)) {
            echo json_encode(['success' => false, 'error' => 'Ingresa una clave API de Google Gemini para probar la conexión']);
            exit;
        }

        // Candidate model endpoints to test in order of preference
        $modelsToTry = [
            'gemini-2.0-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro'
        ];

        $success = false;
        $activeModelName = '';
        $lastError = '';

        foreach ($modelsToTry as $model) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $apiKey;
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_POSTFIELDS => json_encode([
                    'contents' => [['parts' => [['text' => 'Responde solo: OK']]]]
                ]),
                CURLOPT_TIMEOUT => 8
            ]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $lastError = 'Error de red cURL: ' . $curlError;
                continue;
            }

            $json = json_decode($response, true);
            if ($httpCode === 200 && isset($json['candidates'][0]['content']['parts'][0]['text'])) {
                $success = true;
                $activeModelName = $model;
                break;
            } else {
                $lastError = $json['error']['message'] ?? "HTTP {$httpCode}";
            }
        }

        if ($success) {
            Database::setSetting('gemini_api_key', $apiKey);
            Database::setSetting('gemini_model', $activeModelName);
            echo json_encode([
                'success' => true, 
                'model' => $activeModelName,
                'message' => "¡Conexión exitosa con Google Gemini ({$activeModelName})! La clave es válida y está activa."
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => $lastError]);
        }
        exit;
    }
}
