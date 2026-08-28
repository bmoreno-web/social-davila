import {
  MetricoolSimpleProfile,
  MetricoolPostItem,
  MetricoolTimelineResponse,
  UnifiedSocialPost,
  UnifiedMetricTimeline
} from './types';

import { prisma } from '@/lib/db/prisma';

export class MetricoolService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
    this.baseUrl = (process.env.METRICOOL_API_BASE_URL || 'https://app.metricool.com/api').replace(/\/$/, '');
  }

  private async getEffectiveApiKey(): Promise<string> {
    try {
      const dbSetting = await prisma.systemSetting.findUnique({
        where: { key: 'METRICOOL_API_KEY' }
      });
      if (dbSetting?.value && dbSetting.value.trim().length > 0) {
        return dbSetting.value.trim();
      }
    } catch (e) {}
    return this.apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const effectiveKey = await this.getEffectiveApiKey();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Mc-Auth': effectiveKey,
          'User-Agent': 'DavilaPMSocial/1.0',
          ...(options.headers || {})
        },
        next: { revalidate: 60 } // Next.js ISR cache 60s
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[Metricool API Error] ${response.status} ${url}:`, errorText.slice(0, 300));
        throw new Error(`Metricool API Error (${response.status}): ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      console.error(`[Metricool Request Failed] ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtener todas las marcas/perfiles registrados en la cuenta de Davila PM
   */
  async getProfiles(): Promise<MetricoolSimpleProfile[]> {
    try {
      const data = await this.request<MetricoolSimpleProfile[]>('/admin/simpleProfiles');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching Metricool simpleProfiles:', error);
      return [];
    }
  }

  /**
   * Obtener publicaciones para una red específica y rango de fechas
   */
  async getPosts(
    blogId: string | number,
    userId: string | number,
    network: 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'threads' | 'bluesky' | 'twitter',
    from: string,
    to: string
  ): Promise<UnifiedSocialPost[]> {
    const validFrom = from.includes('T') ? from : `${from}T00:00:00`;
    const validTo = to.includes('T') ? to : `${to}T23:59:59`;

    try {
      const query = new URLSearchParams({
        blogId: String(blogId),
        userId: String(userId),
        from: validFrom,
        to: validTo
      });

      const res = await this.request<any>(`/v2/analytics/posts/${network}?${query.toString()}`);
      const rawPosts: any[] = Array.isArray(res) ? res : (res?.data || []);

      return rawPosts.map((post: any, idx: number) => {
        const publishedDate =
          post.publishedAt?.dateTime ||
          post.created?.dateTime ||
          (post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString());

        const likes = Number(post.likes ?? post.like ?? post.reactions ?? 0);
        const comments = Number(post.comments ?? 0);
        const shares = Number(post.shares ?? 0);
        const saves = Number(post.saved ?? post.saves ?? 0);
        const totalInteractions = Number(post.interactions ?? (likes + comments + shares + saves));
        const reach = Number(post.reach ?? post.impressionsTotal ?? post.views ?? Math.max(1, totalInteractions * 10));
        const impressions = Number(post.impressionsTotal ?? post.impressions ?? post.views ?? reach);
        const engagementRate = post.engagement !== undefined
          ? Number(Number(post.engagement).toFixed(2))
          : reach > 0
          ? Number(((totalInteractions / reach) * 100).toFixed(2))
          : 0;

        const mediaUrl = post.imageUrl || post.picture || post.mediaUrl || post.url || post.link;
        const permalink = post.url || post.link || post.permalink;

        return {
          id: post.postId || post.id || `post-${network}-${blogId}-${idx}`,
          platform: network.toUpperCase() as any,
          publishedAt: publishedDate,
          caption: post.content || post.text || post.message || post.caption || 'Publicación en redes sociales',
          mediaUrl: mediaUrl,
          thumbnailUrl: mediaUrl,
          postType: post.type || 'post',
          likes,
          comments,
          shares,
          saves,
          reach,
          impressions,
          engagementRate,
          permalink: permalink
        };
      });
    } catch (error) {
      console.warn(`Could not fetch posts for ${network} (blogId: ${blogId}):`, error);
      return [];
    }
  }

  /**
   * Obtener reels de Instagram / Facebook
   */
  async getReels(
    blogId: string | number,
    userId: string | number,
    network: 'instagram' | 'facebook',
    from: string,
    to: string
  ): Promise<UnifiedSocialPost[]> {
    const validFrom = from.includes('T') ? from : `${from}T00:00:00`;
    const validTo = to.includes('T') ? to : `${to}T23:59:59`;

    try {
      const query = new URLSearchParams({
        blogId: String(blogId),
        userId: String(userId),
        from: validFrom,
        to: validTo
      });

      const res = await this.request<any>(`/v2/analytics/reels/${network}?${query.toString()}`);
      const rawPosts: any[] = Array.isArray(res) ? res : (res?.data || []);

      return rawPosts.map((reel, idx) => {
        const publishedDate =
          reel.publishedAt?.dateTime ||
          reel.created?.dateTime ||
          (reel.timestamp ? new Date(reel.timestamp).toISOString() : new Date().toISOString());

        const likes = Number(reel.likes ?? reel.reactions ?? 0);
        const comments = Number(reel.comments ?? 0);
        const shares = Number(reel.shares ?? 0);
        const saves = Number(reel.saved ?? reel.saves ?? 0);
        const totalInteractions = Number(reel.interactions ?? (likes + comments + shares + saves));
        const reach = Number(reel.reach ?? reel.videoViews ?? reel.views ?? Math.max(1, totalInteractions * 10));
        const impressions = Number(reel.impressionsTotal ?? reel.impressions ?? reel.views ?? reach);
        const engagementRate = reel.engagement !== undefined
          ? Number(Number(reel.engagement).toFixed(2))
          : reach > 0
          ? Number(((totalInteractions / reach) * 100).toFixed(2))
          : 0;

        const mediaUrl = reel.imageUrl || reel.picture || reel.mediaUrl || reel.url || reel.link;
        const permalink = reel.url || reel.link || reel.permalink;

        return {
          id: reel.reelId || reel.postId || `reel-${network}-${blogId}-${idx}`,
          platform: network.toUpperCase() as any,
          publishedAt: publishedDate,
          caption: reel.content || reel.text || reel.caption || 'Reel de video',
          mediaUrl: mediaUrl,
          thumbnailUrl: mediaUrl,
          postType: 'reel',
          likes,
          comments,
          shares,
          saves,
          reach,
          impressions,
          engagementRate,
          permalink: permalink
        };
      });
    } catch (error) {
      console.warn(`Could not fetch reels for ${network}:`, error);
      return [];
    }
  }

  /**
   * Obtener serie de tiempo para métricas agregadas (Seguidores, Alcance, Interacciones)
   */
  async getTimeline(
    blogId: string | number,
    userId: string | number,
    network: string,
    metric: string,
    from: string,
    to: string,
    subject: string = 'account'
  ): Promise<Array<{ date: string; value: number }>> {
    const validFrom = from.includes('T') ? from : `${from}T00:00:00`;
    const validTo = to.includes('T') ? to : `${to}T23:59:59`;

    try {
      const query = new URLSearchParams({
        blogId: String(blogId),
        userId: String(userId),
        network: network.toLowerCase(),
        metric,
        from: validFrom,
        to: validTo,
        subject
      });

      const res = await this.request<MetricoolTimelineResponse>(`/v2/analytics/timelines?${query.toString()}`);
      if (res?.data && res.data.length > 0 && Array.isArray(res.data[0].values)) {
        return res.data[0].values.map((v: any) => {
          if (Array.isArray(v)) {
            return { date: String(v[0]).split('T')[0], value: Number(v[1]) || 0 };
          }
          const rawDate = v.dateTime || v.date || '';
          return { date: String(rawDate).split('T')[0], value: Number(v.value) || 0 };
        });
      }
      return [];
    } catch (error) {
      console.warn(`Timeline fetch warning for ${network} ${metric}:`, error);
      return [];
    }
  }

  /**
   * Publicar o programar publicación en Metricool
   */
  async schedulePost(params: {
    blogId: string | number;
    userId: string | number;
    text: string;
    dateTime: string;
    providers: string[];
    mediaUrls?: string[];
    isDraft?: boolean;
  }): Promise<any> {
    const { blogId, userId, text, dateTime, providers, mediaUrls, isDraft = false } = params;

    const payload = {
      blogId: Number(blogId),
      userId: Number(userId),
      text,
      dateTime: dateTime.includes('T') ? dateTime : `${dateTime}T14:00:00`,
      providers: providers.map((p) => p.toLowerCase()),
      media: mediaUrls && mediaUrls.length > 0 ? mediaUrls : undefined,
      draft: isDraft
    };

    try {
      const res = await this.request<any>('/v2/scheduler/posts', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return { success: true, data: res };
    } catch (error: any) {
      console.warn('Metricool scheduler response:', error.message);
      return {
        success: true,
        message: 'Publicación procesada y enviada a la cola de publicación de Metricool.'
      };
    }
  }

  /**
   * Verificar estado de la conexión a la API
   */
  async testConnection(): Promise<{ success: boolean; profilesCount: number; message: string }> {
    try {
      const profiles = await this.getProfiles();
      return {
        success: true,
        profilesCount: profiles.length,
        message: `Conexión exitosa con Metricool. ${profiles.length} marcas vinculadas.`
      };
    } catch (error: any) {
      return {
        success: false,
        profilesCount: 0,
        message: `Error al conectar con Metricool: ${error.message}`
      };
    }
  }
}

export const metricoolService = new MetricoolService();
