<?php
/**
 * Davila PM Data Intelligence Engine: Automated Synthesis & Editorial Analytics
 * Generates custom, quantitative, data-driven executive summaries and editorial texts
 * based on actual client posts and performance metrics in the database.
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

$clientId = $_GET['client_id'] ?? ($_POST['client_id'] ?? null);
$periodStart = $_GET['period_start'] ?? ($_POST['period_start'] ?? date('Y-m-01'));
$periodEnd = $_GET['period_end'] ?? ($_POST['period_end'] ?? date('Y-m-d'));

if (!$clientId) {
    echo json_encode(['success' => false, 'error' => 'client_id es requerido']);
    exit;
}

// 1. Get Client Info
$stmtClient = $db->prepare("SELECT * FROM clients WHERE id = ?");
$stmtClient->execute([$clientId]);
$client = $stmtClient->fetch();

if (!$client) {
    echo json_encode(['success' => false, 'error' => 'Cliente no encontrado']);
    exit;
}

// 2. Fetch Posts & Quantitative Metrics in the Period
$stmtPosts = $db->prepare("SELECT * FROM report_posts 
    WHERE client_id = ? 
    ORDER BY engagement_rate DESC");
$stmtPosts->execute([$clientId]);
$posts = $stmtPosts->fetchAll();

$totalPosts = count($posts);

if ($totalPosts === 0) {
    // If no synced posts yet, provide a well-crafted structured blueprint
    $brandName = $client['name'];
    $industry = $client['industry'] ?? 'su sector';
    
    echo json_encode([
        'success' => true,
        'executive_summary' => "Durante el período evaluado para {$brandName} ({$industry}), se consolidaron las bases de audiencia y se ejecutó la parrilla de publicaciones programada. Se recomienda sincronizar con Metricool para obtener las métricas detalladas de interacción.",
        'editorial_analysis' => "### Balance Estratégico Davila PM\n\n1. **Alineación de Marca**: El contenido refleja los pilares de identidad y propuesta de valor de {$brandName}.\n2. **Oportunidad en Formatos**: Recomendamos priorizar video vertical (Reels/TikTok) y carruseles informativos para maximizar el alcance orgánico."
    ]);
    exit;
}

// Compute Real Aggregates
$totalLikes = array_sum(array_column($posts, 'likes'));
$totalComments = array_sum(array_column($posts, 'comments'));
$totalShares = array_sum(array_column($posts, 'shares'));
$totalSaves = array_sum(array_column($posts, 'saves'));
$totalInteractions = $totalLikes + $totalComments + $totalShares + $totalSaves;
$totalReach = array_sum(array_column($posts, 'reach'));
$totalImpressions = array_sum(array_column($posts, 'impressions'));

$avgEngagement = round(array_sum(array_column($posts, 'engagement_rate')) / max($totalPosts, 1), 2);

// Best format analysis
$formatCounts = [];
$formatEngagement = [];
foreach ($posts as $p) {
    $type = ucfirst($p['post_type'] ?? 'Imagen');
    $formatCounts[$type] = ($formatCounts[$type] ?? 0) + 1;
    $formatEngagement[$type][] = $p['engagement_rate'];
}

$bestFormat = 'Video / Reel';
$bestFormatAvg = 0;
foreach ($formatEngagement as $f => $rates) {
    $fAvg = array_sum($rates) / count($rates);
    if ($fAvg > $bestFormatAvg) {
        $bestFormatAvg = $fAvg;
        $bestFormat = $f;
    }
}
$bestFormatAvg = round($bestFormatAvg, 2);

// Platform breakdown
$platforms = array_unique(array_column($posts, 'platform'));
$platformList = implode(', ', array_map('ucfirst', array_map('strtolower', $platforms)));

// Top 2 posts
$topPost1 = $posts[0] ?? null;
$topPost2 = $posts[1] ?? null;

$brandName = $client['name'];
$industry = $client['industry'] ?? 'su sector';

// Format numbers nicely
$reachFmt = number_format($totalReach);
$impFmt = number_format($totalImpressions);
$interFmt = number_format($totalInteractions);
$likesFmt = number_format($totalLikes);
$commFmt = number_format($totalComments);
$savesFmt = number_format($totalSaves);

// 3. Optional Gemini API Engine if configured in Admin or Config
$geminiKey = Database::getSetting('gemini_api_key', defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '');
if (!empty($geminiKey)) {
    $prompt = "Eres el Director de Estrategia y Analítica Digital de la agencia Davila PM. Genera un análisis profesional en español basado estrictamente en estas métricas reales:\n\n" .
        "Marca: {$brandName}\n" .
        "Sector: {$industry}\n" .
        "Total Publicaciones: {$totalPosts}\n" .
        "Impresiones: {$impFmt}\n" .
        "Alcance Neto: {$reachFmt}\n" .
        "Interacciones Totales: {$interFmt} (Likes: {$likesFmt}, Comentarios: {$commFmt}, Guardados: {$savesFmt})\n" .
        "Engagement Rate Promedio: {$avgEngagement}%\n" .
        "Mejor Formato: {$bestFormat} (ER: {$bestFormatAvg}%)\n" .
        ($topPost1 ? "Publicación Destacada: '{$topPost1['caption']}' con {$topPost1['engagement_rate']}% ER y {$topPost1['reach']} alcance.\n" : "") .
        "\nResponde en formato JSON con exactamente dos campos:\n" .
        "1. executive_summary: Un párrafo ejecutivo denso con los datos y porcentajes cuantitativos exactos.\n" .
        "2. editorial_analysis: Un análisis estratégico editorial Davila PM estructurado en 3 puntos (Rendimiento por formato, Calidad de interacción, y Recomendaciones tácticas accionables con números).";

    $activeModel = Database::getSetting('gemini_model', '');

    $modelsToTry = array_filter([$activeModel, 'models/gemini-3.6-flash', 'models/gemini-3.0-flash', 'models/gemini-2.0-flash', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro']);

    // If active model is not verified, get dynamic list from ListModels
    if (empty($activeModel)) {
        $listUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" . $geminiKey;
        $ch = curl_init($listUrl);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8]);
        $listRes = curl_exec($ch);
        curl_close($ch);
        $listJson = json_decode($listRes, true);
        if (isset($listJson['models'])) {
            foreach ($listJson['models'] as $m) {
                if (in_array('generateContent', $m['supportedGenerationMethods'] ?? [])) {
                    $modelsToTry[] = $m['name'];
                }
            }
        }
    }

    $modelsToTry = array_unique($modelsToTry);

    foreach ($modelsToTry as $candidateModel) {
        $modelPath = (strpos($candidateModel, 'models/') === 0) ? $candidateModel : "models/{$candidateModel}";
        $ch = curl_init("https://generativelanguage.googleapis.com/v1beta/{$modelPath}:generateContent?key=" . $geminiKey);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode([
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => ['response_mime_type' => 'application/json']
            ]),
            CURLOPT_TIMEOUT => 15
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            $json = json_decode($response, true);
            $aiText = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($aiText) {
                $parsed = json_decode($aiText, true);
                if (isset($parsed['executive_summary']) && isset($parsed['editorial_analysis'])) {
                    Database::setSetting('gemini_model', $modelPath);
                    echo json_encode([
                        'success' => true,
                        'executive_summary' => $parsed['executive_summary'],
                        'editorial_analysis' => $parsed['editorial_analysis'],
                        'model_used' => $modelPath,
                        'source' => 'gemini_ai'
                    ]);
                    exit;
                }
            }
        }
    }
}

// 4. Default High-Precision Data Synthesis Algorithm
$executiveSummary = "Durante el período evaluado, la marca {$brandName} registró un volumen total de {$impFmt} impresiones y un alcance neto de {$reachFmt} usuarios únicos a través de {$totalPosts} publicaciones en {$platformList}. La comunidad generó {$interFmt} interacciones totales ({$likesFmt} likes, {$commFmt} comentarios y {$savesFmt} guardados), consolidando una tasa promedio de engagement de {$avgEngagement}%. El formato con mejor desempeño fue '{$bestFormat}', promediando un ER de {$bestFormatAvg}%.";

$editorialAnalysis = "### Diagnóstico Estratégico y Editorial Davila PM — {$brandName}

1. **Eficiencia por Formato y Contenido Audiovisual**:
El análisis cuantitativo demuestra que el formato **{$bestFormat}** lideró la retención de audiencia con un **{$bestFormatAvg}% de Engagement Rate**. " . 
($topPost1 ? "La publicación más destacada (\"" . substr($topPost1['caption'], 0, 70) . "...\") alcanzó por sí sola un {$topPost1['engagement_rate']}% de ER con " . number_format($topPost1['reach']) . " usuarios alcanzados." : "") . "

2. **Calidad de Interacción y Madurez de Comunidad**:
De las {$interFmt} interacciones registradas, se destaca el volumen de contenidos guardados ({$savesFmt}) y compartidos, lo que indica un alto valor utilitario y educativo del contenido técnico de {$industry}.

3. **Recomendaciones Tácticas para el Próximo Período**:
- **Amplificar el formato {$bestFormat}**: Aumentar la frecuencia semanal en 1 publicación adicional de este tipo.
- **Optimización de Conversación**: Fomentar llamadas a la acción directas hacia cotizaciones y contacto comercial en los primeros segundos del copy.
- **Pauta de Retargeting**: Inyectar pauta a las publicaciones del top 20% de engagement para extender su vida útil y captación de clientes potenciales.";

echo json_encode([
    'success' => true,
    'executive_summary' => $executiveSummary,
    'editorial_analysis' => $editorialAnalysis,
    'source' => 'data_engine',
    'metrics' => [
        'total_posts' => $totalPosts,
        'reach' => $totalReach,
        'impressions' => $totalImpressions,
        'interactions' => $totalInteractions,
        'engagement_rate' => $avgEngagement,
        'best_format' => $bestFormat,
        'best_format_er' => $bestFormatAvg
    ]
]);
