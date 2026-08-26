<?php
$pageTitle = 'Dashboard Ejecutivo';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

// Fetch summary metrics
$clientCount = $db->query("SELECT COUNT(*) FROM clients WHERE active = 1")->fetchColumn();
$reportCount = $db->query("SELECT COUNT(*) FROM reports")->fetchColumn();
$postCount = $db->query("SELECT COUNT(*) FROM report_posts")->fetchColumn();
$recCount = $db->query("SELECT COUNT(*) FROM recommendations WHERE status = 'PENDIENTE'")->fetchColumn();

// Fetch clients for dropdown filter
$clients = $db->query("SELECT * FROM clients WHERE active = 1 ORDER BY name ASC")->fetchAll();

// Selected client filter
$selectedClientId = $_GET['client_id'] ?? ($clients[0]['id'] ?? null);
$selectedClient = null;
if ($selectedClientId) {
    $stmt = $db->prepare("SELECT * FROM clients WHERE id = ?");
    $stmt->execute([$selectedClientId]);
    $selectedClient = $stmt->fetch();
}

// Fetch posts for selected client
$posts = [];
if ($selectedClientId) {
    $stmt = $db->prepare("SELECT * FROM report_posts WHERE client_id = ? ORDER BY published_at DESC LIMIT 6");
    $stmt->execute([$selectedClientId]);
    $posts = $stmt->fetchAll();
}

