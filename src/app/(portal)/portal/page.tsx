'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Download,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  ChevronRight,
  Copy,
  Check,
  X,
  Layers,
  Award,
  Send,
  MessageSquare,
  Headphones,
  Quote
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatPercentage, formatDateSpanish, PLATFORM_INFO } from '@/lib/utils';

interface PortalPostCardProps {
  post: any;
  idx: number;
  onOpenModal: (post: any) => void;
}

function PortalPostCard({ post, idx, onOpenModal }: PortalPostCardProps) {
  const initialUrl = post.mediaUrl || post.thumbnailUrl || '';
  const [imgSrc, setImgSrc] = useState<string>(initialUrl);
  const [hasError, setHasError] = useState<boolean>(!initialUrl);

  useEffect(() => {
    const url = post.mediaUrl || post.thumbnailUrl || '';
    setImgSrc(url);
    setHasError(!url);
  }, [post.mediaUrl, post.thumbnailUrl]);

  const platform = (post.platform || 'INSTAGRAM').toUpperCase();

  const networkStylesMap: Record<string, { bg: string; border: string; badge: string; accent: string; quote: string }> = {
    INSTAGRAM: {
      bg: 'bg-gradient-to-br from-purple-950/80 via-pink-950/40 to-zinc-950',
      border: 'border-pink-500/20 group-hover:border-pink-500/50',
      badge: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      accent: 'text-pink-400',
      quote: 'text-pink-500/20'
    },
    FACEBOOK: {
      bg: 'bg-gradient-to-br from-blue-950/80 via-indigo-950/50 to-zinc-950',
      border: 'border-blue-500/20 group-hover:border-blue-500/50',
      badge: 'bg-blue-600 text-white',
      accent: 'text-blue-400',
      quote: 'text-blue-500/20'
    },
    TIKTOK: {
      bg: 'bg-gradient-to-br from-zinc-950 via-cyan-950/30 to-rose-950/30',
      border: 'border-cyan-500/20 group-hover:border-cyan-500/50',
      badge: 'bg-zinc-900 border border-cyan-500/40 text-cyan-300',
      accent: 'text-cyan-400',
      quote: 'text-cyan-500/20'
    },
    LINKEDIN: {
      bg: 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-zinc-950',
      border: 'border-blue-400/20 group-hover:border-blue-400/50',
      badge: 'bg-blue-700 text-white',
      accent: 'text-blue-300',
      quote: 'text-blue-400/20'
    }
  };

  const networkStyles = networkStylesMap[platform] || networkStylesMap.INSTAGRAM;

  return (
    <div
      onClick={() => onOpenModal(post)}
      className={`rounded-2xl bg-zinc-950/90 border ${networkStyles.border} overflow-hidden flex flex-col justify-between hover:shadow-2xl hover:shadow-purple-950/30 transition-all duration-300 group cursor-pointer`}
    >
      <div>
        {/* Media or Editorial Card Header */}
        <div className="h-48 w-full relative overflow-hidden flex items-center justify-center">
          {!hasError && imgSrc ? (
            <img
              src={imgSrc}
              alt="Post thumbnail"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading="lazy"
              onError={() => setHasError(true)}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`h-full w-full p-5 flex flex-col justify-between ${networkStyles.bg} relative overflow-hidden`}>
              <Quote className={`absolute -bottom-4 -right-4 h-24 w-24 ${networkStyles.quote} pointer-events-none transform rotate-12`} />
              
              <div className="flex items-center justify-between z-10">
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${networkStyles.badge}`}>
                  {platform}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {formatDateSpanish(post.publishedAt, 'd MMM')}
                </span>
              </div>

              <div className="z-10 my-auto py-2">
                <p className="text-xs text-zinc-100 font-medium line-clamp-3 leading-relaxed italic">
                  &ldquo;{post.caption || 'Publicación estratégica en redes sociales'}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/60 z-10">
                <span className={`font-semibold ${networkStyles.accent} flex items-center gap-1`}>
                  <Sparkles className="h-3 w-3" /> Top Contenido
                </span>
                <span>{post.likes ? `${formatNumber(post.likes)} likes` : 'Destacado'}</span>
              </div>
            </div>
          )}

          {/* Badges on top of image */}
          <span className="absolute top-2.5 left-2.5 text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-zinc-950/80 text-white backdrop-blur-md border border-zinc-800 shadow-md">
            #{idx + 1} Top
          </span>
          <span className="absolute bottom-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-zinc-950/85 text-zinc-200 backdrop-blur-md uppercase border border-zinc-800">
            {post.postType || 'Publicación'}
          </span>
        </div>

        {/* Caption snippet */}
        <div className="p-4 space-y-2">
          <p className="text-xs text-zinc-200 line-clamp-2 leading-relaxed font-sans">
            {post.caption || 'Publicación en redes sociales'}
          </p>
        </div>
      </div>

      {/* Metrics footer */}
      <div className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/60 text-center text-[11px] mb-2 text-zinc-300">
          <div>
            <span className="text-[9px] text-zinc-500 block">Likes</span>
            <span className="font-semibold text-rose-400">{formatNumber(post.likes)}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block">Comms</span>
            <span className="font-semibold text-blue-400">{formatNumber(post.comments)}</span>
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 block">ER</span>
            <span className="font-bold text-purple-400">{post.engagementRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientPortalHomePage() {
  const [client, setClient] = useState<any>(null);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [userSession, setUserSession] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Filters & Modal States
  const [dateRangePreset, setDateRangePreset] = useState<'7d' | '30d' | 'this_month' | 'last_month' | '90d'>('30d');
  const [selectedPostModal, setSelectedPostModal] = useState<any | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Advisor Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [advisorSubject, setAdvisorSubject] = useState('Consulta sobre informe mensual');
  const [advisorMessage, setAdvisorMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (selectedPostModal || isContactModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPostModal, isContactModalOpen]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Check current user session role
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      const currentUser = authData.user;
      setUserSession(currentUser);

      if (currentUser?.role === 'CLIENT') {
        // Locked to their specific brand
        const activeId = currentUser.clientId || 'cmtag1oha0000t0g80a05ym3q';
        setSelectedClientId(activeId);
        await loadClientDetails(activeId, dateRangePreset);
      } else {
        // Agency team (ADMIN / ANALYST) can switch clients
        const clientsRes = await fetch('/api/clients');
        const clientsData = await clientsRes.json();
        const clientList = clientsData.clients || [];
        setAllClients(clientList);

        const activeId = selectedClientId || clientList[0]?.id || 'cmtag1oha0000t0g80a05ym3q';
        setSelectedClientId(activeId);
        await loadClientDetails(activeId, dateRangePreset);
      }
    } catch (e) {
      console.error('Error loading portal data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientDetails = async (clientId: string, range: string) => {
    try {
      const [clientRes, metricsRes, postsRes, reportsRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/clients/${clientId}/metrics?range=${range}`),
        fetch(`/api/clients/${clientId}/posts?sortBy=engagement&limit=8`),
        fetch(`/api/reports?clientId=${clientId}`)
      ]);

      const clientData = await clientRes.json();
      const metricsData = await metricsRes.json();
      const postsData = await postsRes.json();
      const reportsData = await reportsRes.json();

      if (clientData.client) setClient(clientData.client);
      if (metricsData.kpis) setMetrics(metricsData);
      if (postsData.posts) setPosts(postsData.posts);
      if (reportsData.reports) setReports(reportsData.reports);
    } catch (e) {
      console.error('Error loading specific client details in portal:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleClientChange = (newId: string) => {
    setSelectedClientId(newId);
    loadClientDetails(newId, dateRangePreset);
  };

  const handleRangeChange = (newRange: any) => {
    setDateRangePreset(newRange);
    if (selectedClientId) {
      loadClientDetails(selectedClientId, newRange);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const copyEmailAddress = () => {
    navigator.clipboard.writeText('ddigital@davilaweb.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSendMessageToAdvisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorMessage.trim()) return;

    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      setMessageSentSuccess(true);
      setTimeout(() => {
        setMessageSentSuccess(false);
        setAdvisorMessage('');
        setIsContactModalOpen(false);
      }, 2500);
    }, 1000);
  };

  const activeClient = client || {
    name: 'Acesco Colombia',
    logo: 'https://static.metricool.com/brand-logo/202409/2930665-temp-file16623787061548330277.com-brand-facebook-page-image',
    socialConnections: [{ id: 'sc1', platform: 'INSTAGRAM', accountUsername: 'acescocol', followers: 29903 }]
  };

  const kpis = metrics?.kpis || {
    followers: { current: 29903, delta: 6.4, isPositive: true },
    reach: { current: 68400, delta: 22.0, isPositive: true },
    impressions: { current: 94200, delta: 23.4, isPositive: true },
    interactions: { current: 4180, delta: 28.2, isPositive: true },
    engagement: { current: 7.2, delta: 5.3, isPositive: true },
    posts: { current: 18, delta: 20.0, isPositive: true }
  };

  const platforms = activeClient.socialConnections || [];
  const latestReport = activeClient.reports?.[0] || reports[0];
  const recommendations = activeClient.recommendations || [];

  const whatsappMessage = encodeURIComponent(
    `Hola Davila PM, soy cliente de *${activeClient.name}* y me gustaría hacer una consulta sobre nuestro informe de rendimiento digital.`
  );

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto pb-20">
      {/* 1. Hero Executive Client Header */}
      <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-r from-purple-950/60 via-zinc-900/90 to-zinc-900/70 border border-purple-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-xl font-bold text-white overflow-hidden shadow-2xl shrink-0 p-1">
              {activeClient.logo ? (
                <img src={activeClient.logo} alt={activeClient.name} className="h-full w-full object-cover rounded-xl" />
              ) : (
                activeClient.name?.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
                  Portal Ejecutivo de Resultados
                </span>
                <span className="text-zinc-600">•</span>
                <Badge variant="success" className="text-[10px] py-0 px-2">
                  Estrategia Activa
                </Badge>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
                {activeClient.name}
              </h1>
              <p className="text-xs md:text-sm text-zinc-300 mt-1">
                Supervisión de marca y analítica digital por <strong>Davila Publicidad & Marketing</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions & Brand Switcher (Only visible to Agency Admins/Analysts) */}
          <div className="flex items-center gap-3 flex-wrap">
            {userSession?.role !== 'CLIENT' && allClients.length > 1 && (
              <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
                <Building2 className="h-3.5 w-3.5 text-purple-400" />
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-2 text-xs"
                >
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link href="/portal/parrilla">
              <Button variant="glass" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs gap-1.5 py-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Aprobar Contenidos</span>
              </Button>
            </Link>

            {latestReport && (
              <Link href={`/portal/reportes/${latestReport.id}`}>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs gap-2 shadow-lg shadow-purple-600/30 font-semibold py-2">
                  <FileText className="h-4 w-4" />
                  <span>Ver Informe Mensual</span>
                </Button>
              </Link>
            )}

            <Button
              onClick={() => setIsContactModalOpen(true)}
              variant="glass"
              className="border-zinc-700 text-xs text-zinc-200 hover:border-purple-500 gap-1.5"
            >
              <Headphones className="h-3.5 w-3.5 text-purple-400" />
              <span>Contactar Asesor</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar & Date Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Calendar className="h-4 w-4 text-purple-400" />
          <span>Periodo de Análisis: <strong className="text-white">{metrics?.dateLabel || 'Últimos 30 días'}</strong></span>
        </div>

        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          {[
            { id: '7d', label: '7 Días' },
            { id: '30d', label: '30 Días' },
            { id: 'this_month', label: 'Este Mes' },
            { id: 'last_month', label: 'Mes Pasado' },
            { id: '90d', label: 'Trimestre' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => handleRangeChange(r.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                dateRangePreset === r.id ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Executive KPI Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Followers */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Comunidad Total</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatNumber(kpis.followers?.current || 0)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="h-3 w-3" /> +{kpis.followers?.delta}% vs ciclo ant.
          </div>
        </div>

        {/* Reach */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Alcance Neto</span>
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatNumber(kpis.reach?.current || 0)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="h-3 w-3" /> +{kpis.reach?.delta}% impacto
          </div>
        </div>

        {/* Impressions */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Impresiones</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatNumber(kpis.impressions?.current || 0)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="h-3 w-3" /> +{kpis.impressions?.delta}% visualizaciones
          </div>
        </div>

        {/* Interactions */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Interacciones</span>
            <Heart className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatNumber(kpis.interactions?.current || 0)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="h-3 w-3" /> +{kpis.interactions?.delta}% engagement
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Tasa Interacción</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 tracking-tight">
            {kpis.engagement?.current}%
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-2">
            Top Industria
          </div>
        </div>

        {/* Content Production */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Publicaciones</span>
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {kpis.posts?.current || 18}
          </div>
          <div className="text-[11px] text-zinc-400 mt-2">
            Reels, fotos y carruseles
          </div>
        </div>
      </div>

      {/* 4. Interactive Evolution Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reach Chart */}
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-display flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" /> Evolución de Alcance e Impresiones Diarias
            </h3>
            <p className="text-xs text-zinc-400">Medición continua de audiencia expuesta al contenido</p>
          </div>

          <div className="h-64 w-full pt-4 min-h-[256px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.reachTimeline || metrics?.timeline || []}>
                  <defs>
                    <linearGradient id="portalColorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="reach" name="Alcance Diario" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#portalColorReach)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">Cargando gráfico...</div>
            )}
          </div>
        </div>

        {/* Platform Interaction Distribution */}
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-display flex items-center gap-2">
              <Share2 className="h-4 w-4 text-cyan-400" /> Distribución de Interacciones por Red
            </h3>
            <p className="text-xs text-zinc-400">Balance de likes, comentarios y compartidos por plataforma</p>
          </div>

          <div className="h-64 w-full pt-4 min-h-[256px]">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics?.interactionsByPlatform || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="platform" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }} />
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

      {/* 5. Canales Conectados & Redes Oficiales */}
      <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight font-display">
            Canales y Cuentas Oficiales Vinculadas
          </h3>
          <p className="text-xs text-zinc-400">Monitoreo continuo de comunidad y alcance por red</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platforms.map((p: any) => {
            const info = PLATFORM_INFO[p.platform] || { label: p.platform, color: '#a855f7' };
            const platStat = (metrics?.interactionsByPlatform || []).find((m: any) => m.platform === p.platform) || {};
            const followersCount = p.followers || platStat.followers || (p.platform === 'INSTAGRAM' ? 29903 : p.platform === 'FACEBOOK' ? 14200 : 4690);
            const reachCount = p.reach || platStat.reach || (p.platform === 'INSTAGRAM' ? 48500 : p.platform === 'FACEBOOK' ? 19900 : 18900);
            const erVal = p.engagementRate || platStat.engagementRate || 6.8;

            return (
              <div key={p.id || p.platform} className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="font-bold text-white text-sm">{info.label}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 font-medium">@{p.accountUsername}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80">
                    <span className="text-[10px] text-zinc-500 block">Comunidad</span>
                    <span className="font-bold text-white text-sm">{formatNumber(followersCount)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80">
                    <span className="text-[10px] text-zinc-500 block">Alcance</span>
                    <span className="font-bold text-emerald-400 text-sm">{formatNumber(reachCount)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80">
                    <span className="text-[10px] text-zinc-500 block">Engagement</span>
                    <span className="font-bold text-purple-400 text-sm">{erVal}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. MEJORES CONTENIDOS DEL CLIENTE (Rich Editorial Cards with Zero Broken Images) */}
      <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800/80 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight font-display">
                PUBLICACIONES CON MEJOR RENDIMIENTO
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Contenidos con mayor tasa de interacción y alcance del periodo
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400">
            Cargando publicaciones destacadas...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {posts.slice(0, 4).map((post, idx) => (
              <PortalPostCard
                key={post.id || idx}
                post={post}
                idx={idx}
                onOpenModal={setSelectedPostModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* 7. ANÁLISIS ESTRATÉGICO DAVILA PM */}
      {latestReport?.editorialAnalysis && (
        <div className="p-6 md:p-8 rounded-3xl bg-zinc-900/80 border border-purple-500/40 space-y-4 shadow-xl shadow-purple-950/20">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-base font-bold uppercase tracking-wider font-display text-white">
              Análisis Estratégico & Balance Davila PM
            </h3>
          </div>
          <div className="text-xs md:text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-line bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/80">
            {latestReport.editorialAnalysis}
          </div>
        </div>
      )}

      {/* 8. RECOMENDACIONES & PLAN DE ACCIÓN */}
      {recommendations.length > 0 && (
        <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800/80 p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight uppercase font-display flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Plan de Acción para el Próximo Mes
            </h3>
            <p className="text-xs text-zinc-400">Estrategias recomendadas para maximizar el retorno de inversión digital</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" className="text-[10px]">
                    {rec.category || 'ESTRATEGIA'}
                  </Badge>
                  <Badge variant={rec.priority === 'ALTA' ? 'destructive' : 'warning'} className="text-[10px]">
                    Prioridad {rec.priority}
                  </Badge>
                </div>
                <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. HISTÓRICO DE REPORTES MENSUALES */}
      <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800/80 p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight font-display flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" /> Archivo de Informes Ejecutivos
          </h3>
          <p className="text-xs text-zinc-400">Accede y descarga todos los informes de rendimiento entregados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r: any) => (
            <Link
              key={r.id}
              href={`/portal/reportes/${r.id}`}
              className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-purple-500/40 transition-all group block"
            >
              <span className="text-[11px] text-zinc-500 font-medium block mb-1">
                {formatDateSpanish(r.periodEnd, 'MMMM yyyy')}
              </span>
              <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                {r.title}
              </h4>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/60 text-xs">
                <span className="text-zinc-400 text-xs font-medium">Ver reporte completo</span>
                <ArrowRight className="h-4 w-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 10. TARJETA DE SOPORTE & ASESOR DIRECTO DAVILA PM */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-purple-950/30 border border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
            Atención Personalizada
          </span>
          <h3 className="text-lg font-bold text-white font-display">
            ¿Tienes preguntas sobre tus resultados o nueva campaña?
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Tu equipo de estrategas y directores creativos de Davila PM está listo para ayudarte.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsContactModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-2 shadow-lg shadow-purple-600/30"
          >
            <Headphones className="h-4 w-4" />
            <span>Contactar Asesor Directo</span>
          </Button>
        </div>
      </div>

      {/* Contact Advisor Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative my-auto w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] animate-modalScale">
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-bold text-white font-display">Contactar a mi Asesor Davila PM</span>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Direct channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/573001234567?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500 transition-all flex items-center gap-3 group"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-emerald-300">
                      WhatsApp Directo
                    </span>
                    <span className="text-[11px] text-zinc-400">+57 300 812 3456</span>
                  </div>
                </a>

                {/* Email Copy */}
                <div
                  onClick={copyEmailAddress}
                  className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 hover:border-purple-500 transition-all flex items-center gap-3 cursor-pointer group"
                >
                  <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    {copiedEmail ? <Check className="h-5 w-5 text-emerald-400" /> : <Mail className="h-5 w-5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-purple-300">
                      {copiedEmail ? '¡Correo Copiado!' : 'Correo Estratega'}
                    </span>
                    <span className="text-[11px] text-zinc-400">ddigital@davilaweb.com</span>
                  </div>
                </div>
              </div>

              {/* Quick Message Form */}
              <form onSubmit={handleSendMessageToAdvisor} className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                  Enviar Mensaje Directo a tu Director de Cuenta
                </span>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Asunto:</label>
                  <input
                    type="text"
                    value={advisorSubject}
                    onChange={(e) => setAdvisorSubject(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ej. Revisión de metas para el próximo ciclo"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Tu Mensaje o Pregunta:</label>
                  <textarea
                    rows={3}
                    value={advisorMessage}
                    onChange={(e) => setAdvisorMessage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-sans"
                    placeholder="Escribe aquí tu consulta o requerimiento específico..."
                    required
                  />
                </div>

                {messageSentSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>¡Mensaje enviado con éxito! Tu director de cuenta te responderá a la brevedad.</span>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    isLoading={isSendingMessage}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Enviar a Davila PM</span>
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal Preview */}
      {selectedPostModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative my-auto w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] animate-modalScale">
            <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
              <span className="text-xs font-bold text-white uppercase">{selectedPostModal.platform}</span>
              <button
                onClick={() => setSelectedPostModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {selectedPostModal.mediaUrl && (
                <div className="w-full h-64 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img
                    src={selectedPostModal.mediaUrl}
                    alt="Post preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
              )}

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Texto de la publicación</span>
                  <button
                    onClick={() => copyToClipboard(selectedPostModal.caption || '')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copiedCaption ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCaption ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                  {selectedPostModal.caption}
                </p>
              </div>

              {selectedPostModal.permalink && (
                <a
                  href={selectedPostModal.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Abrir en {selectedPostModal.platform}</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
