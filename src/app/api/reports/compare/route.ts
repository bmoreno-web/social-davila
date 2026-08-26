import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const reportAId = searchParams.get('reportA');
    const reportBId = searchParams.get('reportB');

    if (!reportAId || !reportBId) {
      return NextResponse.json({ error: 'Debes seleccionar dos reportes para comparar' }, { status: 400 });
    }

    const [reportA, reportB] = await Promise.all([
      prisma.report.findUnique({
        where: { id: reportAId },
        include: {
          client: true,
          metrics: true,
          recommendations: true
        }
      }),
      prisma.report.findUnique({
        where: { id: reportBId },
        include: {
          client: true,
          metrics: true,
          recommendations: true
        }
      })
    ]);

    if (!reportA || !reportB) {
      return NextResponse.json({ error: 'Uno o ambos reportes no existen' }, { status: 404 });
    }

    if (session.role === 'CLIENT' && (session.clientId !== reportA.clientId || session.clientId !== reportB.clientId)) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Build metric comparisons
    const metricKeys = ['followers', 'reach', 'impressions', 'interactions', 'engagement', 'posts_count'];
    const comparisonMetrics = metricKeys.map((key) => {
      const mA = reportA.metrics.find((m) => m.metricKey === key)?.currentValue || 0;
      const mB = reportB.metrics.find((m) => m.metricKey === key)?.currentValue || 0;
      const diff = mA - mB;
      const percentageChange = mB > 0 ? Number(((diff / mB) * 100).toFixed(1)) : 0;

      return {
        key,
        valueA: mA,
        valueB: mB,
        diff,
        percentageChange,
        isPositive: diff >= 0
      };
    });

    return NextResponse.json({
      reportA,
      reportB,
      comparisonMetrics,
      client: reportA.client
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al comparar reportes' }, { status: 500 });
  }
}
