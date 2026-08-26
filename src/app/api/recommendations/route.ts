import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, reportId, category, priority, title, description, status = 'PENDIENTE' } = body;

    if (!clientId || !title || !description) {
      return NextResponse.json({ error: 'Cliente, título y descripción son obligatorios' }, { status: 400 });
    }

    const rec = await prisma.recommendation.create({
      data: {
        clientId,
        reportId: reportId || null,
        category: category || 'CONTENIDO',
        priority: priority || 'ALTA',
        title,
        description,
        status
      }
    });

    return NextResponse.json({ success: true, recommendation: rec });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear recomendación' }, { status: 500 });
  }
}
