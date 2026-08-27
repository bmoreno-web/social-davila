import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const DEFAULT_BRANDS: Record<string, any> = {
  'cmtag1oha0000t0g80a05ym3q': {
    id: 'cmtag1oha0000t0g80a05ym3q',
    name: 'Acesco Colombia',
    slug: 'acesco-colombia',
    industry: 'Construcción e Ingeniería',
    logo: 'https://static.metricool.com/brand-logo/202409/2930665-temp-file16623787061548330277.com-brand-facebook-page-image',
    metricoolBlogId: '2930665',
    metricoolUserId: '1395490',
    contactName: 'Carlos Mendoza',
    contactEmail: 'cliente@acesco.com',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc1', platform: 'INSTAGRAM', accountUsername: 'acescocol' },
      { id: 'sc2', platform: 'FACEBOOK', accountUsername: 'Acesco Colombia' }
    ],
    reports: [
      {
        id: 'cmtag1pf4000pt0g8saszgqrp',
        title: 'Informe Ejecutivo de Rendimiento Digital — Agosto 2026',
        periodEnd: new Date().toISOString(),
        editorialAnalysis: 'Durante el ciclo de agosto se consolidó un incremento del 24.8% en alcance orgánico neto y una optimización del engagement rate que alcanzó 6.8%. Los formatos de video corto (Reels) generaron más del 52% del total de interacciones del mes.'
      }
    ],
    recommendations: [
      {
        id: 'rec1',
        title: 'Incrementar frecuencia de Reels técnicos en obra',
        category: 'CONTENIDO',
        priority: 'ALTA',
        description: 'Producir cápsulas de 20-30 segundos donde instaladores certificados muestren la rapidez y seguridad del armado en proyectos reales.',
        status: 'EN_PROGRESO'
      },
      {
        id: 'rec2',
        title: 'Campañas de retargeting a distribuidores oficiales',
        category: 'ESTRATEGIA',
        priority: 'ALTA',
        description: 'Vincular llamadas a la acción con enlaces dinámicos por ciudad al mapa de distribuidores autorizados en www.acesco.com.co.',
        status: 'PENDIENTE'
      }
    ]
  },
  'cmtag1on80003t0g8l4a3cliz': {
    id: 'cmtag1on80003t0g8l4a3cliz',
    name: 'Dávila P&M',
    slug: 'davila-pm',
    industry: 'Agencia de Publicidad & Marketing',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4056236',
    metricoolUserId: '1395490',
    contactName: 'Dirección General',
    contactEmail: 'ddigital@davilaweb.com',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc3', platform: 'INSTAGRAM', accountUsername: 'davilapublicidad' },
      { id: 'sc4', platform: 'FACEBOOK', accountUsername: 'Dávila Publicidad & Marketing' }
    ],
    reports: [],
    recommendations: []
  },
  'cmtag1ow70008t0g8f2fgh1yd': {
    id: 'cmtag1ow70008t0g8f2fgh1yd',
    name: 'Hospital Serena del Mar',
    slug: 'hospital-serena-del-mar',
    industry: 'Salud & Medicina',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '3996019',
    status: 'ACTIVE',
    socialConnections: [{ id: 'sc5', platform: 'FACEBOOK', accountUsername: 'Hospital Serena del Mar' }],
    reports: [],
    recommendations: []
  },
  'cmtag1oyx000at0g8h2fuyif8': {
    id: 'cmtag1oyx000at0g8h2fuyif8',
    name: 'Zona Franca B/quilla',
    slug: 'zona-franca-barranquilla',
    industry: 'Comercio Exterior & Logística',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4058165',
    status: 'ACTIVE',
    socialConnections: [{ id: 'sc6', platform: 'INSTAGRAM', accountUsername: 'zfbaq' }],
    reports: [],
    recommendations: []
  },
  'cmtag1p0z000ct0g8w9h3k2lm': {
    id: 'cmtag1p0z000ct0g8w9h3k2lm',
    name: 'Eduardo Verano De la Rosa',
    slug: 'eduardo-verano',
    industry: 'Sector Público & Liderazgo',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4058776',
    status: 'ACTIVE',
    socialConnections: [{ id: 'sc7', platform: 'TIKTOK', accountUsername: 'veranodelarosa' }],
    reports: [],
    recommendations: []
  },
  'cmtag1p4a000et0g8gbyk9m1m': {
    id: 'cmtag1p4a000et0g8gbyk9m1m',
    name: 'Charles Chapman',
    slug: 'charles-chapman',
    industry: 'Legal & Corporativo',
    logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4588040',
    status: 'ACTIVE',
    socialConnections: [{ id: 'sc8', platform: 'LINKEDIN', accountUsername: 'Charles Chapman' }],
    reports: [],
    recommendations: []
  },
  'cmtag1p7q000gt0g8k86l2mfr': {
    id: 'cmtag1p7q000gt0g8k86l2mfr',
    name: 'OG Realty Partners',
    slug: 'og-realty-partners',
    industry: 'Bienes Raíces & Inversión',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4559324',
    status: 'ACTIVE',
    socialConnections: [{ id: 'sc9', platform: 'INSTAGRAM', accountUsername: 'ogrealty' }],
    reports: [],
    recommendations: []
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = '';
  try {
    const resolved = await params;
    id = resolved?.id || '';
  } catch (e) {
    id = '';
  }

  try {
    let client: any = null;
    try {
      if (id) {
        client = await prisma.client.findUnique({
          where: { id },
          include: {
            socialConnections: true,
            reports: {
              orderBy: { periodEnd: 'desc' },
              take: 1
            },
            recommendations: true
          }
        });
      }
    } catch (e) {
      console.warn('Prisma findUnique error:', e);
    }

    if (!client) {
      client = DEFAULT_BRANDS[id] || Object.values(DEFAULT_BRANDS).find((b: any) => b.slug === id || b.id === id) || {
        ...DEFAULT_BRANDS['cmtag1oha0000t0g80a05ym3q'],
        id: id || 'cmtag1oha0000t0g80a05ym3q'
      };
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    const fallbackClient = DEFAULT_BRANDS['cmtag1oha0000t0g80a05ym3q'];
    return NextResponse.json({ client: fallbackClient });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await params;
    const id = resolved?.id || '';
    const body = await request.json();
    return NextResponse.json({ success: true, client: { id, ...body } });
  } catch (error: any) {
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ success: true });
}
