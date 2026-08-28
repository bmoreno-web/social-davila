import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { createAndSendNotification } from '@/lib/notifications/email-service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, feedback } = body;

    const post = await prisma.contentPost.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Publicación no encontrada' }, { status: 404 });
    }

    // Role checks
    if (session.role === 'CLIENT' && session.clientId !== post.clientId) {
      return NextResponse.json({ error: 'Acceso no permitido' }, { status: 403 });
    }

    const updateData: any = {
      status
    };

    if (status === 'APROBADO') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = session.name;
    } else if (status === 'CAMBIOS_SOLICITADOS') {
      if (feedback) updateData.clientFeedback = feedback;
    }

    // Create comment if feedback is provided
    if (feedback) {
      await prisma.contentComment.create({
        data: {
          contentPostId: id,
          authorName: session.name,
          authorRole: session.role === 'CLIENT' ? 'CLIENT' : 'AGENCY',
          text: feedback
        }
      });
    }

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

    // 1. Log audit
    try {
      if (session.userId) {
        await prisma.auditLog.create({
          data: {
            userId: session.userId,
            userName: session.name,
            userEmail: session.email,
            action: status === 'APROBADO' ? 'APPROVE' : status === 'CAMBIOS_SOLICITADOS' ? 'REQUEST_CHANGES' : 'STATUS_CHANGE',
            resourceType: 'CONTENT_POST',
            resourceId: updated.id,
            details: `Cambió estado de publicación "${updated.title}" a ${status} (${updated.client.name})`
          }
        });
      }
    } catch (e) {}

    // 2. Trigger In-App & Email Notifications
    try {
      if (status === 'CAMBIOS_SOLICITADOS') {
        await createAndSendNotification({
          type: 'CHANGES_REQUESTED',
          title: '⚠️ Cambios solicitados en publicación',
          message: `El cliente ${updated.client.name} ha solicitado ajustes en el post "${updated.title}".`,
          link: '/parrilla',
          clientId: updated.clientId,
          clientName: updated.client.name,
          recipientRole: 'AGENCY',
          postTitle: updated.title,
          feedbackText: feedback || updated.clientFeedback || undefined
        });
      } else if (status === 'APROBADO') {
        await createAndSendNotification({
          type: 'APPROVED',
          title: '🎉 Publicación Aprobada por Cliente',
          message: `El cliente ${updated.client.name} ha aprobado el post "${updated.title}".`,
          link: '/parrilla',
          clientId: updated.clientId,
          clientName: updated.client.name,
          recipientRole: 'AGENCY',
          postTitle: updated.title
        });
      } else if (status === 'PENDIENTE_APROBACION') {
        await createAndSendNotification({
          type: 'REVIEW_REQUESTED',
          title: '📋 Nueva publicación lista para tu aprobación',
          message: `El equipo de Davila PM ha preparado una propuesta de contenido para tu revisión.`,
          link: '/portal/parrilla',
          clientId: updated.clientId,
          clientName: updated.client.name,
          recipientEmail: updated.client.contactEmail || undefined,
          recipientName: updated.client.contactName || updated.client.name,
          recipientRole: 'CLIENT',
          postTitle: updated.title
        });
      }
    } catch (notifErr) {
      console.error('Notification dispatch error:', notifErr);
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error('Error changing content post status:', error);
    return NextResponse.json({ error: 'Error al actualizar estado de publicación' }, { status: 500 });
  }
}
