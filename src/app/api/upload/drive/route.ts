import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { uploadFileToDrive, testDriveConnection } from '@/lib/drive/google-drive';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const result = await testDriveConnection();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Error al conectar con Google Drive'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const clientName = (formData.get('clientName') as string) || 'General';

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadFileToDrive({
      buffer,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      clientName
    });

    return NextResponse.json({
      success: true,
      file: uploaded
    });
  } catch (error: any) {
    console.warn('Drive upload gracefully falling back:', error?.message);
    return NextResponse.json({
      success: false,
      fallback: true,
      error: error?.message || 'Error al subir archivo a Google Drive'
    }, { status: 200 });
  }
}
