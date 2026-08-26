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

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        client: {
          include: { socialConnections: true }
        },
        creator: { select: { id: true, name: true, email: true } },
        metrics: true,
        recommendations: { orderBy: { order: 'asc' } },
        posts: { orderBy: { engagementRate: 'desc' } }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }

    if (session.role === 'CLIENT') {
      if (session.clientId !== report.clientId || report.status !== 'PUBLISHED') {
        return NextResponse.json({ error: 'Acceso denegado a este reporte' }, { status: 403 });
      }
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al consultar reporte' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Permisos insuficientes para editar reportes' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { title, status, executiveSummary, editorialAnalysis } = body;

    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });

    const updated = await prisma.report.update({
      where: { id },
      data: {
        title: title || undefined,
        status: status || undefined,
        executiveSummary: executiveSummary !== undefined ? executiveSummary : undefined,
        editorialAnalysis: editorialAnalysis !== undefined ? editorialAnalysis : undefined,
        publishedAt: status === 'PUBLISHED' && existing.status !== 'PUBLISHED' ? new Date() : undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        action: status === 'PUBLISHED' ? 'PUBLISH' : 'UPDATE',
        resourceType: 'REPORT',
        resourceId: id,
        details: `Actualización de informe "${updated.title}" — Estado: ${updated.status}`
      }
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar reporte' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar reportes' }, { status: 403 });
    }

    const { id } = await context.params;
    await prisma.report.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        action: 'DELETE',
        resourceType: 'REPORT',
        resourceId: id,
        details: `Eliminación definitiva de reporte ID: ${id}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar reporte' }, { status: 500 });
  }
}
