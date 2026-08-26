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

    const whereClause: any = {};

    if (session.role === 'CLIENT') {
      if (!session.clientId) return NextResponse.json({ error: 'Sin cliente asignado' }, { status: 403 });
      whereClause.clientId = session.clientId;
      whereClause.status = 'PUBLISHED';
    } else {
      if (clientId) whereClause.clientId = clientId;
      if (status) whereClause.status = status;
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true, logo: true, slug: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { metrics: true, recommendations: true, posts: true }
        }
      },
      orderBy: { periodEnd: 'desc' }
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Reports fetch error:', error);
    return NextResponse.json({ error: 'Error al listar reportes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Permisos insuficientes para crear reportes' }, { status: 403 });
    }

    const body = await req.json();
    const {
      clientId,
      title,
      periodStart,
      periodEnd,
      status = 'DRAFT',
      executiveSummary,
      editorialAnalysis,
      metrics = [],
      recommendations = []
    } = body;

    if (!clientId || !title || !periodStart || !periodEnd) {
      return NextResponse.json({ error: 'Faltan campos obligatorios para el reporte' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        clientId,
        title,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status,
        executiveSummary,
        editorialAnalysis,
        createdById: session.userId,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        metrics: {
          create: Array.isArray(metrics)
            ? metrics.map((m: any) => ({
                platform: m.platform || 'ALL',
                metricKey: m.metricKey,
                currentValue: Number(m.currentValue) || 0,
                previousValue: m.previousValue !== undefined ? Number(m.previousValue) : null,
                percentageChange: m.percentageChange !== undefined ? Number(m.percentageChange) : null
              }))
            : []
        },
        recommendations: {
          create: Array.isArray(recommendations)
            ? recommendations.map((r: any, idx: number) => ({
                clientId,
                category: r.category || 'CONTENIDO',
                priority: r.priority || 'ALTA',
                title: r.title,
                description: r.description,
                status: r.status || 'PENDIENTE',
                order: idx + 1
              }))
            : []
        }
      },
      include: {
        client: true,
        metrics: true,
        recommendations: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        action: 'CREATE',
        resourceType: 'REPORT',
        resourceId: report.id,
        details: `Creación de informe "${report.title}" para ${report.client.name}`
      }
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}
