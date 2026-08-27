import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import * as bcrypt from 'bcryptjs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden modificar usuarios' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role, clientId, active } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const updateData: any = {
      name: name || undefined,
      email: email ? email.toLowerCase().trim() : undefined,
      role: role || undefined,
      clientId: role === 'CLIENT' ? (clientId !== undefined ? clientId : existing.clientId) : null,
      active: active !== undefined ? active : undefined
    };

    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        action: 'UPDATE',
        resourceType: 'USER',
        resourceId: id,
        details: `Modificación de datos del usuario ${updated.name} (${updated.email})`
      }
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo administradores pueden eliminar usuarios' }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.userId) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta en sesión' }, { status: 400 });
    }

    const deleted = await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        action: 'DELETE',
        resourceType: 'USER',
        resourceId: id,
        details: `Eliminación de cuenta de usuario: ${deleted.name} (${deleted.email})`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
