<?php
$pageTitle = 'Ajustes y Conexiones API';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

$geminiKey = Database::getSetting('gemini_api_key', defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '');
$metricoolKey = Database::getSetting('metricool_api_key', defined('METRICOOL_API_KEY') ? METRICOOL_API_KEY : '');
$agencyName = Database::getSetting('agency_name', 'DAVILA PM SOCIAL');

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <!-- Header -->
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Ajustes e Integraciones del Sistema</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Configuración de Inteligencia Artificial (Gemini), Metricool y diagnósticos</p>
        </div>
    </header>

    <div class="max-w-4xl p-8 space-y-6">
        <!-- 1. GOOGLE GEMINI AI CONFIGURATION BOX -->
        <div class="glass-panel p-6 rounded-3xl space-y-5 border-violet-500/30 relative overflow-hidden group">
            <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 text-lg">
                        ✨
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h2 class="text-base font-bold text-slate-900 dark:text-white">Motor de Inteligencia Artificial (Google Gemini)</h2>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                Gemini 1.5 Flash
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Genera resúmenes ejecutivos y análisis editoriales cuantitativos basados en las métricas reales de tus clientes.
                        </p>
                    </div>
                </div>
            </div>

            <form id="geminiForm" onsubmit="saveSettings(event)" class="space-y-4 pt-2">
                <div>
                    <div class="flex items-center justify-between mb-1.5">
                        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Google Gemini API Key
                        </label>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                            <span>Obtener API Key Gratis en Google AI Studio</span>
                            <i data-lucide="external-link" class="w-3 h-3"></i>
                        </a>
                    </div>
                    <div class="relative">
                        <input type="password" name="gemini_api_key" id="geminiApiKey" value="<?= htmlspecialchars($geminiKey) ?>" placeholder="AIzaSy..." 
                            class="w-full pl-4 pr-24 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none">
                        <button type="button" onclick="togglePasswordVisibility('geminiApiKey', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-semibold px-2 py-1">
                            Ver
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-2">
                    <div id="geminiTestStatus" class="text-xs font-medium text-slate-500">
                        <?= !empty($geminiKey) ? '<span class="text-emerald-500 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Clave configurada</span>' : '<span class="text-amber-500 font-medium">Sin clave (Usa motor estadístico interno)</span>' ?>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" id="btnTestGemini" onclick="testGeminiConnection()" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all">
                            <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i>
                            <span>Probar Conexión</span>
                        </button>
                        <button type="submit" class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center gap-1.5 transition-all">
                            <i data-lucide="save" class="w-3.5 h-3.5"></i>
                            <span>Guardar Clave</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- 2. METRICOOL OFFICIAL API CONFIGURATION -->
        <div class="glass-panel p-6 rounded-3xl space-y-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-lg">
                        📊
                    </div>
                    <div>
                        <h2 class="text-base font-bold text-slate-900 dark:text-white">API Oficial de Metricool</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sincronización de publicaciones, métricas y analítica social</p>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Conectado
                </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border text-xs space-y-1">
                    <span class="text-slate-400 font-semibold block">Endpoint Base API:</span>
                    <code class="font-mono text-violet-600 dark:text-violet-400 font-bold"><?= METRICOOL_API_BASE_URL ?></code>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border text-xs space-y-1">
                    <span class="text-slate-400 font-semibold block">Zona Horaria Oficial:</span>
                    <span class="font-bold text-slate-800 dark:text-slate-200">America/Bogota (UTC-5)</span>
                </div>
            </div>
        </div>

        <!-- 3. SYSTEM & ENVIRONMENT DIAGNOSTICS -->
        <div class="glass-panel p-6 rounded-3xl space-y-4">
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Diagnóstico del Servidor y Entorno</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Versión PHP</span>
                    <span class="block text-lg font-black text-slate-900 dark:text-white mt-1"><?= phpversion() ?></span>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Motor Base de Datos</span>
                    <span class="block text-lg font-black text-slate-900 dark:text-white mt-1">SQLite 3 (PDO)</span>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Tema por Defecto</span>
                    <span class="block text-lg font-black text-violet-500 mt-1">Dark Mode</span>
                </div>
                <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-dark-border">
                    <span class="text-[11px] text-slate-400 uppercase font-semibold">Versión SaaS</span>
                    <span class="block text-lg font-black text-emerald-500 mt-1"><?= APP_VERSION ?></span>
                </div>
            </div>
        </div>
    </div>
</main>

<script>
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Ocultar';
    } else {
        input.type = 'password';
        btn.textContent = 'Ver';
    }
}

async function saveSettings(e) {
    e.preventDefault();
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    
    try {
        const res = await fetch('api/settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save', gemini_api_key: apiKey })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Clave de Gemini guardada correctamente', 'success');
            document.getElementById('geminiTestStatus').innerHTML = '<span class="text-emerald-500 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Clave configurada</span>';
        } else {
            showToast(result.error || 'Error al guardar', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

async function testGeminiConnection() {
    const apiKey = document.getElementById('geminiApiKey').value.trim();
    const statusDiv = document.getElementById('geminiTestStatus');
    const btn = document.getElementById('btnTestGemini');

    if (!apiKey) {
        showToast('Ingresa una clave API de Gemini primero', 'error');
        return;
    }

    btn.disabled = true;
    const origHtml = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Probando...`;

    try {
        const res = await fetch('api/settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'test_gemini', gemini_api_key: apiKey })
        });
        const result = await res.json();
        if (result.success) {
            showToast(result.message, 'success');
            statusDiv.innerHTML = '<span class="text-emerald-500 font-bold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ✨ Gemini 1.5 Flash Conectado y Verificado</span>';
        } else {
            showToast(result.error || 'Error al conectar con Gemini', 'error');
            statusDiv.innerHTML = `<span class="text-rose-500 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-500"></span> ${result.error}</span>`;
        }
    } catch(err) {
        showToast('Error al conectar con el servidor', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = origHtml;
    }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
