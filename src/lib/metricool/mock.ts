import { UnifiedSocialPost } from './types';

interface BrandContentTemplate {
  postType: 'reel' | 'carousel' | 'image' | 'video';
  caption: (brand: string) => string;
  image: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagementRate: number;
}

const INDUSTRY_TEMPLATES: Record<string, BrandContentTemplate[]> = {
  legal: [
    {
      postType: 'carousel',
      caption: (brand) => `¿Cómo impactará la nueva reforma laboral los costos de nómina en las empresas? ⚖️📋 Desliza para conocer el análisis jurídico detallado y las recomendaciones preventivas de ${brand}. #DerechoLaboral #EmpresasColombia #GestionHumana`,
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      likes: 1240,
      comments: 115,
      shares: 180,
      saves: 340,
      reach: 24500,
      impressions: 32800,
      engagementRate: 7.65
    },
    {
      postType: 'video',
      caption: (brand) => `Estrategias clave para negociaciones colectivas exitosas en 2026. 💼 Conoce los criterios legales que protegen la estabilidad operativa y fortalecen las relaciones laborales con ${brand}.`,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80',
      likes: 890,
      comments: 64,
      shares: 92,
      saves: 145,
      reach: 17200,
      impressions: 21900,
      engagementRate: 6.92
    },
    {
      postType: 'image',
      caption: (brand) => `La prevención jurídica es la mejor inversión corporativa. En ${brand} asesoramos a las principales compañías del país con rigor ético y excelencia estratégica. 🏛️`,
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
      likes: 620,
      comments: 38,
      shares: 45,
      saves: 88,
      reach: 12800,
      impressions: 16400,
      engagementRate: 6.18
    }
  ],
  realestate: [
    {
      postType: 'reel',
      caption: (brand) => `Exclusividad y alta valorización en el Caribe. 🌴✨ Descubre este recorrido por nuestro proyecto insignia con acabados de lujo y amenidades tipo resort. Agenda tu visita privada con ${brand}. #LuxuryRealEstate #InversionInmobiliaria #Proptech`,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
      likes: 1490,
      comments: 128,
      shares: 195,
      saves: 280,
      reach: 29800,
      impressions: 38400,
      engagementRate: 7.02
    },
    {
      postType: 'carousel',
      caption: (brand) => `¿Por qué invertir en finca raíz en 2026? 📈 3 razones clave por las que el mercado inmobiliario premium sigue ofreciendo retornos sólidos y protección patrimonial. Consulta con ${brand}.`,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      likes: 920,
      comments: 54,
      shares: 88,
      saves: 165,
      reach: 18400,
      impressions: 23600,
      engagementRate: 6.67
    },
    {
      postType: 'image',
      caption: (brand) => `Espacios diseñados para vivir con distinción y confort. Conoce nuestro portafolio de propiedades de alta gama con ${brand}. 🏡💫`,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      likes: 710,
      comments: 32,
      shares: 41,
      saves: 95,
      reach: 13900,
      impressions: 17200,
      engagementRate: 6.32
    }
  ],
  agency: [
    {
      postType: 'reel',
      caption: (brand) => `Detrás de cada campaña exitosa hay una estrategia basada en datos y pasión creativa. 💡🎬 Conoce el proceso de producción de nuestro equipo en ${brand}. #DavilaPM #MarketingDigital #CreatividadEstrategica`,
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      likes: 1350,
      comments: 94,
      shares: 132,
      saves: 215,
      reach: 22800,
      impressions: 31200,
      engagementRate: 7.85
    },
    {
      postType: 'carousel',
      caption: (brand) => `5 tendencias de IA y medios digitales que transformarán la pauta en 2026. 📊 Optimiza tu inversión publicitaria y maximiza el ROI de tus marcas con ${brand}.`,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      likes: 880,
      comments: 62,
      shares: 110,
      saves: 195,
      reach: 16400,
      impressions: 21800,
      engagementRate: 7.61
    },
    {
      postType: 'image',
      caption: (brand) => `Construimos marcas memorables que conectan con su audiencia. Descubre cómo aceleramos el crecimiento digital con ${brand}. 🚀`,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      likes: 640,
      comments: 29,
      shares: 48,
      saves: 82,
      reach: 11900,
      impressions: 15400,
      engagementRate: 6.71
    }
  ],
  health: [
    {
      postType: 'reel',
      caption: (brand) => `Voces Médicas: Conoce los últimos avances en cardiología y cirugía de alta complejidad con nuestros especialistas líderes en ${brand}. Tu salud en las mejores manos. 🏥❤️ #HospitalSerenaDelMar #SaludIntegral #Cartagena`,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      likes: 1680,
      comments: 138,
      shares: 210,
      saves: 310,
      reach: 34200,
      impressions: 44600,
      engagementRate: 6.83
    },
    {
      postType: 'carousel',
      caption: (brand) => `5 chequeos preventivos esenciales que debes realizarte anualmente. Cuidar de ti y tu familia es la prioridad en ${brand}. Agenda tu cita médica digital.`,
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
      likes: 1120,
      comments: 76,
      shares: 145,
      saves: 240,
      reach: 23100,
      impressions: 29800,
      engagementRate: 6.84
    },
    {
      postType: 'image',
      caption: (brand) => `Tecnología médica de punta y atención humanizada al servicio de la región Caribe. En ${brand} transformamos la experiencia de salud. ✨`,
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
      likes: 850,
      comments: 42,
      shares: 68,
      saves: 110,
      reach: 16800,
      impressions: 21400,
      engagementRate: 6.37
    }
  ],
  logistics: [
    {
      postType: 'reel',
      caption: (brand) => `Barranquilla, el hub logístico y portuario por excelencia del Caribe. 🚢✈️ Conoce por qué las empresas líderes eligen el régimen franco de ${brand} para sus operaciones internacionales. #ZonaFrancaBarranquilla #LogisticaCaribe #Nearshoring`,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      likes: 1180,
      comments: 78,
      shares: 142,
      saves: 180,
      reach: 22400,
      impressions: 29500,
      engagementRate: 7.05
    },
    {
      postType: 'carousel',
      caption: (brand) => `3 beneficios tributarios y aduaneros clave al operar en ${brand}: Tarifa de renta del 20%, exención de IVA y 0% aranceles en materias primas. 📦📑`,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      likes: 840,
      comments: 52,
      shares: 98,
      saves: 210,
      reach: 17800,
      impressions: 23400,
      engagementRate: 6.74
    },
    {
      postType: 'image',
      caption: (brand) => `Infraestructura de clase mundial y bodegas construidas a la medida de tu negocio en ${brand}. Conéctate con el mundo desde el Caribe. 🌐`,
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&auto=format&fit=crop&q=80',
      likes: 630,
      comments: 31,
      shares: 44,
      saves: 85,
      reach: 12900,
      impressions: 16800,
      engagementRate: 6.12
    }
  ],
  public_sector: [
    {
      postType: 'reel',
      caption: (brand) => `¡En el territorio cumpliendo con la gente! 🇨🇴 Recorremos las obras de acueducto, vías y desarrollo social que transforman el departamento. Seguimos avanzando con ${brand}. #ObrasQueTransforman #Liderazgo #Caribe`,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      likes: 4200,
      comments: 380,
      shares: 560,
      saves: 420,
      reach: 68400,
      impressions: 92100,
      engagementRate: 8.13
    },
    {
      postType: 'carousel',
      caption: (brand) => `Avance de gestión: 50 kilómetros de nuevas vías comunitarias entregadas para conectar a nuestros campesinos con los mercados locales. 🛣️🚜 Con ${brand}.`,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      likes: 2890,
      comments: 210,
      shares: 340,
      saves: 215,
      reach: 48200,
      impressions: 64100,
      engagementRate: 7.58
    },
    {
      postType: 'image',
      caption: (brand) => `La educación y las oportunidades para los jóvenes son el motor del progreso. Más becas universitarias para el futuro de nuestra región con ${brand}. 🎓`,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      likes: 1950,
      comments: 145,
      shares: 190,
      saves: 160,
      reach: 32600,
      impressions: 43200,
      engagementRate: 7.50
    }
  ],
  construction: [
    {
      postType: 'reel',
      caption: (brand) => `¡Solidez e innovación estructural en cada proyecto! 🏗️ Conoce por qué los grandes contratistas de Colombia eligen la calidad certificada de ${brand}. #IngenieriaCivil #Construccion #Acero`,
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
      likes: 1840,
      comments: 112,
      shares: 240,
      saves: 310,
      reach: 34200,
      impressions: 41800,
      engagementRate: 7.31
    },
    {
      postType: 'carousel',
      caption: (brand) => `Teja Toledo y Metaldeck: Combinación perfecta de estética arquitectónica y máxima resistencia climática. Descubre la ficha técnica con ${brand}.`,
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
      likes: 1250,
      comments: 64,
      shares: 115,
      saves: 182,
      reach: 22600,
      impressions: 28400,
      engagementRate: 7.12
    },
    {
      postType: 'image',
      caption: (brand) => `Orgullo por la ingeniería colombiana. Más de cuatro décadas construyendo el futuro del país con ${brand}. 🔩🇨🇴`,
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
      likes: 740,
      comments: 29,
      shares: 55,
      saves: 98,
      reach: 14200,
      impressions: 17500,
      engagementRate: 6.49
    }
  ]
};

