import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        clientId: true,
        client: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
          clientId: session.clientId
        }
      });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    const session = await getSession();
    if (session) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
          clientId: session.clientId
        }
      });
    }
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
}
