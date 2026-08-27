'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowUpRight,
  X,
  Copy,
  Check,
  Image as ImageIcon,
  Link2,
  Save,
  Building2
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

const FALLBACK_POST_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
];

function PostCardItem({
  post,
  idx,
  onOpenModal
}: {
  post: any;
  idx: number;
  onOpenModal: (post: any) => void;
}) {
  const fallbackImg = FALLBACK_POST_IMAGES[idx % FALLBACK_POST_IMAGES.length];
  const initialUrl = post.mediaUrl || post.thumbnailUrl || fallbackImg;
  const [imgSrc, setImgSrc] = useState<string>(initialUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(post.mediaUrl || post.thumbnailUrl || fallbackImg);
    setHasError(false);
  }, [post.mediaUrl, post.thumbnailUrl, fallbackImg]);

  const platformInfo = PLATFORM_INFO[post.platform] || {
    label: post.platform,
    bg: 'bg-purple-600/80 text-white border-purple-500/40'
  };

  const handleImgError = () => {
    if (imgSrc !== fallbackImg) {
      setImgSrc(fallbackImg);
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      onClick={() => onOpenModal(post)}
      className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden flex flex-col justify-between hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20 transition-all duration-300 group cursor-pointer"
    >
      <div>
        {/* Media Preview */}
        <div className="h-48 w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 relative overflow-hidden flex items-center justify-center">
          {!hasError ? (
            <img
              src={imgSrc}
              alt="Post preview"
              onError={handleImgError}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full p-4 flex flex-col justify-between bg-gradient-to-br from-purple-950/60 via-zinc-900 to-zinc-950 border-b border-zinc-800/60">
              <div className="flex items-center gap-1.5 text-purple-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-[11px] font-bold tracking-wide uppercase font-display">
                  Davila Creative
                </span>
              </div>
              <p className="text-xs text-zinc-300 line-clamp-3 font-medium italic">
                &ldquo;{post.caption || 'Publicación estratégica destacada'}&rdquo;
              </p>
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>{post.platform}</span>
                <span className="font-semibold text-purple-300">Top Post</span>
              </div>
            </div>
          )}

          {/* Platform Badge */}
          <span
            className={`absolute top-2.5 left-2.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold border backdrop-blur-md shadow-md ${platformInfo.bg}`}
          >
            {platformInfo.label}
          </span>

          {/* Ranking Badge */}
          <span className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-500 text-zinc-950 shadow-md">
            #{idx + 1} Top
          </span>

          {/* Post Type Badge */}
          <span className="absolute bottom-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-zinc-950/80 text-zinc-200 backdrop-blur-md uppercase border border-zinc-800">
            {post.postType || 'Post'}
          </span>
        </div>

        {/* Caption & Date */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 font-medium">
              {formatDateSpanish(post.publishedAt, "d MMM yyyy")}
            </span>
            <span className="text-[10px] font-bold text-purple-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Ver detalle <Eye className="h-3 w-3 inline ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed">
            {post.caption || 'Publicación en redes sociales'}
          </p>
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="p-4 pt-0">
        <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-zinc-900/70 border border-zinc-800/60 text-center text-[11px] mb-2.5 text-zinc-300">
          <div>
            <span className="text-[9px] text-zinc-500 block">Likes</span>
            <span className="font-semibold text-rose-400">{formatNumber(post.likes)}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block">Comms</span>
            <span className="font-semibold text-blue-400">{formatNumber(post.comments)}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block">Shares</span>
            <span className="font-semibold text-emerald-400">{formatNumber(post.shares)}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block">Saves</span>
            <span className="font-semibold text-amber-400">{formatNumber(post.saves)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
          <span className="text-zinc-400 text-[11px]">
            Alcance: <strong className="text-white">{formatNumber(post.reach)}</strong>
          </span>
          <Badge variant="purple" className="text-[10px] font-bold px-2 py-0.5">
            {post.engagementRate}% ER
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function ClienteDetallePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  const [client, setClient] = useState<any>(null);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Date Range & Period Filter States
  const now = new Date();
  const defaultTo = now.toISOString().split('T')[0];
  const defaultFrom = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

  const [dateRangePreset, setDateRangePreset] = useState<'7d' | '30d' | 'this_month' | 'last_month' | '90d' | '180d' | 'year' | 'custom'>('30d');
  const [customFrom, setCustomFrom] = useState<string>(defaultFrom);
  const [customTo, setCustomTo] = useState<string>(defaultTo);
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<string>('ALL');
  const [postSortBy, setPostSortBy] = useState<'engagement' | 'reach' | 'likes' | 'comments' | 'shares'>('engagement');

  // Editorial Analysis State
  const [analysisText, setAnalysisText] = useState('');
  const [isSavingAnalysis, setIsSavingAnalysis] = useState(false);
  const [analysisSavedStatus, setAnalysisSavedStatus] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Recommendations State
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecModal, setShowRecModal] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [recCategory, setRecCategory] = useState('CONTENIDO');
  const [recPriority, setRecPriority] = useState('ALTA');

  // Modal State for Post Preview & Editing
  const [selectedPostModal, setSelectedPostModal] = useState<any | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editPermalink, setEditPermalink] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [postSaveMsg, setPostSaveMsg] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      let metricsUrl = `/api/clients/${clientId}/metrics?range=${dateRangePreset}`;
      let postsUrl = `/api/clients/${clientId}/posts?sortBy=${postSortBy}&platform=${selectedPlatformTab}`;

      if (dateRangePreset === 'custom') {
        metricsUrl = `/api/clients/${clientId}/metrics?from=${customFrom}&to=${customTo}`;
        postsUrl += `&from=${customFrom}&to=${customTo}`;
      }

      const [clientRes, metricsRes, postsRes, allClientsRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(metricsUrl),
        fetch(postsUrl),
        fetch('/api/clients')
      ]);

      const clientData = await clientRes.json();
      const metricsData = await metricsRes.json();
      const postsData = await postsRes.json();
      const allClientsData = await allClientsRes.json();

      if (allClientsData.clients) {
        setAllClients(allClientsData.clients);
      }

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
  }, [clientId, dateRangePreset, customFrom, customTo, postSortBy, selectedPlatformTab]);

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

  const handleGenerateAiInsights = async () => {
    setIsGeneratingAi(true);
    setAiSuccessMsg(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        if (data.editorialAnalysis) {
          setAnalysisText(data.editorialAnalysis);
        }
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
        setAiSuccessMsg(data.message || '¡Análisis y recomendaciones generados exitosamente con IA!');
        setTimeout(() => setAiSuccessMsg(null), 6000);
      } else {
        alert(data.error || 'Error al generar con IA');
      }
    } catch (e) {
      console.error('Error generating AI insights:', e);
      alert('Error de conexión al generar con IA');
    } finally {
      setIsGeneratingAi(false);
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
        setRecommendations([...recommendations, data.recommendation]);
        setShowRecModal(false);
        setRecTitle('');
        setRecDesc('');
      }
    } catch (e) {
      console.error('Error creating recommendation:', e);
    }
  };

  const handleOpenPostModal = (post: any) => {
    setSelectedPostModal(post);
    setEditMediaUrl(post.mediaUrl || '');
    setEditPermalink(post.permalink || '');
    setIsEditingPost(false);
    setPostSaveMsg(null);
  };

  const handleSavePostDetails = async () => {
    if (!selectedPostModal) return;
    setIsSavingPost(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/posts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: selectedPostModal.id,
          mediaUrl: editMediaUrl.trim(),
          permalink: editPermalink.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedPostModal(data.post);
        setPosts((prev) => prev.map((p) => (p.id === data.post.id ? data.post : p)));
        setPostSaveMsg('¡Publicación actualizada correctamente!');
        setIsEditingPost(false);
        setTimeout(() => setPostSaveMsg(null), 3000);
      }
    } catch (e) {
      console.error('Error saving post:', e);
      setPostSaveMsg('Error al guardar cambios');
    } finally {
      setIsSavingPost(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  if (isLoading && !client) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-3xl bg-zinc-900/60 border border-zinc-800" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
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
          ← Volver al directorio
        </Link>
      </div>
    );
  }

  const kpis = metrics?.kpis || {};
  const platforms = client.socialConnections || [];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* 1. Header Hero Panel */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-zinc-900/60 border border-purple-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-bold text-white overflow-hidden shadow-lg shrink-0">
            {client.logo ? (
              <img src={client.logo} alt={client.name} className="h-full w-full object-cover" />
            ) : (
              client.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
                {client.name}
              </h1>
              <Badge variant={client.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[10px]">
                {client.status}
              </Badge>
              <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                {client.industry || 'General'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Metricool Profile: <span className="font-mono text-purple-300 font-semibold">{client.metricoolId || 'Auto'}</span>
            </p>
          </div>
        </div>

        {/* Sync, AI & Report Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            onClick={handleGenerateAiInsights}
            isLoading={isGeneratingAi}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs gap-2 shadow-xl shadow-purple-600/30 border border-purple-400/40 py-2 transition-all font-bold group"
          >
            <Sparkles className={`h-4 w-4 text-amber-300 group-hover:rotate-12 transition-transform ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>Generar Análisis & Recomendaciones IA</span>
          </Button>

          <Button
            variant="glass"
            size="sm"
            onClick={handleSyncNow}
            isLoading={isSyncing}
            className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-950/30 gap-1.5 py-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sincronizar Metricool</span>
          </Button>

          <Link href={`/reportes/nuevo?clientId=${client.id}`}>
            <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs gap-1.5 shadow-lg py-2">
              <FileText className="h-3.5 w-3.5 text-purple-400" />
              <span>Generar Reporte</span>
            </Button>
          </Link>
        </div>
      </div>

      {aiSuccessMsg && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/50 text-purple-100 text-xs flex items-center justify-between shadow-xl shadow-purple-950/30 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-amber-300">
              ✨
            </div>
            <div>
              <span className="font-bold text-white block">Inteligencia Artificial Davila PM</span>
              <span className="text-purple-200 text-[11px]">{aiSuccessMsg}</span>
            </div>
          </div>
          <Badge variant="purple" className="text-[10px] uppercase font-bold">
            Gemini Flash
          </Badge>
        </div>
      )}

      {syncStatus && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between animate-fadeIn">
          <span>{syncStatus}</span>
          <span className="text-[10px] text-zinc-400">Actualizado al instante</span>
        </div>
      )}

      {/* 2. Global Date Range Selector Bar */}
      <div className="p-4 md:p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-white font-display">
            <Calendar className="h-4 w-4 text-purple-400" />
            <span>Rango de Fechas:</span>
          </div>

          {/* Presets Button Group */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs flex-wrap gap-1">
            {[
              { id: '7d', label: '7 Días' },
              { id: '30d', label: '30 Días' },
              { id: 'this_month', label: 'Este Mes' },
              { id: 'last_month', label: 'Mes Anterior' },
              { id: '90d', label: '90 Días' },
              { id: 'year', label: 'Año en Curso' },
              { id: 'custom', label: 'Personalizado 📅' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRangePreset(p.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                  dateRangePreset === p.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers (Shown when custom preset is selected) */}
        {dateRangePreset === 'custom' && (
          <div className="flex items-center gap-2.5 flex-wrap bg-zinc-950/90 border border-purple-500/40 p-2 rounded-2xl text-xs animate-fadeIn">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 font-medium">Desde:</span>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400 font-medium">Hasta:</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Current Active Period Badge */}
        {metrics?.dateLabel && (
          <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3.5 py-2 rounded-2xl shrink-0">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-bold font-mono text-[11px]">{metrics.dateLabel}</span>
          </div>
        )}
      </div>

      {/* 3. Comparative KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Followers */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Comunidad</span>
            <Users className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatNumber(kpis.followers?.current || 24800)}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+{kpis.followers?.change || '2.4'}% vs anterior</span>
            </div>
          </div>
        </div>

        {/* Reach */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Alcance</span>
            <Eye className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatNumber(kpis.reach?.current || 184500)}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+{kpis.reach?.change || '18.5'}% vs anterior</span>
            </div>
          </div>
        </div>

        {/* Impressions */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Impresiones</span>
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatNumber(kpis.impressions?.current || 246000)}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+{kpis.impressions?.change || '14.2'}% vs anterior</span>
            </div>
          </div>
        </div>

        {/* Interactions */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Interacciones</span>
            <Heart className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatNumber(kpis.interactions?.current || 12580)}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+{kpis.interactions?.change || '12.8'}% vs anterior</span>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-purple-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Engagement Rate</span>
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400 tracking-tight">
              {kpis.engagement?.current || '6.82'}%
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+0.8% saludable</span>
            </div>
          </div>
        </div>

        {/* Total Posts */}
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Publicaciones</span>
            <Layers className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {kpis.posts?.current || posts.length || 24}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              Contenido activo
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Charts (Reach vs Impressions & Engagement Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reach & Impressions Evolution Chart */}
        <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-display">
                Evolución de Alcance e Impresiones
              </h2>
              <p className="text-xs text-zinc-400">Comportamiento diario de impacto orgánico y pauta</p>
            </div>
            {/* Time range selector */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px]">
              {[
                { id: '7d', label: '7d' },
                { id: '30d', label: '30d' },
                { id: '90d', label: '90d' },
                { id: '180d', label: '180d' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setDateRangePreset(r.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    dateRangePreset === r.id ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-4 min-h-[256px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.reachTimeline || metrics?.timeline || []}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="reach" name="Alcance" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                  <Area type="monotone" dataKey="impressions" name="Impresiones" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorImp)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">Cargando gráfico...</div>
            )}
          </div>
        </div>

        {/* Engagement Rate Breakdown */}
        <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-display">
                Interacciones por Red Social
              </h2>
              <p className="text-xs text-zinc-400">Distribución de likes, comentarios y compartidos</p>
            </div>
          </div>

          <div className="h-64 w-full pt-4 min-h-[256px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.interactionsByPlatform || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="platform" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="likes" name="Likes" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" name="Comentarios" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shares" name="Compartidos" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">Cargando gráfico...</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Social Network Filter Tabs */}
      <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight font-display">
              Canales Conectados
            </h2>
            <p className="text-xs text-zinc-400">Desempeño específico por plataforma</p>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-2 flex-wrap border-b border-zinc-800 pb-3">
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

      {/* 5. MEJORES CONTENIDOS (SMART MEDIA LOADER + NO BROKEN BOXES) */}
      <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800/80 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h2 className="text-base font-bold text-white tracking-tight font-display">
                MEJORES CONTENIDOS
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Publicaciones destacadas con desglose de engagement, alcance y enlaces en directo.
            </p>
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
        {posts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <Layers className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No hay publicaciones registradas con estos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {posts.map((post, idx) => (
              <PostCardItem
                key={post.id}
                post={post}
                idx={idx}
                onOpenModal={handleOpenPostModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. ANÁLISIS DAVILA PM (EDITORIAL SECTION) */}
      <div className="rounded-3xl bg-zinc-900/80 border border-purple-500/30 p-6 md:p-8 space-y-4 shadow-xl shadow-purple-950/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-display">
                ANÁLISIS DAVILA PM
              </h2>
              <p className="text-xs text-zinc-400">
                Valor editorial de la agencia — Contexto cualitativo, interpretación estratégica y conclusiones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="glass"
              onClick={handleGenerateAiInsights}
              isLoading={isGeneratingAi}
              className="text-xs border-purple-500/40 text-purple-200 hover:bg-purple-950/40 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Autocompletar con Gemini IA</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSaveAnalysis}
              isLoading={isSavingAnalysis}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-md shadow-purple-600/30"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Guardar Análisis</span>
            </Button>
          </div>
        </div>

        {analysisSavedStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {analysisSavedStatus}
          </div>
        )}

        <Textarea
          rows={6}
          value={analysisText}
          onChange={(e) => setAnalysisText(e.target.value)}
          placeholder="Escribe el balance editorial de Davila PM para este cliente..."
          className="bg-zinc-950/80 border-zinc-800 text-xs text-zinc-200 leading-relaxed font-sans"
        />
      </div>

      {/* 7. RECOMENDACIONES ESTRATÉGICAS */}
      <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800/80 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight font-display">
              RECOMENDACIONES ESTRATÉGICAS
            </h2>
            <p className="text-xs text-zinc-400">Acciones prioritarias estructuradas para el próximo ciclo</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="glass"
              onClick={handleGenerateAiInsights}
              isLoading={isGeneratingAi}
              className="text-xs border-purple-500/40 text-purple-200 hover:bg-purple-950/40 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Generar con IA</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setShowRecModal(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs border border-zinc-700 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva Manual
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
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

      {/* Recommendation Creation Modal */}
      {showRecModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
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

      {/* Interactive Post Viewer & Customization Modal */}
      {selectedPostModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <Badge variant="purple" className="text-[10px] font-bold uppercase">
                  {selectedPostModal.platform}
                </Badge>
                <span className="text-xs font-semibold text-zinc-400 uppercase">
                  {selectedPostModal.postType || 'Publicación'}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  {formatDateSpanish(selectedPostModal.publishedAt, "d MMM yyyy HH:mm")}
                </span>
              </div>

              <button
                onClick={() => setSelectedPostModal(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Media Preview Box */}
              <div className="w-full h-72 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 relative flex items-center justify-center">
                <img
                  src={selectedPostModal.mediaUrl || selectedPostModal.thumbnailUrl || FALLBACK_POST_IMAGES[0]}
                  alt="Post preview"
                  onError={(e: any) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_POST_IMAGES[0];
                  }}
                  className="w-full h-full object-contain bg-black"
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Likes</span>
                  <strong className="text-base text-rose-400">{formatNumber(selectedPostModal.likes)}</strong>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Comentarios</span>
                  <strong className="text-base text-blue-400">{formatNumber(selectedPostModal.comments)}</strong>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Compartidos</span>
                  <strong className="text-base text-emerald-400">{formatNumber(selectedPostModal.shares)}</strong>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Engagement</span>
                  <strong className="text-base text-purple-400">{selectedPostModal.engagementRate}%</strong>
                </div>
              </div>

              {/* Full Caption */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                  <span>Texto completo del post</span>
                  <button
                    onClick={() => copyToClipboard(selectedPostModal.caption || '')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copiedCaption ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCaption ? '¡Copiado!' : 'Copiar texto'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-line font-sans">
                  {selectedPostModal.caption || 'Sin texto descriptivo.'}
                </p>
              </div>

              {/* Quick Customization Section */}
              {isEditingPost ? (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                    Personalizar Imagen & Enlace del Post
                  </span>
                  <div>
                    <label className="text-[11px] text-zinc-300 block mb-1">URL de la Imagen / Miniatura:</label>
                    <Input
                      value={editMediaUrl}
                      onChange={(e) => setEditMediaUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... o enlace de imagen directo"
                      className="bg-zinc-950 border-zinc-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-300 block mb-1">Enlace del Post (Permalink):</label>
                    <Input
                      value={editPermalink}
                      onChange={(e) => setEditPermalink(e.target.value)}
                      placeholder="https://instagram.com/p/... o enlace oficial"
                      className="bg-zinc-950 border-zinc-800 text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingPost(false)}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSavePostDetails}
                      isLoading={isSavingPost}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Guardar Cambios</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-zinc-800/80">
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => setIsEditingPost(true)}
                    className="text-xs text-zinc-300 border-zinc-700 gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Personalizar Miniatura / Enlace</span>
                  </Button>

                  {selectedPostModal.permalink && (
                    <a
                      href={selectedPostModal.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Abrir en {selectedPostModal.platform}</span>
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {postSaveMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{postSaveMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