// Fetch recent recommendations
$recommendations = [];
if ($selectedClientId) {
    $stmt = $db->prepare("SELECT * FROM recommendations WHERE client_id = ? ORDER BY created_at DESC LIMIT 4");
    $stmt->execute([$selectedClientId]);
    $recommendations = $stmt->fetchAll();
}

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<!-- Main Content Area -->
<main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <!-- Top Header Bar -->
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Panel de Control General</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Analítica global y rendimiento de redes sociales</p>
        </div>

        <div class="flex items-center gap-3">
            <!-- Client Selector Dropdown -->
            <form method="GET" action="index.php" class="flex items-center gap-2">
                <select name="client_id" onchange="this.form.submit()" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none shadow-sm cursor-pointer">
                    <?php foreach ($clients as $c): ?>
                        <option value="<?= $c['id'] ?>" <?= $c['id'] === $selectedClientId ? 'selected' : '' ?>>
                            🏢 <?= htmlspecialchars($c['name']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </form>

            <?php if ($selectedClient): ?>
                <button onclick="triggerSync('<?= $selectedClient['id'] ?>', this)" class="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center gap-2 transition-all">
                    <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                    <span>Sincronizar Metricool</span>
                </button>
            <?php endif; ?>
        </div>
    </header>

    <!-- Dashboard Content Container -->
    <div class="p-8 space-y-8">
        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <!-- Card 1: Reach -->
            <div class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-violet-500/40 transition-all duration-300">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alcance Total</span>
                    <div class="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-black text-slate-900 dark:text-white">128.4K</span>
                    <span class="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                        <i data-lucide="arrow-up-right" class="w-3 h-3"></i> +18.4%
                    </span>
                </div>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Comparado con los 30 días anteriores</p>
            </div>

            <!-- Card 2: Impressions -->
            <div class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Impresiones</span>
                    <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <i data-lucide="layers" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-black text-slate-900 dark:text-white">245.9K</span>
                    <span class="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                        <i data-lucide="arrow-up-right" class="w-3 h-3"></i> +24.1%
                    </span>
                </div>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Frecuencia promedio de 1.9x</p>
            </div>

            <!-- Card 3: Interactions -->
            <div class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interacciones</span>
                    <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <i data-lucide="heart" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-black text-slate-900 dark:text-white">14.8K</span>
                    <span class="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                        <i data-lucide="arrow-up-right" class="w-3 h-3"></i> +9.2%
                    </span>
                </div>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Likes, comentarios, guardados y shares</p>
            </div>

            <!-- Card 4: Engagement Rate -->
            <div class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-pink-500/40 transition-all duration-300">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Engagement Rate</span>
                    <div class="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                        <i data-lucide="trending-up" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-black text-slate-900 dark:text-white">4.82%</span>
                    <span class="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                        <i data-lucide="arrow-up-right" class="w-3 h-3"></i> +0.6%
                    </span>
                </div>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-2">Tasa superior al promedio de industria</p>
            </div>
        </div>

        <!-- Charts Section (2 Columns) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Trend Chart -->
            <div class="lg:col-span-2 glass-panel p-6 rounded-2xl">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-base font-bold text-slate-900 dark:text-white">Evolución de Alcance e Impresiones</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Datos consolidados de publicaciones y pauta</p>
                    </div>
                    <span class="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 font-semibold">Últimos 30 días</span>
                </div>
                <div class="h-72 w-full">
                    <canvas id="reachChart"></canvas>
                </div>
            </div>

            <!-- Platform Breakdown Doughnut -->
            <div class="glass-panel p-6 rounded-2xl flex flex-col">
                <div class="mb-4">
                    <h2 class="text-base font-bold text-slate-900 dark:text-white">Desglose por Plataforma</h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Distribución porcentual de interacción</p>
                </div>
                <div class="h-60 w-full flex-1 flex items-center justify-center">
                    <canvas id="platformChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Top Posts Gallery & Recommendations -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Best Performing Posts -->
            <div class="lg:col-span-2 glass-panel p-6 rounded-2xl">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-base font-bold text-slate-900 dark:text-white">Publicaciones Destacadas</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Contenido con mayor interacción del período</p>
                    </div>
                    <a href="reportes.php" class="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">Ver todos los reportes →</a>
                </div>

                <?php if (empty($posts)): ?>
                    <div class="text-center py-12 border border-dashed border-slate-200 dark:border-dark-border rounded-xl">
                        <i data-lucide="cloud-download" class="w-10 h-10 text-slate-400 mx-auto mb-2"></i>
                        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">No hay publicaciones cargadas para esta marca.</p>
                        <button onclick="triggerSync('<?= $selectedClientId ?>', this)" class="mt-3 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold">
                            Sincronizar ahora con Metricool
                        </button>
                    </div>
                <?php else: ?>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <?php foreach ($posts as $p): ?>
                            <?php 
                                $imgUrl = !empty($p['media_url']) ? $p['media_url'] : (!empty($p['thumbnail_url']) ? $p['thumbnail_url'] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80');
                            ?>
                            <div class="bg-slate-50 dark:bg-slate-900/60 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-border flex flex-col group hover:border-violet-500/40 transition-all">
                                <div class="h-36 relative overflow-hidden bg-slate-800">
                                    <img src="<?= htmlspecialchars($imgUrl) ?>" 
                                         alt="Post Thumbnail" 
                                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';">
                                    <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/60 text-white backdrop-blur">
                                        <?= htmlspecialchars($p['platform'] ?? 'INSTAGRAM') ?>
                                    </span>
                                    <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-600 text-white">
                                        <?= htmlspecialchars($p['post_type'] ?? 'Post') ?>
                                    </span>
                                </div>
                                <div class="p-3.5 flex-1 flex flex-col justify-between">
                                    <p class="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                                        <?= htmlspecialchars($p['caption']) ?>
                                    </p>
                                    <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-dark-border">
                                        <span class="flex items-center gap-1"><i data-lucide="heart" class="w-3 h-3 text-rose-500"></i> <?= number_format($p['likes']) ?></span>
                                        <span class="flex items-center gap-1"><i data-lucide="message-circle" class="w-3 h-3 text-blue-500"></i> <?= number_format($p['comments']) ?></span>
                                        <span class="text-violet-500 font-bold"><?= $p['engagement_rate'] ?>% ER</span>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Recent Recommendations -->
            <div class="glass-panel p-6 rounded-2xl flex flex-col">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h2 class="text-base font-bold text-slate-900 dark:text-white">Recomendaciones Davila</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Estrategias y optimizaciones</p>
                    </div>
                    <a href="recomendaciones.php" class="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline">Ver tablero</a>
                </div>

                <div class="space-y-3 flex-1 overflow-y-auto">
                    <?php if (empty($recommendations)): ?>
                        <p class="text-xs text-slate-400 text-center py-8">Sin recomendaciones pendientes.</p>
                    <?php else: ?>
                        <?php foreach ($recommendations as $rec): ?>
                            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-dark-border space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                        <?= htmlspecialchars($rec['category']) ?>
                                    </span>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded <?= $rec['priority'] === 'ALTA' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500' ?>">
                                        <?= htmlspecialchars($rec['priority']) ?>
                                    </span>
                                </div>
                                <h3 class="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                                    <?= htmlspecialchars($rec['title']) ?>
                                </h3>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                    <?= htmlspecialchars($rec['description']) ?>
                                </p>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
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
