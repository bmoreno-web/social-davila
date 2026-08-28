'use client';

import React from 'react';
import {
  Clock,
  Film,
  Layers,
  Image as ImageIcon,
  Video,
  Share2,
  AlertCircle,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Plus,
  Play
} from 'lucide-react';
import { ContentPost, ContentPostStatus, STATUS_CONFIG } from './types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { normalizeMediaUrl } from '@/lib/utils';

interface ContentKanbanViewProps {
  posts: ContentPost[];
  onSelectPost: (p: ContentPost) => void;
  onNewPost: (status?: ContentPostStatus) => void;
  onQuickStatusChange?: (post: ContentPost, newStatus: ContentPostStatus) => void;
}

const COLUMNS: { id: ContentPostStatus; title: string; desc: string; color: string }[] = [
  {
    id: 'BORRADOR',
    title: 'Borradores',
    desc: 'En creación por equipo',
    color: 'border-zinc-700 bg-zinc-900/40 text-zinc-300'
  },
  {
    id: 'PENDIENTE_APROBACION',
    title: 'En Revisión Cliente',
    desc: 'Esperando respuesta del cliente',
    color: 'border-amber-500/30 bg-amber-950/10 text-amber-300'
  },
  {
    id: 'CAMBIOS_SOLICITADOS',
    title: 'Cambios Solicitados',
    desc: 'Ajustes pedidos por el cliente',
    color: 'border-rose-500/30 bg-rose-950/10 text-rose-300'
  },
  {
    id: 'APROBADO',
    title: 'Aprobados',
    desc: 'Listos para programar',
    color: 'border-emerald-500/30 bg-emerald-950/10 text-emerald-300'
  },
  {
    id: 'PUBLICADO',
    title: 'Publicados',
    desc: 'En el aire en redes',
    color: 'border-purple-500/30 bg-purple-950/10 text-purple-300'
  }
];

const FORMAT_ICONS: Record<string, any> = {
  REEL: Film,
  CAROUSEL: Layers,
  IMAGE: ImageIcon,
  STORY: Clock,
  VIDEO: Video,
  TIKTOK: Share2
};

export function ContentKanbanView({
  posts,
  onSelectPost,
  onNewPost,
  onQuickStatusChange
}: ContentKanbanViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colPosts = posts.filter((p) => p.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-[#0b0e14] border border-zinc-800/80 rounded-2xl p-3 min-h-[500px] shadow-lg"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                    {col.title}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {colPosts.length}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">{col.desc}</p>
              </div>

              {col.id === 'BORRADOR' && (
                <button
                  onClick={() => onNewPost('BORRADOR')}
                  title="Nueva publicación"
                  className="p-1 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {colPosts.length === 0 ? (
                <div className="h-32 border border-dashed border-zinc-800/60 rounded-xl flex items-center justify-center text-center p-3 text-zinc-600 text-xs">
                  Sin publicaciones
                </div>
              ) : (
                colPosts.map((post) => {
                  const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.BORRADOR;
                  const Icon = FORMAT_ICONS[post.contentType] || ImageIcon;
                  const pDate = new Date(post.scheduledDate);
                  const formattedDate = pDate.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  });
                  const formattedTime = pDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 rounded-xl p-3.5 transition-all duration-150 hover:shadow-lg cursor-pointer group space-y-2.5"
                    >
                      {/* Media preview banner if present */}
                      {post.mediaUrls && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                          <img
                            src={normalizeMediaUrl(post.mediaUrls)}
                            alt="Preview"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          {(post.contentType === 'REEL' || post.contentType === 'VIDEO' || post.contentType === 'TIKTOK') && (
                            <div className="absolute h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-md">
                              <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Header tags & Date */}
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Icon className="h-3 w-3 text-purple-400" />
                          {post.contentType}
                        </span>

                        <span className="text-zinc-400 font-mono">
                          📅 {formattedDate} • {formattedTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h5 className="text-xs font-bold text-zinc-100 group-hover:text-purple-300 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h5>

                      {/* Copy preview snippet */}
                      {post.copy && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                          {post.copy}
                        </p>
                      )}

                      {/* Client feedback note */}
                      {post.clientFeedback && post.status === 'CAMBIOS_SOLICITADOS' && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 text-[10px] text-rose-300 flex items-start gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400" />
                          <p className="line-clamp-2 italic">"{post.clientFeedback}"</p>
                        </div>
                      )}

                      {/* Card Footer: Platforms & Comments */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                        <span className="font-semibold text-purple-400/80">
                          {post.platforms.split(',').join(', ')}
                        </span>

                        <div className="flex items-center gap-2">
                          {post.comments && post.comments.length > 0 && (
                            <span className="flex items-center gap-1 text-zinc-400">
                              <MessageSquare className="h-3 w-3" />
                              {post.comments.length}
                            </span>
                          )}

                          {post.client?.name && (
                            <span className="text-zinc-500 font-medium truncate max-w-[80px]">
                              {post.client.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