function getCategoryForBrand(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('chapman')) return 'legal';
  if (n.includes('realty') || n.includes('og')) return 'realestate';
  if (n.includes('davila') || n.includes('dávila') || n.includes('agencia')) return 'agency';
  if (n.includes('serena') || n.includes('hospital') || n.includes('salud')) return 'health';
  if (n.includes('zona') || n.includes('zfbaq') || n.includes('logistica') || n.includes('franca')) return 'logistics';
  if (n.includes('verano') || n.includes('cepeda') || n.includes('gobernador') || n.includes('politica')) return 'public_sector';
  if (n.includes('acesco') || n.includes('acero') || n.includes('metal')) return 'construction';
  return 'agency';
}

export function getMockPostsForBrand(clientName: string, platform: string = 'INSTAGRAM'): UnifiedSocialPost[] {
  const category = getCategoryForBrand(clientName);
  const templates = INDUSTRY_TEMPLATES[category] || INDUSTRY_TEMPLATES.agency;

  return templates.map((tmpl, idx) => ({
    id: `post-top-${idx + 1}-${platform.toLowerCase()}`,
    platform: platform as any,
    publishedAt: new Date(Date.now() - (idx * 5 + 3) * 86400000).toISOString(),
    caption: tmpl.caption(clientName),
    mediaUrl: tmpl.image,
    thumbnailUrl: tmpl.image,
    postType: tmpl.postType,
    likes: tmpl.likes,
    comments: tmpl.comments,
    shares: tmpl.shares,
    saves: tmpl.saves,
    reach: tmpl.reach,
    impressions: tmpl.impressions,
    engagementRate: tmpl.engagementRate,
    permalink: 'https://instagram.com'
  }));
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
