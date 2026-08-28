export type ContentPostStatus =
  | 'BORRADOR'
  | 'PENDIENTE_APROBACION'
  | 'CAMBIOS_SOLICITADOS'
  | 'APROBADO'
  | 'PUBLICADO';

export type ContentType =
  | 'REEL'
  | 'CAROUSEL'
  | 'IMAGE'
  | 'STORY'
  | 'TIKTOK'
  | 'VIDEO'
  | 'ARTICLE';

export interface ContentComment {
  id: string;
  contentPostId: string;
  authorName: string;
  authorRole: 'AGENCY' | 'CLIENT' | string;
  authorAvatar?: string | null;
  text: string;
  createdAt: string | Date;
}

export interface ContentPost {
  id: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    logo?: string | null;
    slug?: string;
  };
  title: string;
  copy: string;
  scheduledDate: string | Date;
  platforms: string; // "INSTAGRAM,FACEBOOK", etc.
  contentType: ContentType | string;
  mediaUrls?: string | null;
  status: ContentPostStatus;
  clientFeedback?: string | null;
  approvedAt?: string | Date | null;
  approvedBy?: string | null;
  createdById?: string | null;
  tags?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  comments?: ContentComment[];
}

export const STATUS_CONFIG: Record<
  ContentPostStatus,
  { label: string; bg: string; text: string; border: string; badgeVariant: 'default' | 'warning' | 'purple' | 'success' | 'destructive' }
> = {
  BORRADOR: {
    label: 'Borrador',
    bg: 'bg-zinc-800/80',
    text: 'text-zinc-300',
    border: 'border-zinc-700',
    badgeVariant: 'default'
  },
  PENDIENTE_APROBACION: {
    label: 'En Revisión (Cliente)',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badgeVariant: 'warning'
  },
  CAMBIOS_SOLICITADOS: {
    label: 'Cambios Solicitados',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    badgeVariant: 'destructive'
  },
  APROBADO: {
    label: 'Aprobado por Cliente',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badgeVariant: 'success'
  },
  PUBLICADO: {
    label: 'Publicado',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    badgeVariant: 'purple'
  }
};
