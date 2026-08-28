import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { createAndSendNotification } from '@/lib/notifications/email-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 });
    }

    const post = await prisma.contentPost.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    if (session.role === 'CLIENT' && session.clientId !== post.clientId) {
      return NextResponse.json({ error: 'Acceso no permitido' }, { status: 403 });
    }

    const comment = await prisma.contentComment.create({
      data: {
        contentPostId: id,
        authorName: session.name,
        authorRole: session.role === 'CLIENT' ? 'CLIENT' : 'AGENCY',
        text: text.trim()
      }
    });

    // Send notification
    try {
      const isClientAuthor = session.role === 'CLIENT';
      await createAndSendNotification({
        type: 'NEW_COMMENT',
        title: `💬 Nuevo mensaje de ${session.name}`,
        message: `${session.name} comentó en "${post.title}": "${text.trim().slice(0, 100)}${text.length > 100 ? '...' : ''}"`,
        link: isClientAuthor ? '/parrilla' : '/portal/parrilla',
        clientId: post.clientId,
        clientName: post.client.name,
        recipientRole: isClientAuthor ? 'AGENCY' : 'CLIENT',
        recipientEmail: !isClientAuthor ? (post.client.contactEmail || undefined) : undefined,
        recipientName: !isClientAuthor ? (post.client.contactName || post.client.name) : 'Equipo Davila PM',
        postTitle: post.title,
        feedbackText: text.trim()
      });
    } catch (e) {}

    return NextResponse.json({ success: true, comment });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Error al agregar comentario' }, { status: 500 });
  }
}
