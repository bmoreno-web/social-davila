import { NextResponse } from 'next/server';
import { metricoolService } from '@/lib/metricool/client';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEAM')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const status = await metricoolService.testConnection();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      profilesCount: 0,
      message: `Error al probar API de Metricool: ${error.message}`
    }, { status: 500 });
  }
}
