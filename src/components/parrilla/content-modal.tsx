'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Trash2,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Layers,
  Film,
  Instagram,
  Facebook,
  Linkedin,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentPost, ContentPostStatus, ContentType, STATUS_CONFIG } from './types';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ContentPost | null;
  clients: Array<{ id: string; name: string; logo?: string | null; slug?: string }>;
  selectedClientId?: string;
  onSaved: () => void;
  currentUserRole?: string;
  currentUserName?: string;
}

const AVAILABLE_PLATFORMS = [
  { id: 'INSTAGRAM', label: 'Instagram', color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' },
  { id: 'FACEBOOK', label: 'Facebook', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { id: 'TIKTOK', label: 'TikTok', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { id: 'LINKEDIN', label: 'LinkedIn', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { id: 'YOUTUBE', label: 'YouTube', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  { id: 'THREADS', label: 'Threads', color: 'text-zinc-300 border-zinc-500/30 bg-zinc-500/10' }
];

const CONTENT_TYPES: { id: ContentType; label: string; icon: any }[] = [
  { id: 'IMAGE', label: 'Imagen', icon: ImageIcon },
  { id: 'CAROUSEL', label: 'Carrusel', icon: Layers },
  { id: 'REEL', label: 'Reel', icon: Film },
  { id: 'STORY', label: 'Story', icon: Clock },
  { id: 'VIDEO', label: 'Video', icon: Video },
  { id: 'TIKTOK', label: 'TikTok', icon: Share2 }
];

export function ContentModal({
  isOpen,
  onClose,
  post,
  clients,
  selectedClientId,
  onSaved,
  currentUserRole = 'TEAM',
  currentUserName = 'Agencia Davila'
}: ContentModalProps) {
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [copy, setCopy] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['INSTAGRAM']);
  const [contentType, setContentType] = useState<ContentType>('IMAGE');
  const [mediaUrls, setMediaUrls] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<ContentPostStatus>('BORRADOR');
  const [clientFeedback, setClientFeedback] = useState('');

  // Comment thread
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComment, setLoadingComment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (post) {
      setClientId(post.clientId);
      setTitle(post.title);
      setCopy(post.copy || '');
      
      const d = new Date(post.scheduledDate);
      const datePart = d.toISOString().split('T')[0];
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setScheduledDate(datePart);
      setScheduledTime(`${hours}:${mins}`);

      const plats = post.platforms ? post.platforms.split(',').map(p => p.trim()) : ['INSTAGRAM'];
      setSelectedPlatforms(plats);
      setContentType((post.contentType as ContentType) || 'IMAGE');
      setMediaUrls(post.mediaUrls || '');
      setTags(post.tags || '');
      setStatus(post.status);
      setClientFeedback(post.clientFeedback || '');
      setComments(post.comments || []);
    } else {
      // Default new
      setClientId(selectedClientId && selectedClientId !== 'ALL' ? selectedClientId : (clients[0]?.id || ''));
      setTitle('');
      setCopy('');
      const today = new Date().toISOString().split('T')[0];
      setScheduledDate(today);
      setScheduledTime('16:00');
      setSelectedPlatforms(['INSTAGRAM']);
      setContentType('IMAGE');
      setMediaUrls('');
      setTags('');
      setStatus('BORRADOR');
      setClientFeedback('');
      setComments([]);
    }
  }, [post, isOpen, selectedClientId, clients]);

  if (!isOpen) return null;

  const togglePlatform = (pId: string) => {
    if (selectedPlatforms.includes(pId)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== pId));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, pId]);
    }
  };

  const handleSave = async (overrideStatus?: ContentPostStatus) => {
    if (!title.trim()) {
      alert('Por favor ingresa un título para la publicación.');
      return;
    }
    if (!clientId) {
      alert('Por favor selecciona un cliente.');
      return;
    }

    setSaving(true);
    try {
      const finalStatus = overrideStatus || status;
      const combinedDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

      const payload = {
        clientId,
        title,
        copy,
        scheduledDate: isNaN(combinedDateTime.getTime()) ? new Date() : combinedDateTime,
        platforms: selectedPlatforms.join(','),
        contentType,
        mediaUrls,
        tags,
        status: finalStatus,
        clientFeedback
      };

      let res;
      if (post?.id) {
        res = await fetch(`/api/content-posts/${post.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/content-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al guardar la publicación');
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado al conectar con el servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post?.id) return;
    if (!confirm('¿Estás seguro de eliminar esta publicación de la parrilla?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/content-posts/${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post?.id) return;

    setLoadingComment(true);
    try {
      const res = await fetch(`/api/content-posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment })
      });
      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComment(false);
    }
  };

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.BORRADOR;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e1118] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {post ? 'Editar Publicación de Parrilla' : 'Nueva Publicación Planificada'}
              </h2>
              <p className="text-xs text-zinc-400">
                Parrilla editorial & flujo de aprobación Davila PM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusCfg.badgeVariant} className="text-xs px-2.5 py-1">
              {statusCfg.label}
            </Badge>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Client Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Cliente
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={Boolean(post)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-60"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title / Topic */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Título del Post / Concepto
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Reel: 3 Consejos de diseño estructural..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Redes Sociales de Destino
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PLATFORMS.map((plat) => {
                  const isSelected = selectedPlatforms.includes(plat.id);
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => togglePlatform(plat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? plat.color
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {plat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format & Scheduling Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Content Type */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Formato
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CONTENT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = contentType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setContentType(t.id)}
                        className={`p-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Fecha Planificada
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Hora Sugerida
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Copy / Caption */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Copy / Texto de la Publicación
                </label>
                <span className="text-[11px] text-zinc-500">
                  {copy.length} caracteres
                </span>
              </div>
              <textarea
                rows={5}
                value={copy}
                onChange={(e) => setCopy(e.target.value)}
                placeholder="Escribe el texto persuasivo, llamadas a la acción y hashtags..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-sans leading-relaxed"
              />
            </div>

            {/* Media URL / Drive preview */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                URL de Arte / Vista Previa (Imagen o Enlace Drive/Figma)
              </label>
              <input
                type="text"
                value={mediaUrls}
                onChange={(e) => setMediaUrls(e.target.value)}
                placeholder="https://images.unsplash.com/... o enlace de recurso"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Tags / Campaign */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Etiquetas / Campaña (Opcional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ej. Black Friday, Educativo, Producto Estrella"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Right Column: Visual Preview & Comments Thread (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4 border-t lg:border-t-0 lg:border-l border-zinc-800 lg:pl-6">
            {/* Visual Media Card Mockup */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  Previsualización Arte
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  {contentType}
                </span>
              </div>

              {mediaUrls ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                  <img
                    src={mediaUrls}
                    alt="Arte Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
                  <ImageIcon className="h-8 w-8 text-zinc-600 mb-1" />
                  <p className="text-xs">Sin imagen o video adjunto</p>
                  <p className="text-[10px] text-zinc-600">Pega un enlace arriba para previsualizar</p>
                </div>
              )}
            </div>

            {/* Client Feedback Banner if present */}
            {clientFeedback && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>Observación del Cliente:</span>
                </div>
                <p className="text-xs text-zinc-300 italic pl-5">
                  "{clientFeedback}"
                </p>
              </div>
            )}

            {/* Comments / Revision Thread */}
            <div className="flex-1 flex flex-col min-h-[220px] bg-zinc-950/60 rounded-xl border border-zinc-800 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 pb-2 border-b border-zinc-800">
                <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                <span>Hilo de Comentarios y Ajustes</span>
                <span className="ml-auto text-[10px] text-zinc-500">
                  {comments.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto py-2 space-y-2 max-h-[200px] text-xs">
                {comments.length === 0 ? (
                  <p className="text-center text-zinc-500 py-6 text-xs">
                    No hay comentarios en esta publicación aún.
                  </p>
                ) : (
                  comments.map((comm) => {
                    const isClient = comm.authorRole === 'CLIENT';
                    return (
                      <div
                        key={comm.id}
                        className={`p-2.5 rounded-xl border ${
                          isClient
                            ? 'bg-amber-500/10 border-amber-500/20 ml-3'
                            : 'bg-zinc-900 border-zinc-800 mr-3'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-[11px] ${isClient ? 'text-amber-400' : 'text-purple-300'}`}>
                            {comm.authorName}
                          </span>
                          <span className="text-[9px] text-zinc-500">
                            {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-zinc-300 leading-snug">{comm.text}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Comment Form */}
              {post?.id && (
                <form onSubmit={handleAddComment} className="pt-2 border-t border-zinc-800 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribir mensaje para el cliente..."
                    className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="default"
                    disabled={loadingComment || !newComment.trim()}
                    className="px-3 text-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Bar */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {post?.id && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="gap-1.5 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Eliminar</span>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>

            {/* Quick Status Action Buttons */}
            {status !== 'PENDIENTE_APROBACION' && status !== 'APROBADO' && (
              <Button
                type="button"
                variant="warning"
                size="sm"
                onClick={() => handleSave('PENDIENTE_APROBACION')}
                disabled={saving}
                className="text-xs gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Enviar a Revisión Cliente</span>
              </Button>
            )}

            {status !== 'APROBADO' && (
              <Button
                type="button"
                variant="emerald"
                size="sm"
                onClick={() => handleSave('APROBADO')}
                disabled={saving}
                className="text-xs gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Marcar Aprobado</span>
              </Button>
            )}

            {status === 'APROBADO' && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleSave('PUBLICADO')}
                disabled={saving}
                className="text-xs gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Marcar Publicado</span>
              </Button>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving}
              className="text-xs"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
