'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Layers,
  Film,
  Image as ImageIcon,
  Video,
  Share2,
  ThumbsUp,
  RefreshCw,
  Info,
  Check,
  Maximize2,
  X,
  ExternalLink,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ContentPost, STATUS_CONFIG } from '@/components/parrilla/types';
import { normalizeMediaUrl } from '@/lib/utils';

const FORMAT_ICONS: Record<string, any> = {
  REEL: Film,
  CAROUSEL: Layers,
  IMAGE: ImageIcon,
  STORY: Clock,
  VIDEO: Video,
  TIKTOK: Share2
};

export default function ClientPortalParrillaPage() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDIENTE' | 'TODAS' | 'APROBADAS'>('PENDIENTE');

  // Modals & Feedback state
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const [activeZoomUrl, setActiveZoomUrl] = useState<string | null>(null);

  // New comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content-posts');
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Error fetching client content posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Status Action handlers
  const handleApprove = async (postId: string) => {
    setSubmittingAction(postId);
    try {
      const res = await fetch(`/api/content-posts/${postId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APROBADO' })
      });
      if (res.ok) {
        await fetchPosts();
      } else {
        const d = await res.json();
        alert(d.error || 'Error al aprobar publicación');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleRequestChanges = async (postId: string) => {
    if (!feedbackText.trim()) {
      alert('Por favor describe los cambios solicitados para que el equipo de Davila PM pueda ajustarlo.');
      return;
    }

    setSubmittingAction(postId);
    try {
      const res = await fetch(`/api/content-posts/${postId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CAMBIOS_SOLICITADOS',
          feedback: feedbackText.trim()
        })
      });
      if (res.ok) {
        setActiveFeedbackId(null);
        setFeedbackText('');
        await fetchPosts();
      } else {
        const d = await res.json();
        alert(d.error || 'Error al enviar feedback');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleSendComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/content-posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      });
      if (res.ok) {
        setCommentInputs({ ...commentInputs, [postId]: '' });
        await fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const total = posts.length;
  const pending = posts.filter((p) => p.status === 'PENDIENTE_APROBACION').length;
  const changes = posts.filter((p) => p.status === 'CAMBIOS_SOLICITADOS').length;
  const approvedCount = posts.filter((p) => p.status === 'APROBADO' || p.status === 'PUBLICADO').length;
  const approvalPercent = total > 0 ? Math.round((approvedCount / total) * 100) : 100;

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (statusFilter === 'PENDIENTE') {
      return p.status === 'PENDIENTE_APROBACION' || p.status === 'CAMBIOS_SOLICITADOS';
    }
    if (statusFilter === 'APROBADAS') {
      return p.status === 'APROBADO' || p.status === 'PUBLICADO';
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-zinc-950 border border-purple-500/20 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider uppercase">
                Centro de Aprobación
              </span>
              <span className="text-xs text-zinc-400">
                Parrilla Editorial Davila PM
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-display">
              Aprobación de Contenidos & Redes
            </h1>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Revisa las propuestas de publicaciones preparadas para tu marca, valida los copies y artes con un clic o solicita ajustes directamente.
            </p>
          </div>

          {/* Quick Progress Circle / Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="relative h-14 w-14 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-700"
                  strokeDasharray={`${approvalPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">
                {approvalPercent}%
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {approvedCount} de {total} Aprobados
              </p>
              <p className="text-[11px] text-zinc-400">
                {pending > 0 ? `${pending} pendientes de tu revisión` : '¡Todo al día!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setStatusFilter('PENDIENTE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              statusFilter === 'PENDIENTE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Pendientes de Revisión ({pending + changes})</span>
          </button>

          <button
            onClick={() => setStatusFilter('APROBADAS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              statusFilter === 'APROBADAS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Aprobadas ({approvedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('TODAS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'TODAS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todas ({total})
          </button>
        </div>

        <Button
          onClick={fetchPosts}
          variant="outline"
          size="sm"
          className="text-xs text-zinc-400 gap-1.5 border-zinc-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </Button>
      </div>

      {/* Posts List / Grid */}
      {filteredPosts.length === 0 ? (
        <Card className="p-12 text-center bg-[#0c0e15] border-zinc-800 flex flex-col items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400/60 mb-3" />
          <h3 className="text-base font-bold text-white font-display">
            {statusFilter === 'PENDIENTE'
              ? '¡No tienes publicaciones pendientes de aprobación!'
              : 'No se encontraron publicaciones en esta sección.'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-md">
            Tu equipo de Davila PM te notificará en cuanto se carguen nuevas propuestas de contenido.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post) => {
            const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.BORRADOR;
            const Icon = FORMAT_ICONS[post.contentType] || ImageIcon;
            const pDate = new Date(post.scheduledDate);
            const dateFormatted = pDate.toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            const timeFormatted = pDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            const isPending = post.status === 'PENDIENTE_APROBACION';
            const isChanges = post.status === 'CAMBIOS_SOLICITADOS';
            const isApproved = post.status === 'APROBADO' || post.status === 'PUBLICADO';
            const isFeedbackOpen = activeFeedbackId === post.id;
            const isSubmittingThis = submittingAction === post.id;

            return (
              <div
                key={post.id}
                className="bg-[#0b0e14] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all duration-200 hover:border-zinc-700"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        {post.contentType} • {post.platforms.split(',').join(' & ')}
                      </span>
                      <span className="text-xs font-semibold text-zinc-200">
                        📅 {dateFormatted} a las {timeFormatted}
                      </span>
                    </div>
                  </div>

                  <Badge variant={cfg.badgeVariant} className="text-xs">
                    {cfg.label}
                  </Badge>
                </div>

                {/* Media Preview if available */}
                {post.mediaUrls && (
                  (() => {
                    const norm = normalizeMediaUrl(post.mediaUrls);
                    const isCanvaFigma = post.mediaUrls.includes('canva.com') || post.mediaUrls.includes('figma.com');

                    if (isCanvaFigma) {
                      return (
                        <div className="aspect-video bg-gradient-to-br from-purple-950/40 to-zinc-950 border-b border-zinc-800 p-6 flex flex-col items-center justify-center text-center gap-2">
                          <FileText className="h-10 w-10 text-purple-400" />
                          <div>
                            <p className="text-sm font-bold text-white">Diseño Interactivo en {post.mediaUrls.includes('canva') ? 'Canva' : 'Figma'}</p>
                            <p className="text-xs text-zinc-400">Arte editable preparado para revisión</p>
                          </div>
                          <a
                            href={post.mediaUrls}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 mt-1"
                          >
                            <span>Abrir Arte en {post.mediaUrls.includes('canva') ? 'Canva' : 'Figma'}</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      );
                    }

                    return (
                      <div
                        onClick={() => setActiveZoomUrl(norm)}
                        className="relative aspect-video bg-zinc-950 border-b border-zinc-800 overflow-hidden flex items-center justify-center cursor-pointer group"
                        title="Clic para ampliar arte en pantalla completa"
                      >
                        <img
                          src={norm}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-semibold">
                          <Maximize2 className="h-4 w-4" />
                          <span>Ver Arte en Pantalla Completa</span>
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Body Content */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white font-display leading-snug">
                      {post.title}
                    </h3>
                  </div>

                  {/* Copy box */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {post.copy}
                  </div>

                  {/* Feedback notice if changes requested */}
                  {post.clientFeedback && isChanges && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>Ajuste Solicitado por ti:</span>
                      </div>
                      <p className="italic pl-5">"{post.clientFeedback}"</p>
                    </div>
                  )}

                  {/* Approved info banner */}
                  {isApproved && post.approvedBy && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>
                        Aprobado por <strong>{post.approvedBy}</strong>
                        {post.approvedAt && ` el ${new Date(post.approvedAt).toLocaleDateString('es-ES')}`}
                      </span>
                    </div>
                  )}

                  {/* Comment Thread */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                        Mensajes con la Agencia ({post.comments.length})
                      </p>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {post.comments.map((c) => (
                          <div
                            key={c.id}
                            className={`p-2.5 rounded-xl text-xs border ${
                              c.authorRole === 'CLIENT'
                                ? 'bg-amber-500/10 border-amber-500/20 ml-2'
                                : 'bg-zinc-900 border-zinc-800 mr-2'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold text-[10px] ${c.authorRole === 'CLIENT' ? 'text-amber-400' : 'text-purple-300'}`}>
                                {c.authorName}
                              </span>
                              <span className="text-[9px] text-zinc-500">
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-zinc-300">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline Request Changes Form */}
                {isFeedbackOpen && (
                  <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <label className="block text-xs font-bold text-rose-300">
                      ¿Qué cambios o correcciones deseas solicitar en esta publicación?
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Ej. Modificar el texto de la diapositiva 2, cambiar la fecha para el jueves, o ajustar la imagen..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveFeedbackId(null);
                          setFeedbackText('');
                        }}
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRequestChanges(post.id)}
                        disabled={isSubmittingThis || !feedbackText.trim()}
                        className="text-xs gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Enviar Solicitud de Ajuste</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
                  {/* Add Quick Comment Input */}
                  <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({
                          ...commentInputs,
                          [post.id]: e.target.value
                        })
                      }
                      placeholder="Escribir mensaje a la agencia..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => handleSendComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                      className="px-2.5 text-xs"
                    >
                      <Send className="h-3.5 w-3.5 text-purple-400" />
                    </Button>
                  </div>

                  {/* Primary Approval / Request Changes Buttons */}
                  <div className="flex items-center gap-2">
                    {!isApproved && (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setActiveFeedbackId(isFeedbackOpen ? null : post.id);
                            setFeedbackText('');
                          }}
                          className="text-xs gap-1.5"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Pedir Cambios</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="emerald"
                          onClick={() => handleApprove(post.id)}
                          disabled={isSubmittingThis}
                          className="text-xs font-bold gap-1.5 shadow-md shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Aprobar Publicación</span>
                        </Button>
                      </>
                    )}

                    {isApproved && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Publicación Aprobada</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Lightbox Modal for Full Screen Art Review */}
      {activeZoomUrl && (
        <div
          onClick={() => setActiveZoomUrl(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-800">
            <img
              src={activeZoomUrl}
              alt="Arte en Pantalla Completa"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setActiveZoomUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
