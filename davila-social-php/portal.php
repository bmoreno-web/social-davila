<?php
$pageTitle = 'Portal Ejecutivo de Cliente';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAuth();
$db = Database::getConnection();

// Determine clientId (either from logged-in client user or query param for admin preview)
$clientId = $user['role'] === 'CLIENT' ? $user['client_id'] : ($_GET['client_id'] ?? null);

if (!$clientId) {
    // If admin and no client passed, default to first client
    $clientId = $db->query("SELECT id FROM clients LIMIT 1")->fetchColumn();
}

$stmt = $db->prepare("SELECT * FROM clients WHERE id = ?");
$stmt->execute([$clientId]);
$client = $stmt->fetch();

if (!$client) {
    die("Marca o cliente no encontrado.");
}

// Fetch posts
$stmt = $db->prepare("SELECT * FROM report_posts WHERE client_id = ? ORDER BY published_at DESC LIMIT 6");
$stmt->execute([$clientId]);
$posts = $stmt->fetchAll();

// Fetch reports
$stmt = $db->prepare("SELECT * FROM reports WHERE client_id = ? AND status = 'PUBLISHED' ORDER BY created_at DESC");
$stmt->execute([$clientId]);
$reports = $stmt->fetchAll();

// Fetch recommendations
$stmt = $db->prepare("SELECT * FROM recommendations WHERE client_id = ? ORDER BY created_at DESC");
$stmt->execute([$clientId]);
$recommendations = $stmt->fetchAll();

require_once __DIR__ . '/includes/header.php';
if ($user['role'] !== 'CLIENT') {
    require_once __DIR__ . '/includes/sidebar.php';
}
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-dark-bg min-h-screen">
    <!-- Header -->
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <img src="<?= htmlspecialchars($client['logo']) ?>" class="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-dark-border">
            <div>
                <h1 class="text-base font-bold text-slate-900 dark:text-white"><?= htmlspecialchars($client['name']) ?></h1>
                <p class="text-xs text-slate-500 dark:text-slate-400">Portal Ejecutivo de Rendimiento Social</p>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <!-- Theme Toggle Button -->
            <button onclick="toggleTheme()" class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <i data-lucide="sun" class="theme-icon-sun w-3.5 h-3.5 text-amber-500"></i>
                <i data-lucide="moon" class="theme-icon-moon w-3.5 h-3.5 text-violet-400 hidden"></i>
                <span class="theme-text-label">Modo Claro</span>
            </button>
            <?php if ($user['role'] === 'CLIENT'): ?>
                <a href="logout.php" class="text-xs text-rose-500 font-semibold hover:underline">Cerrar sesión</a>
            <?php endif; ?>
        </div>
    </header>

    <div class="max-w-6xl mx-auto p-8 space-y-8 w-full">
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-5 rounded-2xl">
                <span class="text-xs font-semibold text-slate-400 uppercase">Alcance Mensual</span>
                <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1">112.5K</span>
                <span class="text-[11px] font-bold text-emerald-500">+14.8% vs mes ant.</span>
            </div>
            <div class="glass-panel p-5 rounded-2xl">
                <span class="text-xs font-semibold text-slate-400 uppercase">Impresiones</span>
                <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1">218.0K</span>
                <span class="text-[11px] font-bold text-emerald-500">+21.3%</span>
            </div>
            <div class="glass-panel p-5 rounded-2xl">
                <span class="text-xs font-semibold text-slate-400 uppercase">Interacciones</span>
                <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1">12.9K</span>
                <span class="text-[11px] font-bold text-emerald-500">+8.5%</span>
            </div>
            <div class="glass-panel p-5 rounded-2xl">
                <span class="text-xs font-semibold text-slate-400 uppercase">Engagement Promedio</span>
                <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1">4.65%</span>
                <span class="text-[11px] font-bold text-emerald-500">Saludable</span>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 glass-panel p-6 rounded-2xl">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">Crecimiento de Alcance e Impresiones</h3>
                <div class="h-64 w-full">
                    <canvas id="reachChart"></canvas>
                </div>
            </div>
            <div class="glass-panel p-6 rounded-2xl">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-4">Participación por Canal</h3>
                <div class="h-64 w-full flex items-center justify-center">
                    <canvas id="platformChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Published Reports List -->
        <div class="glass-panel p-6 rounded-2xl space-y-4">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Informes Mensuales Disponibles</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <?php foreach ($reports as $r): ?>
                    <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border flex items-center justify-between">
                        <div>
                            <h4 class="text-xs font-bold text-slate-900 dark:text-white"><?= htmlspecialchars($r['title']) ?></h4>
                            <p class="text-[11px] text-slate-400 mt-0.5">Período: <?= date('d/m/Y', strtotime($r['period_start'])) ?> - <?= date('d/m/Y', strtotime($r['period_end'])) ?></p>
                        </div>
                        <a href="reporte_detalle.php?id=<?= $r['id'] ?>" class="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold">
                            Ver Informe
                        </a>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</main>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        initDashboardCharts();
    });
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
