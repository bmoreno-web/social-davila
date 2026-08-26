<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAuth();
$db = Database::getConnection();

$reportId = $_GET['id'] ?? null;
if (!$reportId) {
    header('Location: reportes.php');
    exit;
}

$stmt = $db->prepare("SELECT r.*, COALESCE(c.name, 'Marca General') as client_name, c.logo as client_logo, c.industry 
    FROM reports r 
    LEFT JOIN clients c ON r.client_id = c.id 
    WHERE r.id = ?");
$stmt->execute([$reportId]);
$report = $stmt->fetch();

if (!$report) {
    die("Reporte no encontrado");
}

// Check client permissions
if ($user['role'] === 'CLIENT' && $user['client_id'] !== $report['client_id']) {
    die("Acceso no autorizado");
}

// Fetch posts for this client
$stmt = $db->prepare("SELECT * FROM report_posts WHERE client_id = ? ORDER BY engagement_rate DESC LIMIT 6");
$stmt->execute([$report['client_id']]);
$posts = $stmt->fetchAll();

// Fetch recommendations for this client
$stmt = $db->prepare("SELECT * FROM recommendations WHERE client_id = ? ORDER BY priority ASC");
$stmt->execute([$report['client_id']]);
$recs = $stmt->fetchAll();

$pageTitle = $report['title'];
require_once __DIR__ . '/includes/header.php';
if ($user['role'] !== 'CLIENT') {
    require_once __DIR__ . '/includes/sidebar.php';
}
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-dark-bg min-h-screen">
    <!-- Action Bar -->
    <div class="px-8 py-4 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
        <div class="flex items-center gap-3">
            <a href="<?= $user['role'] === 'CLIENT' ? 'portal.php' : 'reportes.php' ?>" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                <i data-lucide="arrow-left" class="w-4 h-4"></i>
            </a>
            <div>
                <h1 class="text-base font-bold text-slate-900 dark:text-white"><?= htmlspecialchars($report['title']) ?></h1>
                <p class="text-xs text-slate-500 dark:text-slate-400"><?= htmlspecialchars($report['client_name']) ?> &bull; <?= date('d/m/Y', strtotime($report['period_start'])) ?> al <?= date('d/m/Y', strtotime($report['period_end'])) ?></p>
            </div>
        </div>

        <button onclick="window.print()" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
            <span>Imprimir / Exportar PDF</span>
        </button>
    </div>

    <div class="max-w-5xl mx-auto p-8 space-y-8 w-full">
        <!-- Executive Header Banner -->
        <div class="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-violet-500/30">
            <div class="flex items-center gap-5">
                <div class="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-dark-border shadow-lg bg-slate-800">
                    <?php if (!empty($report['client_logo'])): ?>
                        <img src="<?= htmlspecialchars($report['client_logo']) ?>" 
                             alt="<?= htmlspecialchars($report['client_name']) ?>" 
                             class="w-full h-full object-cover"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <?php endif; ?>
                    <div class="<?= empty($report['client_logo']) ? 'flex' : 'hidden' ?> w-full h-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 items-center justify-center text-white font-black text-xl">
                        <?= strtoupper(substr($report['client_name'], 0, 2)) ?>
                    </div>
                </div>
                <div>
                    <span class="text-xs uppercase font-bold text-violet-600 dark:text-violet-400 tracking-wider">Informe Ejecutivo Davila PM</span>
                    <h2 class="text-2xl font-black text-slate-900 dark:text-white mt-0.5"><?= htmlspecialchars($report['client_name']) ?></h2>
                    <p class="text-xs text-slate-500 dark:text-slate-400">Sector: <?= htmlspecialchars($report['industry'] ?? 'General') ?></p>
                </div>
            </div>
            <div class="text-right flex flex-col items-end">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">APROBADO &bull; PUBLICADO</span>
                <span class="text-[11px] text-slate-400 mt-2">Generado el <?= date('d/m/Y H:i', strtotime($report['created_at'])) ?></span>
            </div>
        </div>

        <!-- 4 Key Metrics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-panel p-4 rounded-2xl text-center">
                <span class="text-xs text-slate-400 uppercase font-semibold">Alcance Total</span>
                <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1">142.8K</span>
                <span class="text-[11px] font-bold text-emerald-500">+19.2%</span>
            </div>
            <div class="glass-panel p-4 rounded-2xl text-center">
                <span class="text-xs text-slate-400 uppercase font-semibold">Impresiones</span>
                <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1">289.4K</span>
                <span class="text-[11px] font-bold text-emerald-500">+25.8%</span>
            </div>
            <div class="glass-panel p-4 rounded-2xl text-center">
                <span class="text-xs text-slate-400 uppercase font-semibold">Interacciones</span>
                <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1">16.3K</span>
                <span class="text-[11px] font-bold text-emerald-500">+11.4%</span>
            </div>
            <div class="glass-panel p-4 rounded-2xl text-center">
                <span class="text-xs text-slate-400 uppercase font-semibold">Engagement Rate</span>
                <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1">4.95%</span>
                <span class="text-[11px] font-bold text-emerald-500">+0.8%</span>
            </div>
        </div>

        <!-- Editorial & Executive Analysis -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-panel p-6 rounded-2xl space-y-3">
                <div class="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold text-sm">
                    <i data-lucide="file-check" class="w-4 h-4"></i>
                    <span>Resumen Ejecutivo</span>
                </div>
                <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <?= nl2br(htmlspecialchars($report['executive_summary'] ?: 'Durante el presente período se observó una aceleración significativa en las interacciones orgánicas y el alcance global.')) ?>
                </p>
            </div>

            <div class="glass-panel p-6 rounded-2xl space-y-3">
                <div class="flex items-center gap-2 text-amber-500 font-bold text-sm">
                    <i data-lucide="sparkles" class="w-4 h-4"></i>
                    <span>Análisis Estratégico Davila PM</span>
                </div>
                <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <?= nl2br(htmlspecialchars($report['editorial_analysis'] ?: 'Recomendamos concentrar el presupuesto en formatos de video vertical de alto valor técnico y fortalecer la frecuencia en LinkedIn.')) ?>
                </p>
            </div>
        </div>

        <!-- Top Posts in Period -->
        <div class="glass-panel p-6 rounded-2xl space-y-4">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Top Publicaciones con Mayor Retorno e Interacción</h3>
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
                        <div class="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                            <p class="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed"><?= htmlspecialchars($p['caption'] ?? 'Publicación de contenido') ?></p>
                            <div class="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-dark-border">
                                <span class="flex items-center gap-1"><i data-lucide="heart" class="w-3 h-3 text-rose-500"></i> <?= number_format($p['likes'] ?? 0) ?></span>
                                <span class="text-violet-500"><?= $p['engagement_rate'] ?? 0 ?>% ER</span>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
