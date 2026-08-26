<?php
$pageTitle = 'Clientes y Marcas';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

// Fetch all clients
$clients = $db->query("SELECT c.*, 
    (SELECT COUNT(*) FROM report_posts p WHERE p.client_id = c.id) as posts_count,
    (SELECT COUNT(*) FROM recommendations r WHERE r.client_id = c.id) as recs_count
    FROM clients c ORDER BY c.created_at DESC")->fetchAll();

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <!-- Header -->
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Gestión de Clientes y Marcas</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Configuración de cuentas, accesos y credenciales de Metricool</p>
        </div>
        <button onclick="openClientModal()" class="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center gap-2 transition-all">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Nuevo Cliente</span>
        </button>
    </header>

    <div class="p-8 space-y-6">
        <!-- Client Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php foreach ($clients as $c): ?>
                <div class="glass-panel rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/40 transition-all duration-300 relative group">
                    <div>
                        <div class="flex items-start justify-between gap-4 mb-4">
                            <div class="flex items-center gap-3">
                                <img src="<?= htmlspecialchars($c['logo']) ?>" alt="Logo" class="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-dark-border shadow-sm">
                                <div>
                                    <h2 class="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                        <?= htmlspecialchars($c['name']) ?>
                                    </h2>
                                    <span class="text-xs font-medium text-violet-600 dark:text-violet-400">
                                        <?= htmlspecialchars($c['industry'] ?? 'General') ?>
                                    </span>
                                </div>
                            </div>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold <?= $c['active'] ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400' ?>">
                                <?= $c['active'] ? 'ACTIVO' : 'INACTIVO' ?>
                            </span>
                        </div>

                        <!-- Metricool Info Box -->
                        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border text-xs space-y-1.5 mb-4">
                            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                <span>Metricool Blog ID:</span>
                                <span class="font-mono font-bold text-slate-800 dark:text-slate-200"><?= htmlspecialchars($c['metricool_blog_id'] ?? 'No configurado') ?></span>
                            </div>
                            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                <span>Última Sincronización:</span>
                                <span class="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                                    <?= $c['last_sync_at'] ? date('d/m/Y H:i', strtotime($c['last_sync_at'])) : 'Nunca' ?>
                                </span>
                            </div>
                        </div>

                        <!-- Mini Stats -->
                        <div class="grid grid-cols-2 gap-2 text-center text-xs py-2 border-y border-slate-200 dark:border-dark-border mb-4">
                            <div>
                                <span class="block font-black text-slate-900 dark:text-white text-sm"><?= $c['posts_count'] ?></span>
                                <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Posts cargados</span>
                            </div>
                            <div>
                                <span class="block font-black text-slate-900 dark:text-white text-sm"><?= $c['recs_count'] ?></span>
                                <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Recomendaciones</span>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 pt-2">
                        <button onclick="triggerSync('<?= $c['id'] ?>', this)" class="flex-1 py-2 px-3 bg-violet-600/10 hover:bg-violet-600 hover:text-white text-violet-600 dark:text-violet-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all">
                            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                            <span>Sincronizar</span>
                        </button>
                        <button onclick='editClient(<?= json_encode($c) ?>)' class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <i data-lucide="settings" class="w-4 h-4"></i>
                        </button>
                        <a href="portal.php?client_id=<?= $c['id'] ?>" target="_blank" title="Ver como Cliente" class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <i data-lucide="external-link" class="w-4 h-4"></i>
                        </a>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</main>

<!-- Client Modal (Create / Edit) -->
<div id="clientModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-3">
            <h3 id="modalTitle" class="text-base font-bold text-slate-900 dark:text-white">Nuevo Cliente</h3>
            <button onclick="closeModal('clientModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <form id="clientForm" onsubmit="saveClient(event)" class="space-y-3">
            <input type="hidden" name="id" id="clientId">
            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre de la Marca</label>
                <input type="text" name="name" id="clientName" required class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-white">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Industria / Sector</label>
                    <input type="text" name="industry" id="clientIndustry" placeholder="Construcción, Alimentos..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-white">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL del Logo</label>
                    <input type="url" name="logo" id="clientLogo" placeholder="https://..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-white">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contacto Nombre</label>
                    <input type="text" name="contact_name" id="clientContactName" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-white">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contacto Email</label>
                    <input type="email" name="contact_email" id="clientContactEmail" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-white">
                </div>
            </div>

            <div class="p-3 bg-violet-500/5 rounded-xl border border-violet-500/20 space-y-2">
                <span class="text-xs font-bold text-violet-600 dark:text-violet-400 block">Configuración Metricool</span>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Metricool Blog ID</label>
                        <input type="text" name="metricool_blog_id" id="clientBlogId" placeholder="1284901" class="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Metricool User ID</label>
                        <input type="text" name="metricool_user_id" id="clientUserId" placeholder="94821" class="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white">
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-dark-border">
                <button type="button" onclick="closeModal('clientModal')" class="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold">Guardar Cliente</button>
            </div>
        </form>
    </div>
</div>

<script>
function openClientModal() {
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    document.getElementById('modalTitle').textContent = 'Nuevo Cliente';
    openModal('clientModal');
}

function editClient(client) {
    document.getElementById('clientId').value = client.id;
    document.getElementById('clientName').value = client.name;
    document.getElementById('clientIndustry').value = client.industry || '';
    document.getElementById('clientLogo').value = client.logo || '';
    document.getElementById('clientContactName').value = client.contact_name || '';
    document.getElementById('clientContactEmail').value = client.contact_email || '';
    document.getElementById('clientBlogId').value = client.metricool_blog_id || '';
    document.getElementById('clientUserId').value = client.metricool_user_id || '';
    document.getElementById('modalTitle').textContent = 'Editar Cliente: ' + client.name;
    openModal('clientModal');
}

async function saveClient(e) {
    e.preventDefault();
    const form = document.getElementById('clientForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('api/clients.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('Cliente guardado exitosamente', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            showToast(result.error || 'Error al guardar cliente', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
