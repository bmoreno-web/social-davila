import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const month = searchParams.get('month'); // 1-12 or '2026-08'
    const year = searchParams.get('year');

    const whereClause: any = {};

    if (session.role === 'CLIENT') {
      if (!session.clientId) return NextResponse.json({ error: 'Sin cliente asignado' }, { status: 403 });
      whereClause.clientId = session.clientId;
    } else {
      if (clientId && clientId !== 'ALL') {
        const found = await prisma.client.findFirst({
          where: {
            OR: [
              { id: clientId },
              { slug: clientId }
            ]
          },
          select: { id: true }
        });
        whereClause.clientId = found ? found.id : clientId;
      }
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59));
      whereClause.scheduledDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const posts = await prisma.contentPost.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true, logo: true, slug: true }
        },
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    console.error('Error fetching content posts:', error);
    return NextResponse.json({ error: 'Error al obtener la parrilla de contenidos', posts: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // Client role cannot create planned posts in agency view
    if (session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Solo el equipo de la agencia puede programar publicaciones' }, { status: 403 });
    }

    const body = await req.json();
    const {
      clientId,
      title,
      copy,
      scheduledDate,
      platforms,
      contentType = 'IMAGE',
      mediaUrls = '',
      status = 'BORRADOR',
      tags = ''
    } = body;

    if (!clientId || !title || !scheduledDate) {
      return NextResponse.json({ error: 'Cliente, título y fecha programada son obligatorios' }, { status: 400 });
    }

    // Platforms can be an array or string
    const platformsStr = Array.isArray(platforms) ? platforms.join(',') : (platforms || 'INSTAGRAM');
    const parsedDate = new Date(scheduledDate);

    const post = await prisma.contentPost.create({
      data: {
        clientId,
        title,
        copy: copy || '',
        scheduledDate: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        platforms: platformsStr,
        contentType,
        mediaUrls: typeof mediaUrls === 'string' ? mediaUrls : JSON.stringify(mediaUrls),
        status,
        tags,
        createdById: session.userId || null
      },
      include: {
        client: true,
        comments: true
      }
    });

    // Log audit action
    try {
      if (session.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            userName: session.name,
            userEmail: session.email,
            action: 'CREATE',
            resourceType: 'CONTENT_POST',
            resourceId: post.id,
            details: `Creó publicación "${post.title}" (${post.status}) para ${post.client.name}`
          }
        });
      }
    } catch (e) {
      console.warn('Audit log error on content post create:', e);
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating content post:', error);
    return NextResponse.json({ error: 'Error al crear la publicación', details: String(error) }, { status: 500 });
  }
}
