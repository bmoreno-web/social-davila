import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEAM')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let apiKey = process.env.GEMINI_API_KEY || '';

    try {
      const dbSetting = await prisma.systemSetting.findUnique({
        where: { key: 'GEMINI_API_KEY' }
      });
      if (dbSetting?.value) {
        apiKey = dbSetting.value;
      }
    } catch (e) {
      console.warn('Could not read GEMINI_API_KEY from DB:', e);
    }

    const hasKey = !!apiKey && apiKey.trim().length > 0;

    return NextResponse.json({
      success: true,
      hasKey,
      apiKey: hasKey ? apiKey : '',
      activeModel: 'gemini-3.6-flash'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEAM')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { action, apiKey } = body;
    let keyToTest = (apiKey || '').trim();

    if (!keyToTest) {
      try {
        const dbSetting = await prisma.systemSetting.findUnique({
          where: { key: 'GEMINI_API_KEY' }
        });
        if (dbSetting?.value) keyToTest = dbSetting.value;
      } catch (e) {}
    }

    if (!keyToTest) {
      keyToTest = (process.env.GEMINI_API_KEY || '').trim();
    }

    if (!keyToTest) {
      return NextResponse.json({ success: false, error: 'Ingresa una clave API de Google Gemini' }, { status: 400 });
    }

    if (action === 'test') {
      // Test the key against Google AI Studio API
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToTest}`;
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();

      if (!listRes.ok || !listData.models) {
        const errMsg = listData.error?.message || `Error al conectar con Google API (HTTP ${listRes.status})`;
        return NextResponse.json({ success: false, error: errMsg });
      }

      // Test generate content with modern models
      const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-3.5-flash-lite'];
      let workingModel: string | null = null;
      let lastErr = '';

      for (const m of modelsToTry) {
        try {
          const genRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${keyToTest}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'OK' }] }]
            })
          });
          const genData = await genRes.json();
          if (genRes.ok && genData.candidates?.[0]?.content?.parts?.[0]?.text) {
            workingModel = m;
            break;
          } else {
            lastErr = genData.error?.message || `HTTP ${genRes.status}`;
          }
        } catch (e: any) {
          lastErr = e.message;
        }
      }

      if (workingModel) {
        return NextResponse.json({
          success: true,
          model: workingModel,
          message: `¡Conexión exitosa con Google Gemini (${workingModel})! Clave activa y lista para generar informes.`
        });
      } else {
        return NextResponse.json({
          success: false,
          error: lastErr || 'No se pudo generar contenido con los modelos disponibles.'
        });
      }
    }

    if (action === 'save') {
      // 1. Persist to Supabase PostgreSQL database
      try {
        await prisma.systemSetting.upsert({
          where: { key: 'GEMINI_API_KEY' },
          update: { value: keyToTest },
          create: { key: 'GEMINI_API_KEY', value: keyToTest }
        });
      } catch (dbErr) {
        console.warn('Warning saving setting to DB:', dbErr);
      }

      // 2. Update current runtime process memory
      process.env.GEMINI_API_KEY = keyToTest;

      // 3. Try to update local .env file (if running locally; safely ignore if read-only on serverless)
      try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          if (envContent.includes('GEMINI_API_KEY=')) {
            envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${keyToTest}"`);
          } else {
            envContent += `\nGEMINI_API_KEY="${keyToTest}"\n`;
          }
          fs.writeFileSync(envPath, envContent, 'utf8');
        }
      } catch (fsErr) {
        // Ignored on Serverless read-only filesystems (Vercel)
        console.info('Serverless read-only filesystem detected, saved to PostgreSQL instead.');
      }

      return NextResponse.json({
        success: true,
        message: '¡Clave de Google Gemini guardada exitosamente en la base de datos Supabase!'
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
