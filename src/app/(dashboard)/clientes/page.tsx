'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  ArrowRight,
  ExternalLink,
  Building2,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_INFO, formatDateSpanish } from '@/lib/utils';

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // New Client Modal State
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newBlogId, setNewBlogId] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const fetchClients = async (autoSync = false) => {
    try {
      setIsLoading(true);
      const url = autoSync ? '/api/clients?autoSync=true' : '/api/clients';
      const res = await fetch(url);
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSyncBrands = async () => {
    setIsSyncing(true);
    setSyncMessage('Consultando API de Metricool...');
    try {
      await fetchClients(true);
      setSyncMessage('Marcas sincronizadas con éxito');
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (e) {
      setSyncMessage('Error al sincronizar');
      setTimeout(() => setSyncMessage(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          industry: newIndustry,
          metricoolBlogId: newBlogId || undefined,
          contactEmail: newEmail
        })
      });

      if (res.ok) {
        setShowModal(false);
        setNewName('');
        setNewIndustry('');
        setNewBlogId('');
        setNewEmail('');
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">
            Directorio de Clientes
          </h1>
          <p className="text-xs text-zinc-400">
            Administra las cuentas de clientes y sus identificadores oficiales de Metricool.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            onClick={handleSyncBrands}
            isLoading={isSyncing}
            className="text-xs border-zinc-700/80 hover:border-purple-500/50 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncMessage || 'Sincronizar Marcas de Metricool'}</span>
          </Button>

          <Button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Buscar por nombre de cliente o sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-950/70 border-zinc-800 text-xs text-white"
          />
        </div>
        <div className="text-xs text-zinc-400">
          Mostrando <span className="font-semibold text-white">{filteredClients.length}</span> clientes
        </div>
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <Users className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No se encontraron clientes</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Intenta con otro término de búsqueda o sincroniza las marcas desde Metricool.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const hasSocials = client.socialConnections && client.socialConnections.length > 0;
            return (
              <div
                key={client.id}
                className="group rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-purple-500/40 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-purple-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0">
                        {client.logo ? (
                          <img
                            src={client.logo}
                            alt={client.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{client.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base group-hover:text-purple-300 transition-colors">
                          {client.name}
                        </h3>
                        <p className="text-xs text-zinc-400">{client.industry || 'Digital Marketing'}</p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      Activo
                    </Badge>
                  </div>

                  {/* Metricool ID Badge */}
                  <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs flex items-center justify-between mb-4">
                    <span className="text-[11px] text-zinc-400">ID Metricool:</span>
                    <span className="font-mono text-[11px] text-purple-300 font-semibold">
                      {client.metricoolBlogId || 'No asignado'}
                    </span>
                  </div>

                  {/* Social Channels */}
                  <div className="mb-5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Canales Vinculados
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hasSocials ? (
                        client.socialConnections.map((s: any) => {
                          const info = PLATFORM_INFO[s.platform] || { label: s.platform, bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
                          return (
                            <span
                              key={s.id}
                              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${info.bg}`}
                            >
                              {info.label}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-zinc-500 italic">Sin canales vinculados</span>
                      )}
                    </div>
                  </div>
                </div>

                <Link href={`/clientes/${client.id}`} className="w-full block">
                  <Button
                    variant="secondary"
                    className="w-full text-xs font-semibold justify-between bg-zinc-800/80 hover:bg-purple-600 hover:text-white border-zinc-700/60 group-hover:border-purple-500/30 transition-all"
                  >
                    <span>VER DASHBOARD CLIENTE</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* New Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white font-display mb-1">Registrar Nuevo Cliente</h2>
            <p className="text-xs text-zinc-400 mb-4">
              Crea el perfil de cliente y asocia su ID de Metricool para sincronización automática.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Nombre del Cliente / Marca</label>
                <Input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Acesco Colombia"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Sector / Industria</label>
                <Input
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="Ej: Construcción e Ingeniería"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">ID de Marca Metricool (Blog ID)</label>
                <Input
                  value={newBlogId}
                  onChange={(e) => setNewBlogId(e.target.value)}
                  placeholder="Ej: 2930665"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Correo de Contacto</label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="contacto@cliente.com"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-zinc-400"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  Guardar Cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
