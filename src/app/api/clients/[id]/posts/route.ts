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

    if (session.role === 'CLIENT' && session.clientId !== id) {
      return NextResponse.json({ error: 'Acceso denegado a este cliente' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform'); // ALL, INSTAGRAM, FACEBOOK, etc.
    const sortBy = searchParams.get('sortBy') || 'engagement'; // reach, engagement, likes, comments, shares, date
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const whereClause: any = { clientId: id };
    if (platform && platform !== 'ALL') {
      whereClause.platform = platform.toUpperCase();
    }

    let orderByClause: any = { engagementRate: 'desc' };
    if (sortBy === 'reach') orderByClause = { reach: 'desc' };
    if (sortBy === 'likes') orderByClause = { likes: 'desc' };
    if (sortBy === 'comments') orderByClause = { comments: 'desc' };
    if (sortBy === 'shares') orderByClause = { shares: 'desc' };
    if (sortBy === 'date') orderByClause = { publishedAt: 'desc' };

    const posts = await prisma.reportPost.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: limit
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Posts fetch error:', error);
    return NextResponse.json({ error: 'Error al obtener publicaciones' }, { status: 500 });
  }
}
