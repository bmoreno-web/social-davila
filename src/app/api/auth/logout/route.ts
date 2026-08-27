import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  await clearSessionCookie();
  
  const acceptHeader = req.headers.get('accept') || '';
  const contentType = req.headers.get('content-type') || '';
  
  // If triggered by an HTML form submission or browser navigation, redirect directly to /login
  if (acceptHeader.includes('text/html') || contentType.includes('application/x-www-form-urlencoded')) {
    return NextResponse.redirect(new URL('/login', req.url), 303);
  }

  return NextResponse.json({ success: true, message: 'Sesión finalizada' });
}

export async function GET(req: NextRequest) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL('/login', req.url), 303);
}
