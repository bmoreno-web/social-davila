<?php
$pageTitle = 'Gestión de Usuarios y Roles';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

$user = Auth::requireAdminOrTeam();
$db = Database::getConnection();

// Fetch users with client details
$users = $db->query("SELECT u.*, c.name as client_name, c.logo as client_logo 
    FROM users u 
    LEFT JOIN clients c ON u.client_id = c.id 
    ORDER BY u.created_at DESC")->fetchAll();

$clients = $db->query("SELECT id, name FROM clients WHERE active = 1 ORDER BY name ASC")->fetchAll();

$adminCount = count(array_filter($users, fn($u) => $u['role'] === 'ADMIN'));
$teamCount = count(array_filter($users, fn($u) => $u['role'] === 'TEAM'));
$clientCount = count(array_filter($users, fn($u) => $u['role'] === 'CLIENT'));

require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';
?>

<main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
    <!-- Header -->
    <header class="h-16 glass-header sticky top-0 z-30 px-8 flex items-center justify-between">
        <div>
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">Gestión de Usuarios y Accesos</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Control de roles (ADMIN, TEAM, CLIENT), accesos y asignación de marcas</p>
        </div>
        <button onclick="openUserModal()" class="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center gap-2 transition-all">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>Nuevo Usuario</span>
        </button>
    </header>

    <div class="p-8 space-y-6">
        <!-- Quick Role Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div class="glass-panel p-5 rounded-2xl flex items-center justify-between">
                <div>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Administradores</span>
                    <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1"><?= $adminCount ?></span>
                    <span class="text-[11px] text-violet-500 font-medium">Acceso total al sistema</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                    <i data-lucide="shield-check" class="w-5 h-5"></i>
                </div>
            </div>

            <div class="glass-panel p-5 rounded-2xl flex items-center justify-between">
                <div>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Equipo / Analistas</span>
                    <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1"><?= $teamCount ?></span>
                    <span class="text-[11px] text-blue-500 font-medium">Gestión y reportes</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <i data-lucide="users" class="w-5 h-5"></i>
                </div>
            </div>

            <div class="glass-panel p-5 rounded-2xl flex items-center justify-between">
                <div>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Accesos Clientes</span>
                    <span class="block text-2xl font-black text-slate-900 dark:text-white mt-1"><?= $clientCount ?></span>
                    <span class="text-[11px] text-emerald-500 font-medium">Portal restringido</span>
                </div>
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <i data-lucide="building-2" class="w-5 h-5"></i>
                </div>
            </div>
        </div>

        <!-- Users Table -->
        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border">
            <div class="p-4 border-b border-slate-200 dark:border-dark-border flex items-center justify-between gap-4">
                <div class="relative flex-1 max-w-sm">
                    <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" id="searchUser" onkeyup="filterUsers()" placeholder="Buscar usuario por nombre o email..." 
                        class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-white">
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs" id="usersTable">
                    <thead class="bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-dark-border">
                        <tr>
                            <th class="px-6 py-3.5">Usuario</th>
                            <th class="px-6 py-3.5">Rol de Acceso</th>
                            <th class="px-6 py-3.5">Marca Asignada (Portal)</th>
                            <th class="px-6 py-3.5">Estado</th>
                            <th class="px-6 py-3.5">Fecha Creación</th>
                            <th class="px-6 py-3.5 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-dark-border">
                        <?php foreach ($users as $u): ?>
                            <tr class="hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors user-row">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                            <?= strtoupper(substr($u['name'], 0, 1)) ?>
                                        </div>
                                        <div>
                                            <span class="font-bold text-slate-900 dark:text-white block user-name"><?= htmlspecialchars($u['name']) ?></span>
                                            <span class="text-[11px] text-slate-500 dark:text-slate-400 user-email"><?= htmlspecialchars($u['email']) ?></span>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <?php if ($u['role'] === 'ADMIN'): ?>
                                        <span class="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">👑 Administrador</span>
                                    <?php elseif ($u['role'] === 'TEAM'): ?>
                                        <span class="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">👥 Equipo Davila</span>
                                    <?php else: ?>
                                        <span class="px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">🏢 Cliente Portal</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-6 py-4">
                                    <?php if (!empty($u['client_name'])): ?>
                                        <div class="flex items-center gap-2">
                                            <span class="font-medium text-slate-800 dark:text-slate-200"><?= htmlspecialchars($u['client_name']) ?></span>
                                        </div>
                                    <?php else: ?>
                                        <span class="text-slate-400 italic">Acceso Global</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-6 py-4">
                                    <button onclick="toggleUserActive('<?= $u['id'] ?>', <?= $u['active'] ? 0 : 1 ?>)" class="px-2.5 py-1 rounded-full text-[10px] font-bold <?= $u['active'] ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' ?> transition-colors">
                                        <?= $u['active'] ? '● ACTIVO' : '○ INACTIVO' ?>
                                    </button>
                                </td>
                                <td class="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                    <?= date('d/m/Y', strtotime($u['created_at'])) ?>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button onclick='editUser(<?= json_encode($u) ?>)' class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Editar Usuario">
                                            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                                        </button>
                                        <?php if ($u['id'] !== $user['id']): ?>
                                            <button onclick="deleteUser('<?= $u['id'] ?>', '<?= htmlspecialchars($u['name']) ?>')" class="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors" title="Eliminar Usuario">
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                            </button>
                                        <?php endif; ?>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<!-- User Modal (Create / Edit) -->
<div id="userModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-dark-border pb-3">
            <h3 id="userModalTitle" class="text-base font-bold text-slate-900 dark:text-white">Nuevo Usuario</h3>
            <button onclick="closeModal('userModal')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <form id="userForm" onsubmit="saveUser(event)" class="space-y-3">
            <input type="hidden" name="id" id="formUserId">
            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                <input type="text" name="name" id="formUserName" required class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                <input type="email" name="email" id="formUserEmail" required class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rol de Acceso</label>
                <select name="role" id="formUserRole" onchange="handleRoleChange(this.value)" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none">
                    <option value="ADMIN">👑 Administrador (Acceso total)</option>
                    <option value="TEAM">👥 Equipo / Analista Davila PM</option>
                    <option value="CLIENT">🏢 Cliente (Portal restringido)</option>
                </select>
            </div>

            <!-- Client select (only if CLIENT role) -->
            <div id="clientSelectContainer" class="hidden">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Asignar a Marca / Cliente</label>
                <select name="client_id" id="formUserClientId" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none">
                    <?php foreach ($clients as $cl): ?>
                        <option value="<?= $cl['id'] ?>"><?= htmlspecialchars($cl['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                <input type="password" name="password" id="formUserPassword" placeholder="Dejar en blanco para mantener actual" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none">
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-dark-border">
                <button type="button" onclick="closeModal('userModal')" class="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold">Guardar Usuario</button>
            </div>
        </form>
    </div>
</div>

<script>
function handleRoleChange(role) {
    const container = document.getElementById('clientSelectContainer');
    if (role === 'CLIENT') {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

function openUserModal() {
    document.getElementById('userForm').reset();
    document.getElementById('formUserId').value = '';
    document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
    handleRoleChange('ADMIN');
    openModal('userModal');
}

function editUser(user) {
    document.getElementById('formUserId').value = user.id;
    document.getElementById('formUserName').value = user.name;
    document.getElementById('formUserEmail').value = user.email;
    document.getElementById('formUserRole').value = user.role;
    document.getElementById('formUserPassword').value = '';
    if (user.client_id) {
        document.getElementById('formUserClientId').value = user.client_id;
    }
    handleRoleChange(user.role);
    document.getElementById('userModalTitle').textContent = 'Editar Usuario: ' + user.name;
    openModal('userModal');
}

async function saveUser(e) {
    e.preventDefault();
    const form = document.getElementById('userForm');
    const data = Object.fromEntries(new FormData(form).entries());
    data.action = 'save';

    try {
        const res = await fetch('api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showToast('Usuario guardado correctamente', 'success');
            setTimeout(() => location.reload(), 800);
        } else {
            showToast(result.error || 'Error al guardar', 'error');
        }
    } catch(err) {
        showToast('Error de conexión', 'error');
    }
}

async function toggleUserActive(id, newStatus) {
    try {
        const res = await fetch('api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_active', id, active: newStatus })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Estado actualizado', 'success');
            setTimeout(() => location.reload(), 500);
        }
    } catch(e) {}
}

async function deleteUser(id, name) {
    if (!confirm(`¿Estás seguro de eliminar el usuario "${name}"?`)) return;
    try {
        const res = await fetch('api/users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
        });
        const result = await res.json();
        if (result.success) {
            showToast('Usuario eliminado', 'success');
            setTimeout(() => location.reload(), 500);
        } else {
            showToast(result.error || 'Error', 'error');
        }
    } catch(e) {}
}

function filterUsers() {
    const input = document.getElementById('searchUser').value.toLowerCase();
    const rows = document.querySelectorAll('.user-row');
    rows.forEach(row => {
        const name = row.querySelector('.user-name').textContent.toLowerCase();
        const email = row.querySelector('.user-email').textContent.toLowerCase();
        if (name.includes(input) || email.includes(input)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
