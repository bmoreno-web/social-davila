<?php
$pageTitle = 'Informes y Reportes';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

// Fetch reports with client data
$reports = $db->query("SELECT r.*, c.name as client_name, c.logo as client_logo 
    FROM reports r 
    JOIN clients c ON r.client_id = c.id 
    ORDER BY r.created_at DESC")->fetchAll();

$clients = $db->query("SELECT * FROM clients WHERE active = 1 ORDER BY name ASC")->fetchAll();

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Informes y Reportes de Rendimiento</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Generación y seguimiento de reportes ejecutivos periódicos</p>
        </div>
        <button onclick="openModal('createReportModal')" class="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center gap-2 transition-all">
            <i data-lucide="file-plus" class="w-4 h-4"></i>
            <span>Generar Nuevo Reporte</span>
        </button>
    </header>

    <div class="p-8 space-y-6">
        <?php if (empty($reports)): ?>
            <div class="glass-panel p-12 text-center rounded-2xl">
                <i data-lucide="file-text" class="w-12 h-12 text-slate-400 mx-auto mb-3"></i>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">No hay reportes generados aún</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Crea un informe periódico seleccionando un cliente y el rango de fechas a analizar.</p>
                <button onclick="openModal('createReportModal')" class="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold">Crear Primer Reporte</button>
            </div>
        <?php else: ?>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <?php foreach ($reports as $r): ?>
                    <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-violet-500/40 transition-all duration-300">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase <?= $r['status'] === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500' ?>">
                                    <?= $r['status'] === 'PUBLISHED' ? 'PUBLICADO' : 'BORRADOR' ?>
                                </span>
                                <span class="text-xs text-slate-400"><?= date('d/m/Y', strtotime($r['created_at'])) ?></span>
                            </div>

                            <h2 class="text-base font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                <?= htmlspecialchars($r['title']) ?>
                            </h2>
                            <p class="text-xs text-violet-600 dark:text-violet-400 font-semibold mb-3">
                                <?= htmlspecialchars($r['client_name']) ?>
                            </p>

                            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                                <?= htmlspecialchars($r['executive_summary'] ?? 'Sin resumen ejecutivo generado.') ?>
                            </p>

                            <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
                                <span>Período evaluado:</span>
                                <span class="font-bold text-slate-900 dark:text-white">
                                    <?= date('d/m', strtotime($r['period_start'])) ?> - <?= date('d/m/Y', strtotime($r['period_end'])) ?>
                                </span>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-slate-200 dark:border-dark-border mt-4 flex items-center justify-between">
                            <a href="reporte_detalle.php?id=<?= $r['id'] ?>" class="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                                <span>Ver Informe Completo</span>
                                <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                            </a>
                            <button onclick="window.print()" class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <i data-lucide="printer" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</main>

<!-- Create Report Modal -->
<div id="createReportModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Crear Informe Periódico</h3>
            <button onclick="closeModal('createReportModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <form id="createReportForm" onsubmit="saveNewReport(event)" class="space-y-3">
            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cliente / Marca</label>
                <select name="client_id" required class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                    <?php foreach ($clients as $c): ?>
                        <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título del Reporte</label>
                <input type="text" name="title" required placeholder="Informe Mensual de Rendimiento - Agosto 2026" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha Inicio</label>
                    <input type="date" name="period_start" required value="<?= date('Y-m-01') ?>" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fecha Fin</label>
                    <input type="date" name="period_end" required value="<?= date('Y-m-d') ?>" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resumen Ejecutivo</label>
                <textarea name="executive_summary" rows="3" placeholder="Resumen clave de los resultados del mes..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"></textarea>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Análisis Editorial Davila PM</label>
                <textarea name="editorial_analysis" rows="3" placeholder="Diagnóstico estratégico y oportunidades de optimización..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-dark-border">
                <button type="button" onclick="closeModal('createReportModal')" class="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold">Generar Reporte</button>
            </div>
        </form>
    </div>
</div>

<script>
async function saveNewReport(e) {
    e.preventDefault();
    const formData = new FormData(document.getElementById('createReportForm'));
    const data = Object.fromEntries(formData.entries());
    
    try {
        const res = await fetch('api/reports.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('Informe creado con éxito', 'success');
            setTimeout(() => location.reload(), 800);
        } else {
            showToast(result.error || 'Error al crear el informe', 'error');
        }
    } catch(e) {
        showToast('Error de conexión', 'error');
    }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
