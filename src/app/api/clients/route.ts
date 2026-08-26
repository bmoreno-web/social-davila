import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { metricoolService } from '@/lib/metricool/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const autoSync = searchParams.get('autoSync') === 'true';

    // If client role, restrict exclusively to their client
    if (session.role === 'CLIENT') {
      if (!session.clientId) {
        return NextResponse.json({ error: 'No hay cliente asignado a este usuario' }, { status: 403 });
      }
      const client = await prisma.client.findUnique({
        where: { id: session.clientId },
        include: {
          socialConnections: true,
          reports: {
            where: { status: 'PUBLISHED' },
            orderBy: { periodEnd: 'desc' },
            take: 5
          }
        }
      });
      return NextResponse.json({ clients: client ? [client] : [] });
    }

    // Auto-sync brands from Metricool if requested or if DB is fresh
    if (autoSync && (session.role === 'ADMIN' || session.role === 'TEAM')) {
      try {
        const metricoolProfiles = await metricoolService.getProfiles();
        for (const profile of metricoolProfiles) {
          const existing = await prisma.client.findFirst({
            where: { metricoolBlogId: String(profile.id) }
          });

          if (!existing) {
            const slug = profile.label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') || `brand-${profile.id}`;

            const newClient = await prisma.client.create({
              data: {
                name: profile.label || `Marca ${profile.id}`,
                slug: `${slug}-${Date.now().toString().slice(-4)}`,
                metricoolBlogId: String(profile.id),
                metricoolUserId: String(profile.userId || profile.ownerUserId),
                logo: profile.picture,
                lastSyncAt: new Date()
              }
            });

            // Add social connections
            if (profile.instagram) {
              await prisma.socialConnection.create({
                data: {
                  clientId: newClient.id,
                  platform: 'INSTAGRAM',
                  accountUsername: profile.instagram,
                  externalId: profile.instagram
                }
              });
            }
            if (profile.facebook || profile.facebookPageId) {
              await prisma.socialConnection.create({
                data: {
                  clientId: newClient.id,
                  platform: 'FACEBOOK',
                  accountUsername: profile.label,
                  externalId: profile.facebookPageId || profile.facebook || ''
                }
              });
            }
            if (profile.linkedinCompany) {
              await prisma.socialConnection.create({
                data: {
                  clientId: newClient.id,
                  platform: 'LINKEDIN',
                  accountUsername: profile.linkedinCompany,
                  externalId: profile.linkedinCompany
                }
              });
            }
            if (profile.tiktok) {
              await prisma.socialConnection.create({
                data: {
                  clientId: newClient.id,
                  platform: 'TIKTOK',
                  accountUsername: profile.tiktok,
                  externalId: profile.tiktok
                }
              });
            }
          }
        }
      } catch (err) {
        console.warn('Metricool auto-import warning:', err);
      }
    }

    const clients = await prisma.client.findMany({
      where: { active: true },
      include: {
        socialConnections: true,
        reports: {
          orderBy: { periodEnd: 'desc' },
          take: 1,
          select: {
            id: true,
            title: true,
            status: true,
            periodEnd: true,
            publishedAt: true
          }
        },
        _count: {
          select: {
            reports: true,
            posts: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ clients });
  } catch (error: any) {
    console.error('Clients fetch error:', error);
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const body = await req.json();
    const { name, industry, contactName, contactEmail, logo, metricoolBlogId, metricoolUserId, socials } = body;

    if (!name) {
      return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 });
    }

    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const client = await prisma.client.create({
      data: {
        name,
        slug,
        industry: industry || 'Digital Marketing',
        contactName,
        contactEmail,
        logo,
        metricoolBlogId: metricoolBlogId ? String(metricoolBlogId) : null,
        metricoolUserId: metricoolUserId ? String(metricoolUserId) : null,
        socialConnections: {
          create: Array.isArray(socials)
            ? socials.map((s: any) => ({
                platform: s.platform,
                accountUsername: s.accountUsername,
                externalId: s.externalId || s.accountUsername
              }))
            : []
        }
      },
      include: {
        socialConnections: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        action: 'CREATE',
        resourceType: 'CLIENT',
        resourceId: client.id,
        details: `Creación de cliente: ${client.name}`
      }
    });

    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Error al registrar cliente' }, { status: 500 });
  }
}
