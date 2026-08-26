<?php
$pageTitle = 'Tablero de Recomendaciones';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

$clients = $db->query("SELECT * FROM clients WHERE active = 1 ORDER BY name ASC")->fetchAll();
$selectedClientId = $_GET['client_id'] ?? null;

$query = "SELECT r.*, c.name as client_name FROM recommendations r JOIN clients c ON r.client_id = c.id";
if ($selectedClientId) {
    $query .= " WHERE r.client_id = " . $db->quote($selectedClientId);
}
$query .= " ORDER BY r.created_at DESC";
$recommendations = $db->query($query)->fetchAll();

$pendientes = array_filter($recommendations, fn($r) => $r['status'] === 'PENDIENTE');
$enProgreso = array_filter($recommendations, fn($r) => $r['status'] === 'EN_PROGRESO');
$implementadas = array_filter($recommendations, fn($r) => $r['status'] === 'IMPLEMENTADA');

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Tablero de Recomendaciones Estratégicas</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Seguimiento de optimizaciones de contenido, pauta y formato</p>
        </div>

        <div class="flex items-center gap-3">
            <form method="GET" action="recomendaciones.php">
                <select name="client_id" onchange="this.form.submit()" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200">
                    <option value="">Todas las Marcas</option>
                    <?php foreach ($clients as $c): ?>
                        <option value="<?= $c['id'] ?>" <?= $c['id'] === $selectedClientId ? 'selected' : '' ?>><?= htmlspecialchars($c['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </form>

            <button onclick="openModal('createRecModal')" class="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center gap-2">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Nueva Recomendación</span>
            </button>
        </div>
    </header>

    <div class="p-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Column: Pendiente -->
            <div class="space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-amber-500/30">
                    <span class="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span> Pendientes (<?= count($pendientes) ?>)
                    </span>
                </div>
                <div class="space-y-3">
                    <?php foreach ($pendientes as $r): ?>
                        <?php include __DIR__ . '/includes/rec_card.php'; ?>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Column: En Progreso -->
            <div class="space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-blue-500/30">
                    <span class="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span> En Progreso (<?= count($enProgreso) ?>)
                    </span>
                </div>
                <div class="space-y-3">
                    <?php foreach ($enProgreso as $r): ?>
                        <?php include __DIR__ . '/includes/rec_card.php'; ?>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Column: Implementada -->
            <div class="space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                    <span class="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Implementadas (<?= count($implementadas) ?>)
                    </span>
                </div>
                <div class="space-y-3">
                    <?php foreach ($implementadas as $r): ?>
                        <?php include __DIR__ . '/includes/rec_card.php'; ?>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Create Modal -->
<div id="createRecModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Nueva Recomendación Estratégica</h3>
            <button onclick="closeModal('createRecModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <form onsubmit="saveRec(event)" class="space-y-3">
            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cliente / Marca</label>
                <select name="client_id" id="recClientId" required class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                    <?php foreach ($clients as $c): ?>
                        <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                    <select name="category" id="recCategory" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                        <option value="CONTENIDO">CONTENIDO</option>
                        <option value="PAUTA">PAUTA</option>
                        <option value="ESTRATEGIA">ESTRATEGIA</option>
                        <option value="FORMATO">FORMATO</option>
                        <option value="OPTIMIZACION">OPTIMIZACIÓN</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
                    <select name="priority" id="recPriority" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
                        <option value="ALTA">ALTA</option>
                        <option value="MEDIA">MEDIA</option>
                        <option value="BAJA">BAJA</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título de la Recomendación</label>
                <input type="text" name="title" id="recTitle" required placeholder="Ej: Potenciar formato Reels en Instagram" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descripción / Justificación</label>
                <textarea name="description" id="recDesc" rows="3" required placeholder="Explicación detallada del por qué y cómo implementarla..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-dark-border">
                <button type="button" onclick="closeModal('createRecModal')" class="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold">Guardar</button>
            </div>
        </form>
    </div>
</div>

<script>
async function saveRec(e) {
    e.preventDefault();
    const data = {
        action: 'create',
        client_id: document.getElementById('recClientId').value,
        category: document.getElementById('recCategory').value,
        priority: document.getElementById('recPriority').value,
        title: document.getElementById('recTitle').value,
        description: document.getElementById('recDesc').value
    };

    try {
        const res = await fetch('api/recommendations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('Recomendación creada', 'success');
            setTimeout(() => location.reload(), 600);
        } else {
            showToast(result.error || 'Error', 'error');
        }
    } catch(err) {
        showToast('Error de conexión', 'error');
    }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
