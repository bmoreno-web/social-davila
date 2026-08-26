<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

if (Auth::check()) {
    $user = Auth::user();
    if ($user && $user['role'] === 'CLIENT') {
        header('Location: portal.php');
    } else {
        header('Location: index.php');
    }
    exit;
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $result = Auth::login($email, $password);
    if ($result['success']) {
        if ($result['user']['role'] === 'CLIENT') {
            header('Location: portal.php');
        } else {
            header('Location: index.php');
        }
        exit;
    } else {
        $error = $result['error'];
    }
}
?>
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión | <?= APP_NAME ?></title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        dark: { bg: '#0b0f19', card: '#111827', border: '#1f2937' }
                    }
                }
            }
        }
    </script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="assets/css/custom.css">
    <script src="assets/js/theme.js"></script>
</head>
<body class="bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background Glow Effects -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Theme Switcher floating top right -->
    <div class="absolute top-5 right-5 z-20">
        <button onclick="toggleTheme()" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm hover:scale-105 transition-all">
            <i data-lucide="sun" class="theme-icon-sun w-4 h-4 text-amber-500"></i>
            <i data-lucide="moon" class="theme-icon-moon w-4 h-4 text-violet-400 hidden"></i>
            <span class="theme-text-label">Modo Claro</span>
        </button>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-8 shadow-2xl relative z-10">
        <!-- Logo & Header -->
        <div class="text-center mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-violet-600/30 mx-auto mb-4">
                D
            </div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white">DAVILA PM SOCIAL</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Plataforma de Analítica y Gestión de Redes Sociales</p>
        </div>

        <?php if ($error): ?>
            <div class="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-3">
                <i data-lucide="alert-circle" class="w-5 h-5 flex-shrink-0"></i>
                <span><?= htmlspecialchars($error) ?></span>
            </div>
        <?php endif; ?>

        <!-- Form -->
        <form method="POST" action="login.php" class="space-y-4">
            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Correo Electrónico</label>
                <div class="relative">
                    <i data-lucide="mail" class="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="email" name="email" id="inputEmail" required placeholder="admin@davila.com" 
                        class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all">
                </div>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Contraseña</label>
                <div class="relative">
                    <i data-lucide="lock" class="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="password" name="password" id="inputPassword" required placeholder="••••••••" 
                        class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 transition-all">
                </div>
            </div>

            <button type="submit" class="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-violet-600/30 transition-all transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2">
                <span>Ingresar al Sistema</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </form>

        <!-- 1-Click Demo Credentials Quick Fill -->
        <div class="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 text-center uppercase tracking-wider">Acceso Rápido de Prueba</p>
            <div class="grid grid-cols-2 gap-2">
                <button type="button" onclick="fillCreds('admin@davila.com', 'admin123456')" class="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 text-slate-700 dark:text-slate-300 transition-colors text-center border border-slate-200 dark:border-slate-700">
                    👑 Admin / Equipo
                </button>
                <button type="button" onclick="fillCreds('cliente@acesco.com', 'cliente123')" class="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 text-slate-700 dark:text-slate-300 transition-colors text-center border border-slate-200 dark:border-slate-700">
                    🏢 Portal Cliente
                </button>
            </div>
        </div>
    </div>

    <script>
        lucide.createIcons();
        function fillCreds(email, pw) {
            document.getElementById('inputEmail').value = email;
            document.getElementById('inputPassword').value = pw;
        }
    </script>
</body>
</html>
