<?php
$pageTitle = 'Registro de Auditoría';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

$logs = $db->query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50")->fetchAll();

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Registro de Auditoría y Seguridad</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Trazabilidad de acciones, sincronizaciones y accesos de usuarios</p>
        </div>
    </header>

    <div class="p-8">
        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-dark-border">
                        <tr>
                            <th class="px-6 py-3.5">Fecha y Hora</th>
                            <th class="px-6 py-3.5">Usuario</th>
                            <th class="px-6 py-3.5">Acción</th>
                            <th class="px-6 py-3.5">Recurso</th>
                            <th class="px-6 py-3.5">Detalles</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-dark-border">
                        <?php foreach ($logs as $l): ?>
                            <tr class="hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors">
                                <td class="px-6 py-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                    <?= date('d/m/Y H:i:s', strtotime($l['created_at'])) ?>
                                </td>
                                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                    <?= htmlspecialchars($l['user_name'] ?? 'Sistema') ?>
                                    <span class="block text-[10px] text-slate-400"><?= htmlspecialchars($l['user_email'] ?? '') ?></span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                        <?= htmlspecialchars($l['action']) ?>
                                    </span>
                                </td>
                                <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                    <?= htmlspecialchars($l['resource_type']) ?>
                                </td>
                                <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                                    <?= htmlspecialchars($l['details'] ?? '-') ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
