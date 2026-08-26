import { UnifiedSocialPost } from './types';

export function getMockPostsForBrand(clientName: string, platform: string = 'INSTAGRAM'): UnifiedSocialPost[] {
  const images = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80'
  ];

  return [
    {
      id: `post-top-1-${platform}`,
      platform: platform as any,
      publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      caption: `Innovación y calidad que transforman proyectos. En ${clientName} seguimos marcando la pauta con soluciones de vanguardia. 🚀🏗️ #Liderazgo #${clientName.replace(/\s+/g, '')}`,
      mediaUrl: images[0],
      thumbnailUrl: images[0],
      postType: 'reel',
      likes: 1420,
      comments: 98,
      shares: 145,
      saves: 210,
      reach: 28400,
      impressions: 34900,
      engagementRate: 6.59,
      permalink: 'https://instagram.com'
    },
    {
      id: `post-top-2-${platform}`,
      platform: platform as any,
      publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      caption: `Detrás de cada gran resultado hay un equipo comprometido con la excelencia. Descubre el proceso de ingeniería de ${clientName}.`,
      mediaUrl: images[1],
      thumbnailUrl: images[1],
      postType: 'carousel',
      likes: 890,
      comments: 42,
      shares: 67,
      saves: 115,
      reach: 18200,
      impressions: 22100,
      engagementRate: 6.12,
      permalink: 'https://instagram.com'
    },
    {
      id: `post-top-3-${platform}`,
      platform: platform as any,
      publishedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      caption: `Tendencias de sostenibilidad y desarrollo arquitectónico en Colombia para este año. Conoce nuestro nuevo reporte técnico.`,
      mediaUrl: images[2],
      thumbnailUrl: images[2],
      postType: 'image',
      likes: 640,
      comments: 31,
      shares: 88,
      saves: 194,
      reach: 14500,
      impressions: 17800,
      engagementRate: 6.57,
      permalink: 'https://instagram.com'
    },
    {
      id: `post-top-4-${platform}`,
      platform: platform as any,
      publishedAt: new Date(Date.now() - 16 * 86400000).toISOString(),
      caption: `¡Gran impacto en el sector! Gracias a toda nuestra comunidad por confiar en la solidez y trayectoria de nuestra marca.`,
      mediaUrl: images[3],
      thumbnailUrl: images[3],
      postType: 'video',
      likes: 512,
      comments: 19,
      shares: 34,
      saves: 76,
      reach: 11200,
      impressions: 13900,
      engagementRate: 5.72,
      permalink: 'https://instagram.com'
    }
  ];
}

export function generateTimelineMetrics(days: number = 30, baseFollowers: number = 24500) {
  const result = [];
  const now = new Date();
  let currentFollowers = baseFollowers - Math.floor(days * 12);

  for (let i = days; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dailyGain = Math.floor(Math.random() * 25) + 5;
    currentFollowers += dailyGain;
    const reach = Math.floor(Math.random() * 1500) + 800;
    const impressions = Math.floor(reach * 1.35);
    const interactions = Math.floor(reach * (0.045 + Math.random() * 0.03));

    result.push({
      date: dateStr,
      followers: currentFollowers,
      reach,
      impressions,
      interactions,
      engagement: Number(((interactions / reach) * 100).toFixed(2)),
      postsCount: i % 3 === 0 ? 1 : 0
    });
  }
  return result;
}
