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

        // 1. Fetch the exact list of available models from Google AI for this specific API key
        $listUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" . $apiKey;
        $ch = curl_init($listUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 10
        ]);
        $listResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            echo json_encode(['success' => false, 'error' => 'Error de conexión cURL: ' . $curlError]);
            exit;
        }

        $listJson = json_decode($listResponse, true);
        if ($httpCode !== 200 || !isset($listJson['models'])) {
            $errMsg = $listJson['error']['message'] ?? "Clave inválida o error en la API de Google (HTTP {$httpCode})";
            echo json_encode(['success' => false, 'error' => $errMsg]);
            exit;
        }

        // 2. Find models that support generateContent
        $supportedModels = [];
        foreach ($listJson['models'] as $m) {
            $methods = $m['supportedGenerationMethods'] ?? [];
            if (in_array('generateContent', $methods)) {
                $supportedModels[] = $m['name']; // e.g. "models/gemini-2.0-flash" or "models/gemini-1.5-flash"
            }
        }

        if (empty($supportedModels)) {
            echo json_encode(['success' => false, 'error' => 'Tu clave de API no tiene modelos con soporte para generateContent']);
            exit;
        }

        // Sort to prioritize flash / pro models
        usort($supportedModels, function($a, $b) {
            if (strpos($a, 'flash') !== false && strpos($b, 'flash') === false) return -1;
            if (strpos($b, 'flash') !== false && strpos($a, 'flash') === false) return 1;
            return 0;
        });

        $chosenModel = $supportedModels[0]; // e.g. "models/gemini-2.0-flash"

        // 3. Test generateContent with the exact model verified by Google
        $genUrl = "https://generativelanguage.googleapis.com/v1beta/{$chosenModel}:generateContent?key=" . $apiKey;
        $ch2 = curl_init($genUrl);
        curl_setopt_array($ch2, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode([
                'contents' => [['parts' => [['text' => 'Responde solo: OK']]]]
            ]),
            CURLOPT_TIMEOUT => 10
        ]);
        $genResponse = curl_exec($ch2);
        $genHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);

        $genJson = json_decode($genResponse, true);
        if ($genHttpCode === 200 && isset($genJson['candidates'][0]['content']['parts'][0]['text'])) {
            $displayName = str_replace('models/', '', $chosenModel);
            Database::setSetting('gemini_api_key', $apiKey);
            Database::setSetting('gemini_model', $chosenModel);
            echo json_encode([
                'success' => true,
                'model' => $displayName,
                'message' => "¡Conexión exitosa con Google Gemini ({$displayName})! La clave es válida y está activa."
            ]);
        } else {
            $err = $genJson['error']['message'] ?? "Error al generar contenido con {$chosenModel}";
            echo json_encode(['success' => false, 'error' => $err]);
        }
        exit;
    }
}
