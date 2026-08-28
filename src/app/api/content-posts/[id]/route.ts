import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const post = await prisma.contentPost.findUnique({
      where: { id },
      include: {
        client: true,
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    if (session.role === 'CLIENT' && session.clientId !== post.clientId) {
      return NextResponse.json({ error: 'Acceso no permitido' }, { status: 403 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error fetching content post:', error);
    return NextResponse.json({ error: 'Error al obtener publicación' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (session.role === 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado para editar detalles de la publicación' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      copy,
      scheduledDate,
      platforms,
      contentType,
      mediaUrls,
      status,
      tags,
      clientFeedback
    } = body;

    const platformsStr = Array.isArray(platforms) ? platforms.join(',') : platforms;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (copy !== undefined) updateData.copy = copy;
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate);
    if (platformsStr !== undefined) updateData.platforms = platformsStr;
    if (contentType !== undefined) updateData.contentType = contentType;
    if (mediaUrls !== undefined) updateData.mediaUrls = typeof mediaUrls === 'string' ? mediaUrls : JSON.stringify(mediaUrls);
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (clientFeedback !== undefined) updateData.clientFeedback = clientFeedback;

    const updated = await prisma.contentPost.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    try {
      if (session.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            userName: session.name,
            userEmail: session.email,
            action: 'UPDATE',
            resourceType: 'CONTENT_POST',
            resourceId: updated.id,
            details: `Actualizó publicación "${updated.title}" para ${updated.client.name}`
          }
        });
      }
    } catch (e) {}

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error('Error updating content post:', error);
    return NextResponse.json({ error: 'Error al actualizar publicación' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const post = await prisma.contentPost.findUnique({ where: { id }, include: { client: true } });

    if (!post) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    await prisma.contentPost.delete({ where: { id } });

    try {
      if (session.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            userName: session.name,
            userEmail: session.email,
            action: 'DELETE',
            resourceType: 'CONTENT_POST',
            resourceId: id,
            details: `Eliminó publicación "${post.title}" de ${post.client.name}`
          }
        });
      }
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Publicación eliminada' });
  } catch (error: any) {
    console.error('Error deleting content post:', error);
    return NextResponse.json({ error: 'Error al eliminar publicación' }, { status: 500 });
  }
}
