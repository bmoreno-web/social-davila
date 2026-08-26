import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { category, priority, title, description, status } = body;

    const rec = await prisma.recommendation.update({
      where: { id },
      data: {
        category,
        priority,
        title,
        description,
        status
      }
    });

    return NextResponse.json({ success: true, recommendation: rec });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar recomendación' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await context.params;
    await prisma.recommendation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar recomendación' }, { status: 500 });
  }
}
