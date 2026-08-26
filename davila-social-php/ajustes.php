<?php
$pageTitle = 'Configuración y Ajustes';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

$pageTitle = 'Ajustes del Sistema';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Ajustes y Conexiones del Sistema</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Configuración de API de Metricool, entorno y diagnóstico técnico</p>
        </div>
    </header>

    <div class="max-w-4xl p-8 space-y-6">
        <!-- Metricool API Box -->
        <div class="glass-panel p-6 rounded-2xl space-y-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                        API
                    </div>
                    <div>
                        <h2 class="text-base font-bold text-slate-900 dark:text-white">Integración Oficial Metricool API v2</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400">Motor de extracción de métricas, publicaciones y audiencias</p>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Conectado &bull; Operativo
                </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border text-xs space-y-1">
                    <span class="text-slate-400 font-semibold block">Endpoint Base:</span>
                    <code class="font-mono text-violet-600 dark:text-violet-400 font-bold"><?= METRICOOL_API_BASE_URL ?></code>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border text-xs space-y-1">
                    <span class="text-slate-400 font-semibold block">Zona Horaria:</span>
                    <span class="font-bold text-slate-800 dark:text-slate-200">America/Bogota (UTC-5)</span>
                </div>
            </div>
        </div>

        <!-- System Diagnostics Box -->
        <div class="glass-panel p-6 rounded-2xl space-y-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Diagnóstico del Servidor y Entorno</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Versión PHP</span>
                    <span class="block text-lg font-black text-slate-900 dark:text-white mt-1"><?= phpversion() ?></span>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Motor BD</span>
                    <span class="block text-lg font-black text-slate-900 dark:text-white mt-1">SQLite 3 (PDO)</span>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Modo Tema</span>
                    <span class="block text-lg font-black text-violet-500 mt-1">Dark (Default)</span>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Versión App</span>
                    <span class="block text-lg font-black text-emerald-500 mt-1"><?= APP_VERSION ?></span>
                </div>
            </div>
        </div>
    </div>
</main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
