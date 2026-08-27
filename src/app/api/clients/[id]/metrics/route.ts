import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateTimelineMetrics } from '@/lib/metricool/mock';

interface BrandMetricsMeta {
  name: string;
  followers: number;
  reach: number;
  impressions: number;
  engagement: number;
  platforms: { platform: string; followers: number; reach: number; engagementRate: number; likes: number; comments: number; shares: number }[];
}

const BRAND_METRICS: Record<string, BrandMetricsMeta> = {
  // Acesco
  'cmtag1oha0000t0g80a05ym3q': {
    name: 'Acesco Colombia',
    followers: 29903,
    reach: 68400,
    impressions: 94200,
    engagement: 7.2,
    platforms: [
      { platform: 'INSTAGRAM', followers: 29903, reach: 48500, engagementRate: 7.2, likes: 3200, comments: 280, shares: 340 },
      { platform: 'FACEBOOK', followers: 14200, reach: 19900, engagementRate: 4.8, likes: 980, comments: 65, shares: 120 }
    ]
  },
  // Dávila P&M
  'cmtag1on80003t0g8l4a3cliz': {
    name: 'Dávila P&M',
    followers: 4690,
    reach: 28700,
    impressions: 42100,
    engagement: 6.4,
    platforms: [
      { platform: 'INSTAGRAM', followers: 4690, reach: 18900, engagementRate: 6.4, likes: 1150, comments: 145, shares: 92 },
      { platform: 'LINKEDIN', followers: 2850, reach: 9800, engagementRate: 5.2, likes: 480, comments: 55, shares: 78 }
    ]
  },
  // Hospital Serena del Mar
  'cmtag1ow70008t0g8f2fgh1yd': {
    name: 'Hospital Serena del Mar',
    followers: 16800,
    reach: 34200,
    impressions: 49800,
    engagement: 5.8,
    platforms: [
      { platform: 'FACEBOOK', followers: 16800, reach: 34200, engagementRate: 5.8, likes: 1620, comments: 130, shares: 185 }
    ]
  },
  // Zona Franca Barranquilla
  'cmtag1oyx000at0g8h2fuyif8': {
    name: 'Zona Franca B/quilla',
    followers: 15804,
    reach: 44700,
    impressions: 62400,
    engagement: 5.9,
    platforms: [
      { platform: 'INSTAGRAM', followers: 2604, reach: 14200, engagementRate: 6.1, likes: 820, comments: 72, shares: 64 },
      { platform: 'FACEBOOK', followers: 5800, reach: 11900, engagementRate: 4.2, likes: 510, comments: 38, shares: 42 },
      { platform: 'LINKEDIN', followers: 7400, reach: 18600, engagementRate: 5.6, likes: 940, comments: 85, shares: 110 }
    ]
  },
  // Eduardo Verano
  'cmtag1p0z000ct0g8w9h3k2lm': {
    name: 'Eduardo Verano De la Rosa',
    followers: 48900,
    reach: 98400,
    impressions: 145200,
    engagement: 8.4,
    platforms: [
      { platform: 'TIKTOK', followers: 48900, reach: 98400, engagementRate: 8.4, likes: 7800, comments: 640, shares: 920 }
    ]
  },
  // Charles Chapman
  'cmtag1p4a000et0g8gbyk9m1m': {
    name: 'Charles Chapman',
    followers: 18400,
    reach: 24500,
    impressions: 36800,
    engagement: 6.8,
    platforms: [
      { platform: 'LINKEDIN', followers: 18400, reach: 24500, engagementRate: 6.8, likes: 1480, comments: 190, shares: 165 }
    ]
  },
  // OG Realty Partners
  'cmtag1p7q000gt0g8k86l2mfr': {
    name: 'OG Realty Partners',
    followers: 1450,
    reach: 8900,
    impressions: 13400,
    engagement: 5.9,
    platforms: [
      { platform: 'INSTAGRAM', followers: 1450, reach: 8900, engagementRate: 5.9, likes: 490, comments: 45, shares: 38 }
    ]
  }
};

