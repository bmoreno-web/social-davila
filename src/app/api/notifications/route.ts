import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const whereClause: any = {};

    if (session.role === 'CLIENT') {
      if (!session.clientId) return NextResponse.json({ notifications: [], unreadCount: 0 });
      whereClause.OR = [
        { clientId: session.clientId, recipientRole: 'CLIENT' },
        { clientId: session.clientId, recipientRole: 'ALL' }
      ];
    } else {
      // Agency / Admin
      whereClause.OR = [
        { recipientRole: 'AGENCY' },
        { recipientRole: 'ALL' }
      ];
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true, logo: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        read: false
      }
    });

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error al obtener notificaciones', notifications: [], unreadCount: 0 }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await req.json();
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      const whereClause: any = {};
      if (session.role === 'CLIENT') {
        whereClause.clientId = session.clientId;
        whereClause.recipientRole = { in: ['CLIENT', 'ALL'] };
      } else {
        whereClause.recipientRole = { in: ['AGENCY', 'ALL'] };
      }

      await prisma.notification.updateMany({
        where: whereClause,
        data: { read: true }
      });

      return NextResponse.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
      return NextResponse.json({ success: true, message: 'Notificación marcada como leída' });
    }

    return NextResponse.json({ error: 'Parámetro inválido' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Error al actualizar notificación' }, { status: 500 });
  }
}
