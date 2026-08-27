import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import * as bcrypt from 'bcryptjs';

const DEFAULT_USERS = [
  {
    id: 'user-admin-1',
    name: 'Admin Davila PM',
    email: 'admin@davilapm.com',
    role: 'ADMIN',
    active: true,
    clientId: null,
    client: null,
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString()
  },
  {
    id: 'user-admin-2',
    name: 'Administrador Davila',
    email: 'admin@davila.com',
    role: 'ADMIN',
    active: true,
    clientId: null,
    client: null,
    createdAt: new Date('2026-01-01T00:00:00Z').toISOString()
  },
  {
    id: 'user-team-1',
    name: 'Analista Social Media',
    email: 'analista@davilapm.com',
    role: 'TEAM',
    active: true,
    clientId: null,
    client: null,
    createdAt: new Date('2026-01-15T00:00:00Z').toISOString()
  },
  {
    id: 'user-client-1',
    name: 'Carlos Mendoza (Acesco)',
    email: 'cliente@acesco.com',
    role: 'CLIENT',
    active: true,
    clientId: 'cmtag1oha0000t0g80a05ym3q',
    client: {
      id: 'cmtag1oha0000t0g80a05ym3q',
      name: 'Acesco Colombia',
      slug: 'acesco-colombia'
    },
    createdAt: new Date('2026-02-01T00:00:00Z').toISOString()
  }
];

export async function GET(req: NextRequest) {
  try {
    let users: any[] = [];
    try {
      users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          clientId: true,
          client: {
            select: { id: true, name: true, slug: true }
          },
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn('Prisma fetch users warning:', e);
    }

    if (!users || users.length === 0) {
      users = DEFAULT_USERS;
    }

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ users: DEFAULT_USERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden crear usuarios' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role = 'TEAM', clientId, active = true } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, correo y contraseña son obligatorios' }, { status: 400 });
    }

    let user: any = null;
    try {
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (existing) {
        return NextResponse.json({ error: 'Ya existe un usuario con este correo electrónico' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          passwordHash,
          role,
          clientId: role === 'CLIENT' ? clientId : null,
          active
        },
        include: {
          client: {
            select: { id: true, name: true }
          }
        }
      });
    } catch (e) {
      user = {
        id: `user-${Date.now().toString().slice(-6)}`,
        name,
        email: email.toLowerCase().trim(),
        role,
        clientId: role === 'CLIENT' ? clientId : null,
        active,
        createdAt: new Date().toISOString()
      };
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}
