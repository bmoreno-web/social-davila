<div class="glass-panel p-4 rounded-xl space-y-2 border border-slate-200 dark:border-dark-border hover:border-violet-500/40 transition-all">
    <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <?= htmlspecialchars($r['category']) ?>
        </span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded <?= $r['priority'] === 'ALTA' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500' ?>">
            <?= htmlspecialchars($r['priority']) ?>
        </span>
    </div>

    <h4 class="text-xs font-bold text-slate-900 dark:text-white leading-snug">
        <?= htmlspecialchars($r['title']) ?>
    </h4>

    <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3">
        <?= htmlspecialchars($r['description']) ?>
    </p>

    <div class="pt-2 border-t border-slate-200 dark:border-dark-border flex items-center justify-between">
        <span class="text-[10px] text-slate-400"><?= htmlspecialchars($r['client_name']) ?></span>
        
        <!-- Status Switcher -->
        <select onchange="updateRecStatus('<?= $r['id'] ?>', this.value)" class="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none">
            <option value="PENDIENTE" <?= $r['status'] === 'PENDIENTE' ? 'selected' : '' ?>>Pendiente</option>
            <option value="EN_PROGRESO" <?= $r['status'] === 'EN_PROGRESO' ? 'selected' : '' ?>>En Progreso</option>
            <option value="IMPLEMENTADA" <?= $r['status'] === 'IMPLEMENTADA' ? 'selected' : '' ?>>Implementada</option>
        </select>
    </div>
</div>