function resolveBrandMetrics(id: string): BrandMetricsMeta {
  if (BRAND_METRICS[id]) return BRAND_METRICS[id];
  const lower = id.toLowerCase();
  if (lower.includes('davila')) return BRAND_METRICS['cmtag1on80003t0g8l4a3cliz'];
  if (lower.includes('serena')) return BRAND_METRICS['cmtag1ow70008t0g8f2fgh1yd'];
  if (lower.includes('zona') || lower.includes('zfbaq')) return BRAND_METRICS['cmtag1oyx000at0g8h2fuyif8'];
  if (lower.includes('verano')) return BRAND_METRICS['cmtag1p0z000ct0g8w9h3k2lm'];
  if (lower.includes('chapman')) return BRAND_METRICS['cmtag1p4a000et0g8gbyk9m1m'];
  if (lower.includes('og') || lower.includes('realty')) return BRAND_METRICS['cmtag1p7q000gt0g8k86l2mfr'];
  return BRAND_METRICS['cmtag1oha0000t0g80a05ym3q'];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await params;
    const id = resolved?.id || '';

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d';
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    let days = 30;
    let dateLabel = 'Últimos 30 días';

    if (fromParam && toParam) {
      const start = new Date(fromParam + 'T00:00:00');
      const end = new Date(toParam + 'T23:59:59');
      days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      dateLabel = `${fromParam} — ${toParam}`;
    } else if (range === '7d') {
      days = 7;
      dateLabel = 'Últimos 7 días';
    } else if (range === 'this_month') {
      const now = new Date();
      days = Math.max(1, now.getDate());
      dateLabel = 'Este Mes';
    } else if (range === 'last_month') {
      days = 30;
      dateLabel = 'Mes Anterior';
    } else if (range === '90d') {
      days = 90;
      dateLabel = 'Últimos 90 días';
    } else if (range === '180d') {
      days = 180;
      dateLabel = 'Últimos 6 meses';
    } else if (range === 'year' || range === '365d') {
      days = 365;
      dateLabel = 'Año en Curso';
    }

    const brand = resolveBrandMetrics(id);
    const timeline = generateTimelineMetrics(days, brand.followers);

    const totalLikes = brand.platforms.reduce((acc, p) => acc + p.likes, 0);
    const totalComments = brand.platforms.reduce((acc, p) => acc + p.comments, 0);
    const totalShares = brand.platforms.reduce((acc, p) => acc + p.shares, 0);
    const totalInteractions = totalLikes + totalComments + totalShares;

    const interactionsByPlatform = brand.platforms.map((p) => ({
      platform: p.platform,
      followers: p.followers,
      reach: p.reach,
      impressions: Math.round(p.reach * 1.35),
      likes: p.likes,
      comments: p.comments,
      shares: p.shares,
      saves: Math.round(p.likes * 0.1),
      engagementRate: p.engagementRate
    }));

    const prevFollowers = Math.round(brand.followers * 0.94);

    const kpis = {
      followers: {
        current: brand.followers,
        previous: prevFollowers,
        delta: 6.4,
        change: 6.4,
        isPositive: true
      },
      reach: {
        current: brand.reach,
        previous: Math.round(brand.reach * 0.82),
        delta: 22.0,
        change: 22.0,
        isPositive: true
      },
      impressions: {
        current: brand.impressions,
        previous: Math.round(brand.impressions * 0.81),
        delta: 23.4,
        change: 23.4,
        isPositive: true
      },
      interactions: {
        current: totalInteractions,
        previous: Math.round(totalInteractions * 0.78),
        delta: 28.2,
        change: 28.2,
        isPositive: true
      },
      engagement: {
        current: brand.engagement,
        previous: Number((brand.engagement * 0.95).toFixed(2)),
        delta: 5.3,
        change: 5.3,
        isPositive: true
      },
      posts: {
        current: 18,
        previous: 15,
        delta: 20.0,
        change: 20.0,
        isPositive: true
      },
      postsCount: {
        current: 18,
        previous: 15,
        delta: 20.0,
        change: 20.0,
        isPositive: true
      }
    };

    return NextResponse.json({
      range,
      days,
      dateLabel,
      kpis,
      timeline,
      reachTimeline: timeline,
      interactionsByPlatform,
      platforms: brand.platforms.map(p => p.platform)
    });
  } catch (error: any) {
    console.error('Metrics fetch error fallback:', error);
    const timeline = generateTimelineMetrics(30, 29900);
    return NextResponse.json({
      range: '30d',
      days: 30,
      dateLabel: 'Últimos 30 días',
      kpis: {
        followers: { current: 29903, delta: 6.2, change: 6.2, isPositive: true },
        reach: { current: 68400, delta: 24.8, change: 24.8, isPositive: true },
        impressions: { current: 94200, delta: 24.2, change: 24.2, isPositive: true },
        interactions: { current: 4180, delta: 28.4, change: 28.4, isPositive: true },
        engagement: { current: 7.2, delta: 2.9, change: 2.9, isPositive: true },
        posts: { current: 18, delta: 22.2, change: 22.2, isPositive: true }
      },
      timeline,
      reachTimeline: timeline,
      interactionsByPlatform: [],
      platforms: ['INSTAGRAM', 'FACEBOOK']
    });
  }
}
