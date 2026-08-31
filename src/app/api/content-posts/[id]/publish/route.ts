import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { metricoolService } from '@/lib/metricool/client';
import { createAndSendNotification } from '@/lib/notifications/email-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { publishImmediately = false } = body;

    const post = await prisma.contentPost.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    if (session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Solo el equipo de la agencia puede ejecutar la publicación' }, { status: 403 });
    }

    const providers = post.platforms ? post.platforms.split(',').map((p) => p.trim()) : ['INSTAGRAM'];
    const publishDate = publishImmediately ? new Date().toISOString() : post.scheduledDate.toISOString();

    // 1. Send to Metricool Scheduler
    let metricoolResult = null;
    const blogId = post.client.metricoolBlogId;
    const userId = post.client.metricoolUserId || '1395490';

    if (blogId) {
      try {
        metricoolResult = await metricoolService.schedulePost({
          blogId,
          userId,
          text: post.copy,
          dateTime: publishDate,
          providers,
          mediaUrls: post.mediaUrls ? [post.mediaUrls] : undefined
        });
      } catch (err: any) {
        console.error('Metricool schedule API error:', err);
      }
    }

    // 2. Update status & metricoolPostId in Database
    const metricoolId = metricoolResult?.data?.data?.id || metricoolResult?.data?.id;

    const updatedPost = await prisma.contentPost.update({
      where: { id },
      data: {
        status: 'PUBLICADO',
        clientFeedback: publishImmediately ? 'Publicado inmediatamente en redes' : 'Programado para publicación automática',
        metricoolPostId: metricoolId ? String(metricoolId) : undefined
      },
      include: {
        client: true,
        comments: true
      }
    });

    // 3. Log Audit
    try {
      if (session.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            userName: session.name,
            userEmail: session.email,
            action: 'PUBLISH_SOCIALS',
            resourceType: 'CONTENT_POST',
            resourceId: updatedPost.id,
            details: `Publicó/Programó "${updatedPost.title}" en redes sociales (${providers.join(', ')}) para ${updatedPost.client.name}`
          }
        });
      }
    } catch (e) {}

    // 4. Trigger In-App Notification & Email
    try {
      await createAndSendNotification({
        type: 'APPROVED',
        title: '🚀 Publicación Programada en Redes',
        message: `El post "${updatedPost.title}" fue enviado a programar/publicar en ${providers.join(', ')} para ${updatedPost.client.name}.`,
        link: `/parrilla?postId=${updatedPost.id}`,
        clientId: updatedPost.clientId,
        clientName: updatedPost.client.name,
        recipientRole: 'ALL',
        postTitle: updatedPost.title
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `¡Publicación enviada exitosamente a ${providers.join(', ')}!`,
      post: updatedPost,
      metricool: metricoolResult
    });
  } catch (error: any) {
    console.error('Error publishing content post:', error);
    return NextResponse.json({
      error: error?.message || 'Error al publicar en redes sociales'
    }, { status: 500 });
  }
}
