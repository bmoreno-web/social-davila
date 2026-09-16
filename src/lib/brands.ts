export interface BrandConfig {
  id: string;
  name: string;
  slug: string;
  industry: string;
  logo: string;
  metricoolBlogId: string;
  metricoolUserId: string;
  contactName: string;
  contactEmail: string;
  networks: ('instagram' | 'facebook' | 'tiktok' | 'linkedin')[];
  socialConnections: {
    id: string;
    platform: 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'LINKEDIN';
    accountUsername: string;
    followers: number;
    reach: number;
    engagementRate: number;
  }[];
  kpis: {
    followers: number;
    reach: number;
    impressions: number;
    engagement: number;
  };
}

export const KNOWN_BRANDS: BrandConfig[] = [
  {
    id: 'cmtag1oha0000t0g80a05ym3q',
    name: 'Acesco Colombia',
    slug: 'acesco-colombia',
    industry: 'Construcción e Ingeniería en Acero',
    logo: 'https://static.metricool.com/brand-logo/202409/2930665-temp-file16623787061548330277.com-brand-facebook-page-image',
    metricoolBlogId: '2930665',
    metricoolUserId: '1395490',
    contactName: 'Carlos Mendoza — Dirección de Mercadeo',
    contactEmail: 'mercadeo@acesco.com',
    networks: ['instagram', 'facebook'],
    socialConnections: [
      { id: 'sc1', platform: 'INSTAGRAM', accountUsername: 'acescocol', followers: 29903, reach: 48500, engagementRate: 7.2 },
      { id: 'sc2', platform: 'FACEBOOK', accountUsername: 'Acesco Colombia', followers: 14200, reach: 22400, engagementRate: 4.8 }
    ],
    kpis: {
      followers: 29903,
      reach: 68400,
      impressions: 94200,
      engagement: 7.2
    }
  },
  {
    id: 'cmtag1on80003t0g8l4a3cliz',
    name: 'Dávila P&M',
    slug: 'davila-pm',
    industry: 'Agencia de Publicidad, Medios & Estrategia Digital',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4056236',
    metricoolUserId: '1395490',
    contactName: 'Dirección General Davila PM',
    contactEmail: 'ddigital@davilaweb.com',
    networks: ['instagram', 'facebook', 'linkedin'],
    socialConnections: [
      { id: 'sc3', platform: 'INSTAGRAM', accountUsername: 'davilapublicidad', followers: 4690, reach: 18900, engagementRate: 6.4 },
      { id: 'sc4', platform: 'LINKEDIN', accountUsername: 'Dávila Publicidad & Marketing', followers: 2850, reach: 9800, engagementRate: 5.2 }
    ],
    kpis: {
      followers: 4690,
      reach: 28700,
      impressions: 42100,
      engagement: 6.4
    }
  },
  {
    id: 'cmtag1ow70008t0g8f2fgh1yd',
    name: 'Hospital Serena del Mar',
    slug: 'hospital-serena-del-mar',
    industry: 'Salud, Medicina de Alta Complejidad & Bienestar',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '3996019',
    metricoolUserId: '1395490',
    contactName: 'Comunicaciones & Experiencia del Paciente',
    contactEmail: 'comunicaciones@serenadelmar.com.co',
    networks: ['facebook', 'instagram'],
    socialConnections: [
      { id: 'sc5', platform: 'FACEBOOK', accountUsername: 'Hospital Serena del Mar', followers: 16800, reach: 34200, engagementRate: 5.8 }
    ],
    kpis: {
      followers: 16800,
      reach: 34200,
      impressions: 49800,
      engagement: 5.8
    }
  },
  {
    id: 'cmtag1oyx000at0g8h2fuyif8',
    name: 'Zona Franca B/quilla',
    slug: 'zona-franca-barranquilla',
    industry: 'Comercio Exterior, Logística & Parques Industriales',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4058165',
    metricoolUserId: '1395490',
    contactName: 'Gerencia de Desarrollo de Negocios',
    contactEmail: 'comercial@zonafrancabaq.com.co',
    networks: ['instagram', 'facebook', 'linkedin'],
    socialConnections: [
      { id: 'sc6', platform: 'INSTAGRAM', accountUsername: 'zfbaq', followers: 2604, reach: 14200, engagementRate: 6.1 },
      { id: 'sc7', platform: 'FACEBOOK', accountUsername: 'Zona Franca de Barranquilla', followers: 5800, reach: 11900, engagementRate: 4.2 },
      { id: 'sc8', platform: 'LINKEDIN', accountUsername: 'Zona Franca de Barranquilla', followers: 7400, reach: 18600, engagementRate: 5.6 }
    ],
    kpis: {
      followers: 15804,
      reach: 44700,
      impressions: 62400,
      engagement: 5.9
    }
  },
  {
    id: 'cmtag1p0z000ct0g8w9h3k2lm',
    name: 'Eduardo Verano De la Rosa',
    slug: 'eduardo-verano',
    industry: 'Sector Público, Gestión Departamental & Liderazgo',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4058776',
    metricoolUserId: '1395490',
    contactName: 'Equipo de Prensa & Redes',
    contactEmail: 'prensa@veranodelarosa.com',
    networks: ['tiktok', 'instagram', 'facebook'],
    socialConnections: [
      { id: 'sc9', platform: 'TIKTOK', accountUsername: 'veranodelarosa', followers: 48900, reach: 98400, engagementRate: 8.4 }
    ],
    kpis: {
      followers: 48900,
      reach: 98400,
      impressions: 145200,
      engagement: 8.4
    }
  },
  {
    id: 'cmtag1p4a000et0g8gbyk9m1m',
    name: 'Charles Chapman',
    slug: 'charles-chapman',
    industry: 'Derecho Laboral, Consultoría Corporativa & Negociación',
    logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4588040',
    metricoolUserId: '1395490',
    contactName: 'Charles Chapman López',
    contactEmail: 'contacto@chapman.com.co',
    networks: ['linkedin', 'instagram'],
    socialConnections: [
      { id: 'sc10', platform: 'LINKEDIN', accountUsername: 'Charles Chapman López', followers: 18400, reach: 24500, engagementRate: 6.8 }
    ],
    kpis: {
      followers: 18400,
      reach: 24500,
      impressions: 36800,
      engagement: 6.8
    }
  },
  {
    id: 'cmtag1p7q000gt0g8k86l2mfr',
    name: 'OG Realty Partners',
    slug: 'og-realty-partners',
    industry: 'Inversión Inmobiliaria, Luxury Real Estate & Proptech',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4559324',
    metricoolUserId: '1395490',
    contactName: 'Dirección Comercial & Alianzas',
    contactEmail: 'info@ogrealty.com',
    networks: ['instagram', 'facebook'],
    socialConnections: [
      { id: 'sc11', platform: 'INSTAGRAM', accountUsername: 'ogrealtypartners', followers: 1450, reach: 8900, engagementRate: 5.9 }
    ],
    kpis: {
      followers: 1450,
      reach: 8900,
      impressions: 13400,
      engagement: 5.9
    }
  },
  {
    id: 'cmtag1p9x000it0g8v86l2mfr',
    name: 'Efrain Cepeda',
    slug: 'efrain-cepeda',
    industry: 'Sector Público & Liderazgo Legislativo',
    logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4506693',
    metricoolUserId: '1395490',
    contactName: 'Equipo de Prensa',
    contactEmail: 'prensa@efraincepeda.com',
    networks: ['instagram', 'facebook', 'tiktok'],
    socialConnections: [
      { id: 'sc12', platform: 'INSTAGRAM', accountUsername: 'efraincepedas', followers: 12400, reach: 24100, engagementRate: 6.2 }
    ],
    kpis: {
      followers: 12400,
      reach: 24100,
      impressions: 38200,
      engagement: 6.2
    }
  }
];

