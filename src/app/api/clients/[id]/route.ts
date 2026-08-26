import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

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

    const client = await prisma.client.findUnique({
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

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
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

    const updated = await prisma.client.update({
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

    // Update socials if provided
    if (Array.isArray(socials)) {
      await prisma.socialConnection.deleteMany({ where: { clientId: id } });
      for (const s of socials) {
        await prisma.socialConnection.create({
          data: {
            clientId: id,
            platform: s.platform,
            accountUsername: s.accountUsername,
            externalId: s.externalId || s.accountUsername
          }
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        action: 'UPDATE',
        resourceType: 'CLIENT',
        resourceId: id,
        details: `Actualización de datos del cliente ${updated.name}`
      }
    });

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
    const client = await prisma.client.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        action: 'DELETE',
        resourceType: 'CLIENT',
        resourceId: id,
        details: `Eliminación de cliente ${client.name}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 });
  }
}
