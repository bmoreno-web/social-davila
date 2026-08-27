import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import { getMockPostsForBrand } from '@/lib/metricool/mock';

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
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const whereClause: any = { clientId: id };
    if (platform && platform !== 'ALL') {
      whereClause.platform = platform.toUpperCase();
    }

    if (fromParam && toParam) {
      whereClause.publishedAt = {
        gte: new Date(fromParam + 'T00:00:00'),
        lte: new Date(toParam + 'T23:59:59')
      };
    }

    let orderByClause: any = { engagementRate: 'desc' };
    if (sortBy === 'reach') orderByClause = { reach: 'desc' };
    if (sortBy === 'likes') orderByClause = { likes: 'desc' };
    if (sortBy === 'comments') orderByClause = { comments: 'desc' };
    if (sortBy === 'shares') orderByClause = { shares: 'desc' };
    if (sortBy === 'date') orderByClause = { publishedAt: 'desc' };

    let posts = await prisma.reportPost.findMany({
      where: whereClause,
      orderBy: orderByClause,
      take: limit
    });

    // If date filter was too strict and returned 0, fallback to client posts without date filter
    if (posts.length === 0 && (fromParam || toParam)) {
      const fallbackWhere: any = { clientId: id };
      if (platform && platform !== 'ALL') fallbackWhere.platform = platform.toUpperCase();
      posts = await prisma.reportPost.findMany({
        where: fallbackWhere,
        orderBy: orderByClause,
        take: limit
      });
    }

    // Auto-seed posts for this client if still empty
    if (posts.length === 0) {
      const client = await prisma.client.findUnique({
        where: { id },
        include: { socialConnections: true }
      });

      if (client) {
        const defaultPlatform = client.socialConnections[0]?.platform || 'INSTAGRAM';
        const samplePosts = getMockPostsForBrand(client.name, defaultPlatform);
        
        for (const p of samplePosts) {
          await prisma.reportPost.create({
            data: {
              clientId: id,
              platform: p.platform,
              externalPostId: p.id,
              publishedAt: new Date(p.publishedAt),
              mediaUrl: p.mediaUrl,
              thumbnailUrl: p.thumbnailUrl,
              caption: p.caption,
              postType: p.postType,
              likes: p.likes,
              comments: p.comments,
              shares: p.shares,
              saves: p.saves,
              reach: p.reach,
              impressions: p.impressions,
              engagementRate: p.engagementRate,
              permalink: p.permalink
            }
          });
        }

        posts = await prisma.reportPost.findMany({
          where: { clientId: id },
          orderBy: orderByClause,
          take: limit
        });
      }
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Posts fetch error:', error);
    return NextResponse.json({ error: 'Error al obtener publicaciones' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado para editar publicaciones' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { postId, mediaUrl, permalink, caption } = body;

    if (!postId) {
      return NextResponse.json({ error: 'postId es requerido' }, { status: 400 });
    }

    const updatedPost = await prisma.reportPost.update({
      where: { id: postId },
      data: {
        ...(mediaUrl !== undefined && { mediaUrl: mediaUrl || null, thumbnailUrl: mediaUrl || null }),
        ...(permalink !== undefined && { permalink: permalink || null }),
        ...(caption !== undefined && { caption: caption || null })
      }
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error('Post update error:', error);
    return NextResponse.json({ error: 'Error al actualizar publicación' }, { status: 500 });
  }
}
