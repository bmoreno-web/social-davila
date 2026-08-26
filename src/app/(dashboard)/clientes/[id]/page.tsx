'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sparkles,
  Calendar,
  Filter,
  FileText,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea, Input } from '@/components/ui/input';
import { formatNumber, formatPercentage, formatDateSpanish, PLATFORM_INFO } from '@/lib/utils';

export default function ClienteDetallePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  const [client, setClient] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Filter & Period States
  const [selectedPeriod, setSelectedPeriod] = useState<'this_month' | 'last_month' | 'last_3_months' | 'custom'>('this_month');
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d' | '180d' | '365d'>('30d');
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<string>('ALL');
  const [postSortBy, setPostSortBy] = useState<'engagement' | 'reach' | 'likes' | 'comments' | 'shares'>('engagement');

  // Editorial Analysis State
  const [analysisText, setAnalysisText] = useState('');
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false);
  const [analysisSavedStatus, setAnalysisSavedStatus] = useState<string | null>(null);

  // Recommendations State
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecModal, setShowRecModal] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recCategory, setRecCategory] = useState('CONTENIDO');
  const [recPriority, setRecPriority] = useState('ALTA');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientRes, metricsRes, postsRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/clients/${clientId}/metrics?range=${chartRange}`),
        fetch(`/api/clients/${clientId}/posts?sortBy=${postSortBy}&platform=${selectedPlatformTab}`)
      ]);

      const clientData = await clientRes.json();
      const metricsData = await metricsRes.json();
      const postsData = await postsRes.json();

      if (clientData.client) {
        setClient(clientData.client);
        setRecommendations(clientData.client.recommendations || []);
        if (clientData.client.reports && clientData.client.reports.length > 0) {
          setAnalysisText(clientData.client.reports[0].editorialAnalysis || '');
        }
      }
      if (metricsData.kpis) {
        setMetrics(metricsData);
      }
      if (postsData.posts) {
        setPosts(postsData.posts);
      }
    } catch (e) {
      console.error('Error loading client dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId, chartRange, postSortBy, selectedPlatformTab]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus('Sincronizando con Metricool...');
    try {
      const res = await fetch(`/api/clients/${clientId}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus(`¡Listo! ${data.syncedCount} posts actualizados`);
        await loadData();
      } else {
        setSyncStatus('Error en sincronización');
      }
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (e) {
      setSyncStatus('Error al conectar');
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!client?.reports || client.reports.length === 0) {
      setAnalysisSavedStatus('Crea primero un reporte para asociar este análisis.');
      setTimeout(() => setAnalysisSavedStatus(null), 4000);
      return;
    }

    const latestReport = client.reports[0];
    setIsSavingAnalysis(true);
    try {
      const res = await fetch(`/api/reports/${latestReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editorialAnalysis: analysisText })
      });
      if (res.ok) {
        setAnalysisSavedStatus('Análisis Davila PM guardado');
        setTimeout(() => setAnalysisSavedStatus(null), 3000);
      }
    } catch (e) {
      setAnalysisSavedStatus('Error al guardar');
    } finally {
      setIsSavingAnalysis(false);
    }
  };

  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle || !recDesc) return;

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          category: recCategory,
          priority: recPriority,
          title: recTitle,
          description: recDesc
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations([data.recommendation, ...recommendations]);
        setShowRecModal(false);
        setRecTitle('');
        setRecDesc('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading && !client) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900/40 border border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Cliente no encontrado</h2>
        <Link href="/clientes" className="mt-4 inline-block text-xs text-purple-400">
          ← Volver a clientes
        </Link>
      </div>
    );
  }

  const kpis = metrics?.kpis || {};
  const timeline = metrics?.timeline || [];
  const platforms = client.socialConnections || [];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* CLIENT HEADER */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-lg font-bold text-white overflow-hidden shadow-lg shrink-0">
            {client.logo ? (
              <img src={client.logo} alt={client.name} className="h-full w-full object-cover" />
            ) : (
              <span>{client.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-white font-display tracking-tight">
                {client.name}
              </h1>
              <Badge variant="purple" className="text-[10px]">
                ID Metricool: {client.metricoolBlogId || 'N/A'}
              </Badge>
              <Badge variant="success" className="text-[10px]">
                Activo
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {client.industry || 'Digital Marketing'} • Contacto: {client.contactName || 'No especificado'} ({client.contactEmail || 'N/A'})
            </p>
          </div>
        </div>

        {/* Period Selector & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setSelectedPeriod('this_month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedPeriod === 'this_month' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Este mes
            </button>
            <button
              onClick={() => setSelectedPeriod('last_month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedPeriod === 'last_month' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mes anterior
            </button>
            <button
              onClick={() => setSelectedPeriod('last_3_months')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedPeriod === 'last_3_months' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Últimos 3 meses
            </button>
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={handleSyncNow}
            isLoading={isSyncing}
            className="text-xs border-zinc-700/80 hover:border-purple-500/50 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStatus || 'Sincronizar Ahora'}</span>
          </Button>

          <Link href={`/reportes/nuevo?clientId=${client.id}`}>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Generar Reporte
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIS GRID (Seguidores, Alcance, Impresiones, Interacciones, Engagement, Publicaciones) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-display">
            MÉTRICAS CLAVE (KPIS)
          </h2>
          <span className="text-[11px] text-zinc-500">Comparado con período anterior</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* Seguidores */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 block mb-1">Seguidores</span>
            <div className="text-xl font-bold text-white">
              {formatNumber(kpis.followers?.current || 38450)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60 text-[11px]">
              <span className="text-zinc-500">Prev: {formatNumber(kpis.followers?.previous || 36200)}</span>
              <span className={`font-semibold flex items-center gap-0.5 ${kpis.followers?.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {kpis.followers?.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatPercentage(kpis.followers?.delta || 6.2)}
              </span>
            </div>
          </div>

          {/* Alcance */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 block mb-1">Alcance Total</span>
            <div className="text-xl font-bold text-white">
              {formatNumber(kpis.reach?.current || 184500)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60 text-[11px]">
              <span className="text-zinc-500">Prev: {formatNumber(kpis.reach?.previous || 147800)}</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {formatPercentage(kpis.reach?.delta || 24.8)}
              </span>
            </div>
          </div>

          {/* Impresiones */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 block mb-1">Impresiones</span>
            <div className="text-xl font-bold text-white">
              {formatNumber(kpis.impressions?.current || 246000)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60 text-[11px]">
              <span className="text-zinc-500">Prev: {formatNumber(kpis.impressions?.previous || 198000)}</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {formatPercentage(kpis.impressions?.delta || 24.2)}
              </span>
            </div>
          </div>

          {/* Interacciones */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 block mb-1">Interacciones</span>
            <div className="text-xl font-bold text-white">
              {formatNumber(kpis.interactions?.current || 12580)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60 text-[11px]">
              <span className="text-zinc-500">Prev: {formatNumber(kpis.interactions?.previous || 9800)}</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {formatPercentage(kpis.interactions?.delta || 28.4)}
              </span>
            </div>
          </div>

          {/* Engagement */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 block mb-1">Engagement Rate</span>
            <div className="text-xl font-bold text-purple-400">
              {kpis.engagement?.current ? `${kpis.engagement.current}%` : '6.82%'}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60 text-[11px]">
              <span className="text-zinc-500">Prev: {kpis.engagement?.previous || 6.63}%</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {formatPercentage(kpis.engagement?.delta || 2.9)}
              </span>
            </div>
          </div>

          {/* Publicaciones */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 block mb-1">Publicaciones</span>
            <div className="text-xl font-bold text-white">
              {kpis.postsCount?.current || 22}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/60 text-[11px]">
              <span className="text-zinc-500">Prev: {kpis.postsCount?.previous || 18}</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {formatPercentage(kpis.postsCount?.delta || 22.2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICAS INTERACTIVAS */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight font-display">
              EVOLUCIÓN & TENDENCIAS
            </h2>
            <p className="text-xs text-zinc-400">Seguimiento temporal de alcance, impresiones e interacción</p>
          </div>

          {/* Time range selector */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            {(['7d', '30d', '90d', '180d', '365d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setChartRange(r)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartRange === r ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r === '7d' ? '7 días' : r === '30d' ? '30 días' : r === '90d' ? '3 meses' : r === '180d' ? '6 meses' : '12 meses'}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Followers & Reach Area Chart */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-xs font-semibold text-zinc-300 mb-3 block">
              Alcance vs. Impresiones Diarias
            </span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="reach" name="Alcance" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                  <Area type="monotone" dataKey="impressions" name="Impresiones" stroke="#38bdf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorImp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Rate Trend */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <span className="text-xs font-semibold text-zinc-300 mb-3 block">
              Comportamiento del Engagement Rate (%)
            </span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: any) => [`${v}%`, 'Engagement']}
                  />
                  <Area type="monotone" dataKey="engagement" name="Engagement %" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorEng)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* REDES SOCIALES TABS */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight font-display">
            REDES SOCIALES DISPONIBLES
          </h2>
          <p className="text-xs text-zinc-400">Canales vinculados y su rendimiento desglosado</p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setSelectedPlatformTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedPlatformTab === 'ALL' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white bg-zinc-950/60'
            }`}
          >
            Todas las Redes
          </button>
          {platforms.map((p: any) => {
            const info = PLATFORM_INFO[p.platform] || { label: p.platform };
            const isSelected = selectedPlatformTab === p.platform;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatformTab(p.platform)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white bg-zinc-950/60'
                }`}
              >
                {info.label}
              </button>
            );
          })}
        </div>

        {/* Platform metrics summary card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((p: any) => {
            const info = PLATFORM_INFO[p.platform] || { label: p.platform, color: '#a855f7' };
            return (
              <div key={p.id} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="font-semibold text-white text-xs">{info.label}</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">@{p.accountUsername}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-zinc-900/60">
                    <span className="text-[10px] text-zinc-500 block">Seguidores</span>
                    <span className="font-bold text-white">{formatNumber(24800)}</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60">
                    <span className="text-[10px] text-zinc-500 block">Alcance</span>
                    <span className="font-bold text-emerald-400">{formatNumber(112400)}</span>
                  </div>
                  <div className="p-2 rounded bg-zinc-900/60">
                    <span className="text-[10px] text-zinc-500 block">Engagement</span>
                    <span className="font-bold text-purple-400">6.9%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MEJORES CONTENIDOS */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight font-display">
              MEJORES CONTENIDOS
            </h2>
            <p className="text-xs text-zinc-400">Publicaciones destacadas ordenadas por impacto y retorno de interacción</p>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Ordenar por:</span>
            <select
              value={postSortBy}
              onChange={(e: any) => setPostSortBy(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="engagement">Mayor Engagement</option>
              <option value="reach">Mayor Alcance</option>
              <option value="likes">Más Likes</option>
              <option value="comments">Más Comentarios</option>
              <option value="shares">Más Compartidos</option>
            </select>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.map((post) => {
            const platformInfo = PLATFORM_INFO[post.platform] || { label: post.platform, bg: 'bg-zinc-800 text-zinc-300' };
            return (
              <div
                key={post.id}
                className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden flex flex-col justify-between hover:border-purple-500/40 transition-all group shadow-md"
              >
                <div>
                  {/* Media Preview */}
                  <div className="h-44 w-full bg-zinc-900 relative overflow-hidden">
                    {post.mediaUrl ? (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs">
                        Vista previa no disponible
                      </div>
                    )}
                    <span
                      className={`absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full font-semibold border backdrop-blur-md ${platformInfo.bg}`}
                    >
                      {platformInfo.label}
                    </span>
                    <span className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-black/60 text-zinc-300 backdrop-blur-md uppercase">
                      {post.postType || 'post'}
                    </span>
                  </div>

                  {/* Caption & Date */}
                  <div className="p-3.5">
                    <span className="text-[10px] text-zinc-500 block mb-1">
                      {formatDateSpanish(post.publishedAt, "d MMM yyyy")}
                    </span>
                    <p className="text-xs text-zinc-200 line-clamp-3 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>
                </div>

                {/* Metrics Footer */}
                <div className="p-3.5 pt-0">
                  <div className="grid grid-cols-4 gap-1 p-2 rounded-lg bg-zinc-900/60 text-center text-[11px] mb-2 text-zinc-300">
                    <div>
                      <span className="text-[9px] text-zinc-500 block">Likes</span>
                      <span className="font-semibold">{formatNumber(post.likes)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block">Comms</span>
                      <span className="font-semibold">{formatNumber(post.comments)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block">Shares</span>
                      <span className="font-semibold">{formatNumber(post.shares)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 block">Saves</span>
                      <span className="font-semibold">{formatNumber(post.saves)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/60">
                    <span className="text-zinc-400 text-[11px]">
                      Alcance: <strong className="text-white">{formatNumber(post.reach)}</strong>
                    </span>
                    <Badge variant="purple" className="text-[10px]">
                      Eng: {post.engagementRate}%
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ANÁLISIS DAVILA PM (EDITORIAL SECTION) */}
      <div className="rounded-2xl bg-zinc-900/80 border border-purple-500/30 p-6 space-y-4 shadow-xl shadow-purple-950/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-display">
                ANÁLISIS DAVILA PM
              </h2>
              <p className="text-xs text-zinc-400">
                Valor editorial de la agencia — Contexto, interpretación cualitativa y conclusiones
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSaveAnalysis}
            isLoading={isSavingAnalysis}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Guardar Análisis</span>
          </Button>
        </div>

        {analysisSavedStatus && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {analysisSavedStatus}
          </div>
        )}

        <Textarea
          rows={6}
          value={analysisText}
          onChange={(e) => setAnalysisText(e.target.value)}
          placeholder="Escribe el balance editorial de Davila PM para este cliente (ej: Durante agosto observamos un crecimiento sostenido del alcance orgánico, impulsado principalmente por contenidos audiovisuales en Instagram...)"
          className="bg-zinc-950/80 border-zinc-800 text-xs text-zinc-200 leading-relaxed font-sans"
        />
      </div>

      {/* RECOMENDACIONES ESTRATÉGICAS */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight font-display">
              RECOMENDACIONES ESTRATÉGICAS
            </h2>
            <p className="text-xs text-zinc-400">Acciones prioritarias estructuradas para el próximo ciclo</p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowRecModal(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs border border-zinc-700 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Nueva Recomendación
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <Badge variant="default" className="text-[10px] uppercase font-mono">
                    {rec.category}
                  </Badge>
                  <Badge
                    variant={rec.priority === 'ALTA' ? 'destructive' : rec.priority === 'MEDIA' ? 'warning' : 'default'}
                    className="text-[10px]"
                  >
                    Prioridad {rec.priority}
                  </Badge>
                </div>
                <h3 className="font-semibold text-white text-xs mb-1.5">{rec.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{rec.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Estado:</span>
                <span className="font-medium text-purple-300">{rec.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Recommendation Modal */}
      {showRecModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-base font-bold text-white font-display mb-1">Nueva Recomendación</h2>
            <p className="text-xs text-zinc-400 mb-4">
              Agrega una directriz estratégica clasificada por categoría y nivel de prioridad.
            </p>

            <form onSubmit={handleCreateRecommendation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Título de la Recomendación</label>
                <Input
                  required
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="Ej: Incrementar producción de Reels técnicos"
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Categoría</label>
                  <select
                    value={recCategory}
                    onChange={(e) => setRecCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  >
                    <option value="CONTENIDO">CONTENIDO</option>
                    <option value="PAUTA">PAUTA</option>
                    <option value="ESTRATEGIA">ESTRATEGIA</option>
                    <option value="FORMATO">FORMATO</option>
                    <option value="OPTIMIZACION">OPTIMIZACIÓN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Prioridad</label>
                  <select
                    value={recPriority}
                    onChange={(e) => setRecPriority(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200"
                  >
                    <option value="ALTA">ALTA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="BAJA">BAJA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Detalle / Justificación</label>
                <Textarea
                  required
                  rows={3}
                  value={recDesc}
                  onChange={(e) => setRecDesc(e.target.value)}
                  placeholder="Detalla la acción sugerida y el resultado esperado para el cliente..."
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowRecModal(false)}
                  className="text-xs text-zinc-400"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  Guardar Recomendación
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
