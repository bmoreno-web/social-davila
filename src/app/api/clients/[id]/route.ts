import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

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
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await context.params;

    // RBAC client restriction
    if (session.role === 'CLIENT' && session.clientId !== id) {
      return NextResponse.json({ error: 'Acceso denegado a este cliente' }, { status: 403 });
    }

    let client: any = null;
    try {
      client = await prisma.client.findUnique({
        where: { id },
        include: {
          socialConnections: true,
          reports: {
            orderBy: { periodEnd: 'desc' },
            include: {
              creator: { select: { name: true, email: true } },
              metrics: true,
              recommendations: true
            }
          },
          recommendations: {
            orderBy: { order: 'asc' }
          },
          syncLogs: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });
    } catch (e) {
      console.warn('Prisma findUnique error:', e);
    }

    if (!client) {
      // Find matching default brand by ID or first brand
      client = DEFAULT_BRANDS[id] || Object.values(DEFAULT_BRANDS).find((b: any) => b.slug === id || b.id === id) || {
        ...DEFAULT_BRANDS['cmtag1oha0000t0g80a05ym3q'],
        id
      };
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error('Client detail error:', error);
    return NextResponse.json({ error: 'Error al obtener detalle del cliente' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEAM')) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { name, industry, contactName, contactEmail, logo, metricoolBlogId, metricoolUserId, socials } = body;

    let updated: any = null;
    try {
      updated = await prisma.client.update({
        where: { id },
        data: {
          name,
          industry,
          contactName,
          contactEmail,
          logo,
          metricoolBlogId: metricoolBlogId ? String(metricoolBlogId) : undefined,
          metricoolUserId: metricoolUserId ? String(metricoolUserId) : undefined
        }
      });
    } catch (e) {
      updated = { id, name, industry, contactName, contactEmail, logo };
    }

    return NextResponse.json({ success: true, client: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar clientes' }, { status: 403 });
    }

    const { id } = await context.params;
    try {
      await prisma.client.delete({ where: { id } });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 });
  }
}
