<?php
$currentPage = basename($_SERVER['PHP_SELF']);
$isClient = $currentUser && $currentUser['role'] === 'CLIENT';
?>
<!-- Sidebar Navigation -->
<aside class="w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex flex-col flex-shrink-0 min-h-screen sticky top-0 transition-colors duration-200 z-40">
    <!-- Brand Logo -->
    <div class="h-16 flex items-center px-6 border-b border-slate-200 dark:border-dark-border gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white font-black text-lg tracking-wider">
            D
        </div>
        <div class="flex flex-col">
            <span class="font-bold text-base tracking-tight leading-none text-slate-900 dark:text-white">DAVILA PM</span>
            <span class="text-[10px] font-semibold tracking-widest text-violet-600 dark:text-violet-400 mt-0.5">SOCIAL SAAS</span>
        </div>
    </div>

    <!-- Navigation Items -->
    <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <?php if (!$isClient): ?>
            <a href="index.php" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all <?= $currentPage === 'index.php' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover hover:text-slate-900 dark:hover:text-white' ?>">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                <span>Dashboard</span>
            </a>

            <a href="clientes.php" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all <?= $currentPage === 'clientes.php' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover hover:text-slate-900 dark:hover:text-white' ?>">
                <i data-lucide="users" class="w-4 h-4"></i>
                <span>Clientes y Marcas</span>
            </a>

            <a href="reportes.php" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all <?= in_array($currentPage, ['reportes.php', 'reporte_detalle.php']) ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover hover:text-slate-900 dark:hover:text-white' ?>">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                <span>Reportes</span>
            </a>

            <a href="recomendaciones.php" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all <?= $currentPage === 'recomendaciones.php' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover hover:text-slate-900 dark:hover:text-white' ?>">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                <span>Recomendaciones</span>
            </a>

            <a href="auditoria.php" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all <?= $currentPage === 'auditoria.php' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover hover:text-slate-900 dark:hover:text-white' ?>">
                <i data-lucide="history" class="w-4 h-4"></i>
                <span>Auditoría</span>
            </a>
        <?php else: ?>
            <a href="portal.php" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all <?= $currentPage === 'portal.php' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-hover hover:text-slate-900 dark:hover:text-white' ?>">
                <i data-lucide="pie-chart" class="w-4 h-4"></i>
                <span>Portal Ejecutivo</span>
            </a>
        <?php endif; ?>
    </nav>

    <!-- Theme Switcher & User Profile Footer -->
    <div class="p-4 border-t border-slate-200 dark:border-dark-border space-y-3">
        <!-- Theme Toggle Button -->
        <button onclick="toggleTheme()" class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 transition-all">
            <span class="flex items-center gap-2">
                <i data-lucide="sun" class="theme-icon-sun w-4 h-4 text-amber-500"></i>
                <i data-lucide="moon" class="theme-icon-moon w-4 h-4 text-violet-400 hidden"></i>
                <span class="theme-text-label">Modo Claro</span>
            </span>
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Tema</span>
        </button>

        <!-- User Info -->
        <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    <?= strtoupper(substr($currentUser['name'] ?? 'U', 0, 1)) ?>
                </div>
                <div class="min-w-0">
                    <p class="text-xs font-semibold text-slate-900 dark:text-white truncate"><?= htmlspecialchars($currentUser['name'] ?? 'Usuario') ?></p>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate"><?= htmlspecialchars($currentUser['role'] ?? 'TEAM') ?></p>
                </div>
            </div>
            <a href="logout.php" title="Cerrar sesión" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                <i data-lucide="log-out" class="w-4 h-4"></i>
            </a>
        </div>
    </div>
</aside>
