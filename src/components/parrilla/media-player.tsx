'use client';

import React, { useState } from 'react';
import {
  Play,
  Maximize2,
  ExternalLink,
  Film,
  FileText,
  Volume2,
  Sparkles,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import {
  detectMediaType,
  normalizeMediaUrl,
  getDriveVideoEmbedUrl,
  getYoutubeEmbedUrl
} from '@/lib/utils';

interface MediaPlayerProps {
  mediaUrl: string | null | undefined;
  contentType?: string;
  title?: string;
  aspectRatio?: 'auto' | 'video' | 'reel' | 'square';
  onZoomImage?: (url: string) => void;
  className?: string;
}

export function MediaPlayer({
  mediaUrl,
  contentType,
  title,
  aspectRatio = 'auto',
  onZoomImage,
  className = ''
}: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!mediaUrl) {
    return (
      <div className={`aspect-video rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center text-zinc-500 p-4 text-center ${className}`}>
        <ImageIcon className="h-8 w-8 text-zinc-600 mb-1" />
        <p className="text-xs">Sin archivo multimedia adjunto</p>
      </div>
    );
  }

  const mediaType = detectMediaType(mediaUrl, contentType);
  const isReelOrTikTok = contentType === 'REEL' || contentType === 'TIKTOK' || contentType === 'STORY';

  // 1. Google Drive Video Player
  if (mediaType === 'DRIVE_VIDEO') {
    const embedUrl = getDriveVideoEmbedUrl(mediaUrl);
    return (
      <div className={`relative rounded-xl overflow-hidden border border-zinc-800 bg-black flex flex-col items-center justify-center ${isReelOrTikTok ? 'aspect-[9/14] max-w-[340px] mx-auto' : 'aspect-video w-full'} ${className}`}>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title || 'Reproductor de Video Google Drive'}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <div className="p-4 text-center text-xs text-zinc-400">
            <Film className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p>Video de Google Drive</p>
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold"
            >
              <span>Ver en Drive</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // 2. YouTube / YouTube Shorts Player
  if (mediaType === 'YOUTUBE') {
    const ytUrl = getYoutubeEmbedUrl(mediaUrl);
    return (
      <div className={`relative rounded-xl overflow-hidden border border-zinc-800 bg-black ${isReelOrTikTok ? 'aspect-[9/16] max-w-[320px] mx-auto' : 'aspect-video w-full'} ${className}`}>
        {ytUrl ? (
          <iframe
            src={ytUrl}
            title={title || 'YouTube Video'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="p-4 text-center text-xs text-zinc-400">
            Abrir Video en YouTube
          </a>
        )}
      </div>
    );
  }

  // 3. Direct HTML5 Video (.mp4, .webm, .mov)
  if (mediaType === 'VIDEO_DIRECT') {
    return (
      <div className={`relative rounded-xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center ${isReelOrTikTok ? 'aspect-[9/14] max-w-[340px] mx-auto' : 'aspect-video w-full'} ${className}`}>
        <video
          src={mediaUrl}
          controls
          playsInline
          className="w-full h-full object-contain"
        >
          Tu navegador no soporta reproducción de video HTML5.
        </video>
      </div>
    );
  }

  // 4. Canva / Figma Link
  if (mediaType === 'CANVA_FIGMA') {
    const isCanva = mediaUrl.includes('canva');
    return (
      <div className={`aspect-video rounded-xl bg-gradient-to-br from-purple-950/50 via-zinc-950 to-zinc-900 border border-purple-500/30 p-6 flex flex-col items-center justify-center text-center gap-2.5 ${className}`}>
        <div className="h-12 w-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Diseño Interactivo en {isCanva ? 'Canva' : 'Figma'}</h4>
          <p className="text-xs text-zinc-400">Arte listo para revisión y edición colaborativa</p>
        </div>
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all"
        >
          <span>Abrir Proyecto en {isCanva ? 'Canva' : 'Figma'}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  // 5. Standard Image (Google Drive converted, Unsplash, direct images)
  const normalized = normalizeMediaUrl(mediaUrl);

  return (
    <div
      onClick={() => onZoomImage && onZoomImage(normalized)}
      className={`relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center cursor-pointer group ${className}`}
      title="Clic para ampliar en pantalla completa"
    >
      <img
        src={normalized}
        alt={title || 'Arte Preview'}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={() => setImgError(true)}
      />

      {/* Hover Zoom overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-semibold">
        <Maximize2 className="h-4 w-4" />
        <span>Ver Arte Completo</span>
      </div>
    </div>
  );
}
