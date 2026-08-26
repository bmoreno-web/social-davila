/**
 * Davila PM Social - Main Interactive Application Script
 */

// Toast notifications
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
                    type === 'error' ? 'bg-rose-600 border-rose-500 text-white' : 
                    'bg-indigo-600 border-indigo-500 text-white';

    toast.className = `pointer-events-auto px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0 ${bgClass}`;
    toast.innerHTML = `
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${type === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' : 
              type === 'error' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' : 
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'}
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Modal helper
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Metricool Synchronizer
async function triggerSync(clientId, btnElement = null) {
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = `<svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Sincronizando...`;
    }

    try {
        const res = await fetch(`api/metricool.php?action=sync&client_id=${clientId}`);
        const data = await res.json();
        if (data.success) {
            showToast(`Sincronización con Metricool completada: ${data.items_synced} publicaciones actualizadas`, 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast(data.error || 'Error al sincronizar con Metricool', 'error');
        }
    } catch (e) {
        showToast('Error de red al conectar con Metricool', 'error');
    } finally {
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = `Sincronizar Metricool`;
        }
    }
}

// Update recommendation status
async function updateRecStatus(recId, newStatus) {
    try {
        const res = await fetch('api/recommendations.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: recId, status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Estado de la recomendación actualizado', 'success');
            setTimeout(() => location.reload(), 800);
        } else {
            showToast(data.error || 'Error al actualizar', 'error');
        }
    } catch (e) {
        showToast('Error al conectar con el servidor', 'error');
    }
}