export function findBrandByQuery(query: string): BrandConfig {
  if (!query) return KNOWN_BRANDS[0];

  const q = query.trim().toLowerCase();

  // 1. Direct ID match
  const byId = KNOWN_BRANDS.find(b => b.id.toLowerCase() === q);
  if (byId) return byId;

  // 2. Direct metricoolBlogId match
  const byBlogId = KNOWN_BRANDS.find(b => b.metricoolBlogId === q);
  if (byBlogId) return byBlogId;

  // 3. Slug exact or includes match
  const bySlug = KNOWN_BRANDS.find(b => b.slug.toLowerCase() === q || q.includes(b.slug.toLowerCase()) || b.slug.toLowerCase().includes(q));
  if (bySlug) return bySlug;

  // 4. Keyword fuzzy match
  if (q.includes('davila')) return KNOWN_BRANDS[1];
  if (q.includes('serena') || q.includes('hospital')) return KNOWN_BRANDS[2];
  if (q.includes('zona') || q.includes('zfbaq') || q.includes('franca')) return KNOWN_BRANDS[3];
  if (q.includes('verano') || q.includes('eduardo')) return KNOWN_BRANDS[4];
  if (q.includes('chapman') || q.includes('charles')) return KNOWN_BRANDS[5];
  if (q.includes('realty') || q.includes('og')) return KNOWN_BRANDS[6];
  if (q.includes('cepeda') || q.includes('efrain')) return KNOWN_BRANDS[7];
  if (q.includes('acesco')) return KNOWN_BRANDS[0];

  return KNOWN_BRANDS[0];
}
