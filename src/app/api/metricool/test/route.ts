import { NextRequest, NextResponse } from 'next/server';
import { metricoolService } from '@/lib/metricool/client';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEAM')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const status = await metricoolService.testConnection();

    // Check if key is in Supabase
    let customKey = '';
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'METRICOOL_API_KEY' }
      });
      if (setting?.value) customKey = setting.value;
    } catch (e) {}

    return NextResponse.json({
      ...status,
      hasCustomKey: !!customKey,
      customKey: customKey ? customKey.slice(0, 8) + '...' + customKey.slice(-4) : ''
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      profilesCount: 0,
      message: `Error al probar API de Metricool: ${error.message}`
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { apiKey } = await req.json();
    const token = (apiKey || '').trim();

    if (!token) {
      return NextResponse.json({ error: 'Ingresa un User Token de Metricool válido' }, { status: 400 });
    }

    // Save to Supabase SystemSetting
    await prisma.systemSetting.upsert({
      where: { key: 'METRICOOL_API_KEY' },
      update: { value: token },
      create: { key: 'METRICOOL_API_KEY', value: token }
    });

    process.env.METRICOOL_API_KEY = token;

    const status = await metricoolService.testConnection();

    return NextResponse.json({
      success: status.success,
      message: status.success
        ? '¡Token de Metricool guardado en Supabase y verificado con éxito!'
        : `Token guardado, pero la prueba devolvió: ${status.message}`,
      profilesCount: status.profilesCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
