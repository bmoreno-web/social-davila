'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Kanban,
  Plus,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  ExternalLink,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ContentCalendarView } from '@/components/parrilla/content-calendar-view';
import { ContentKanbanView } from '@/components/parrilla/content-kanban-view';
import { ContentModal } from '@/components/parrilla/content-modal';
import { ContentPost, ContentPostStatus } from '@/components/parrilla/types';

export default function ParrillaPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default Aug 2026
  const [activeView, setActiveView] = useState<'CALENDAR' | 'KANBAN'>('CALENDAR');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);

  // Fetch Clients
  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (data.clients) {
          setClients(data.clients);
          if (data.clients.length > 0 && selectedClientId === 'ALL') {
            // Keep ALL or default to first
          }
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    }
    loadClients();
  }, []);

  // Fetch Posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      let url = `/api/content-posts?month=${month}&year=${year}`;
      if (selectedClientId !== 'ALL') url += `&clientId=${selectedClientId}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Error fetching content posts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate, selectedClientId, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Statistics calculation
  const totalPosts = posts.length;
  const pendingApproval = posts.filter((p) => p.status === 'PENDIENTE_APROBACION').length;
  const changesRequested = posts.filter((p) => p.status === 'CAMBIOS_SOLICITADOS').length;
  const approved = posts.filter((p) => p.status === 'APROBADO' || p.status === 'PUBLICADO').length;

  const handleOpenNew = (defaultStatus?: ContentPostStatus) => {
    setSelectedPost(null);
    setModalOpen(true);
  };

  const handleOpenNewAtDate = (dateStr: string) => {
    setSelectedPost(null);
    setModalOpen(true);
  };

  const handleSelectPost = (p: ContentPost) => {
    setSelectedPost(p);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">
              Parrilla de Contenidos & Aprobaciones
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              DAVILA PM
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Planifica copys, formatos, artes y gestiona el flujo de aprobación con tus clientes sin fricción.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/portal" target="_blank">
            <Button
              variant="glass"
              size="sm"
              className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Portal Cliente</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>
          </Link>

          <Button
            onClick={() => handleOpenNew()}
            variant="default"
            size="sm"
            className="text-xs gap-1.5 shadow-lg shadow-purple-600/20 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Publicación</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0c0e15] border-zinc-800/80 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Posts del Mes</p>
            <p className="text-xl font-bold text-white font-display">{totalPosts}</p>
          </div>
        </Card>

        <Card className="p-4 bg-[#0c0e15] border-zinc-800/80 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">En Revisión Cliente</p>
            <p className="text-xl font-bold text-amber-400 font-display">{pendingApproval}</p>
          </div>
        </Card>

        <Card className="p-4 bg-[#0c0e15] border-zinc-800/80 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Cambios Pedidos</p>
            <p className="text-xl font-bold text-rose-400 font-display">{changesRequested}</p>
          </div>
        </Card>

        <Card className="p-4 bg-[#0c0e15] border-zinc-800/80 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">Aprobados / Listos</p>
            <p className="text-xl font-bold text-emerald-400 font-display">{approved}</p>
          </div>
        </Card>
      </div>

      {/* Filter and View Switcher Toolbar */}
      <div className="p-3.5 rounded-2xl bg-[#0c0e15] border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Client selector */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-400" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Todos los Clientes ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="BORRADOR">Borradores</option>
              <option value="PENDIENTE_APROBACION">En Revisión Cliente</option>
              <option value="CAMBIOS_SOLICITADOS">Cambios Solicitados</option>
              <option value="APROBADO">Aprobados</option>
              <option value="PUBLICADO">Publicados</option>
            </select>
          </div>
        </div>

        {/* View Switcher & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPosts()}
            title="Recargar parrilla"
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1">
            <button
              onClick={() => setActiveView('CALENDAR')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'CALENDAR'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Calendario</span>
            </button>
            <button
              onClick={() => setActiveView('KANBAN')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'KANBAN'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Tablero Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Calendar or Kanban */}
      {activeView === 'CALENDAR' ? (
        <ContentCalendarView
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          posts={posts}
          onSelectPost={handleSelectPost}
          onNewPostAtDate={handleOpenNewAtDate}
        />
      ) : (
        <ContentKanbanView
          posts={posts}
          onSelectPost={handleSelectPost}
          onNewPost={handleOpenNew}
        />
      )}

      {/* Creation & Edition Modal */}
      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
        clients={clients}
        selectedClientId={selectedClientId}
        onSaved={fetchPosts}
      />
    </div>
  );
}
