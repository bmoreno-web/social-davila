'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Shield, Radio, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSyncAll?: () => Promise<void>;
}

export function Header({ title = 'DAVILA PM SOCIAL', subtitle, onSyncAll }: HeaderProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Sincronizando con Metricool...');
    try {
      if (onSyncAll) {
        await onSyncAll();
      } else {
        const res = await fetch('/api/clients?autoSync=true');
        await res.json();
      }
      setSyncStatus('Sincronizado');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (e) {
      setSyncStatus('Error al sincronizar');
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="h-16 px-8 border-b border-zinc-800/80 bg-[#0a0c13]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Metricool Engine Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300 font-medium text-[11px]">Motor Metricool: Activo</span>
        </div>

        {/* Sync Button */}
        <Button
          variant="glass"
          size="sm"
          onClick={handleSync}
          isLoading={isSyncing}
          className="text-xs border-zinc-700/80 hover:border-purple-500/50 gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{syncStatus || 'Sincronizar Ahora'}</span>
        </Button>
      </div>
    </header>
  );
}
