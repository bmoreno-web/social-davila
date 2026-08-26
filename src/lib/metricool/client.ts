import {
  MetricoolSimpleProfile,
  MetricoolPostItem,
  MetricoolTimelineResponse,
  UnifiedSocialPost,
  UnifiedMetricTimeline
} from './types';

export class MetricoolService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
    this.baseUrl = (process.env.METRICOOL_API_BASE_URL || 'https://app.metricool.com/api').replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Mc-Auth': this.apiKey,
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
      const rawPosts: MetricoolPostItem[] = Array.isArray(res) ? res : (res?.data || []);

      return rawPosts.map((post, idx) => {
        const publishedDate = post.created?.dateTime || (post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString());
        const likes = post.likes ?? post.like ?? post.reactions ?? 0;
        const comments = post.comments ?? 0;
        const shares = post.shares ?? 0;
        const saves = post.saves ?? 0;
        const reach = post.reach ?? post.impressions ?? (likes + comments) * 10;
        const impressions = post.impressions ?? reach;
        const totalInteractions = likes + comments + shares + saves;
        const engagementRate = reach > 0 ? Number(((totalInteractions / reach) * 100).toFixed(2)) : (post.engagement || 0);

        return {
          id: post.postId || `post-${network}-${blogId}-${idx}`,
          platform: network.toUpperCase() as any,
          publishedAt: publishedDate,
          caption: post.text || 'Sin descripción',
          mediaUrl: post.mediaUrl || post.picture || post.link,
          thumbnailUrl: post.thumbnailUrl || post.picture,
          postType: post.type || 'post',
          likes,
          comments,
          shares,
          saves,
          reach,
          impressions,
          engagementRate,
          permalink: post.link
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
      const rawPosts: MetricoolPostItem[] = Array.isArray(res) ? res : (res?.data || []);

      return rawPosts.map((reel, idx) => {
        const publishedDate = reel.created?.dateTime || (reel.timestamp ? new Date(reel.timestamp).toISOString() : new Date().toISOString());
        const likes = reel.likes ?? reel.reactions ?? 0;
        const comments = reel.comments ?? 0;
        const shares = reel.shares ?? 0;
        const saves = reel.saves ?? 0;
        const reach = reel.reach ?? (reel.videoViews || 0);
        const impressions = reel.impressions ?? reach;
        const totalInteractions = likes + comments + shares + saves;
        const engagementRate = reach > 0 ? Number(((totalInteractions / reach) * 100).toFixed(2)) : (reel.engagement || 0);

        return {
          id: reel.postId || `reel-${network}-${blogId}-${idx}`,
          platform: network.toUpperCase() as any,
          publishedAt: publishedDate,
          caption: reel.text || 'Reel de video',
          mediaUrl: reel.mediaUrl || reel.picture || reel.link,
          thumbnailUrl: reel.thumbnailUrl || reel.picture,
          postType: 'reel',
          likes,
          comments,
          shares,
          saves,
          reach,
          impressions,
          engagementRate,
          permalink: reel.link
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
            return { date: String(v[0]), value: Number(v[1]) || 0 };
          }
          return { date: String(v.date), value: Number(v.value) || 0 };
        });
      }
      return [];
    } catch (error) {
      console.warn(`Timeline fetch warning for ${network} ${metric}:`, error);
      return [];
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
