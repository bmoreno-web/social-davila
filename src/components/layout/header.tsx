'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RefreshCw, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSyncAll?: () => Promise<void>;
}

export function Header({ title = 'DAVILA PM SOCIAL', subtitle, onSyncAll }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [clients, setClients] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Extract selected clientId if on /clientes/[id]
  const clientMatch = pathname ? pathname.match(/^\/clientes\/([^/]+)/) : null;
  const currentClientId = clientMatch ? clientMatch[1] : '';

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.clients) {
          setClients(data.clients);
        }
      })
      .catch((err) => console.error('Header clients fetch error:', err));
  }, []);

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

  const handleSelectClient = (clientId: string) => {
    if (!clientId) return;
    router.push(`/clientes/${clientId}`);
  };

  return (
    <header className="h-16 px-8 border-b border-zinc-800/80 bg-[#0a0c13]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick Client Switcher Dropdown (Left of Motor Metricool) */}
        {clients.length > 0 && (
          <div className="relative flex items-center bg-zinc-900/90 border border-purple-500/30 hover:border-purple-500/60 rounded-full px-3.5 py-1.5 shadow-sm transition-all group backdrop-blur-md">
            <Building2 className="h-3.5 w-3.5 text-purple-400 mr-2 shrink-0 group-hover:scale-110 transition-transform" />
            <select
              value={currentClientId || ''}
              onChange={(e) => handleSelectClient(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer pr-5 appearance-none max-w-[160px] md:max-w-[220px] truncate"
            >
              <option value="" disabled={!!currentClientId} className="bg-zinc-900 text-zinc-400">
                Seleccionar Marca...
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-zinc-900 text-white py-1">
                  {c.name} {c.id === currentClientId ? '✓' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 text-purple-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 group-hover:translate-y-[-40%] transition-transform" />
          </div>
        )}

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
