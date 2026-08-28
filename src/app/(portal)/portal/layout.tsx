import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { LogOut, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalLogoutButton } from '@/components/portal/portal-logout-button';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col print:bg-white print:text-slate-900 print:block">
      {/* Client Portal Header */}
      <header className="h-16 px-6 md:px-10 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <span className="font-bold text-sm">D</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white font-display">DAVILA PM</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PORTAL CLIENTE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {session.role !== 'CLIENT' && (
            <Link href="/">
              <Button size="sm" variant="glass" className="text-xs border-zinc-700 text-zinc-300 gap-1.5 hidden md:flex">
                <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
                <span>Panel Agencia</span>
              </Button>
            </Link>
          )}

          {/* Dark / Light Toggle */}
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{session.name}</span>
          </div>

          <PortalLogoutButton />
        </div>
      </header>

      {/* Portal Sub-Nav */}
      <div className="bg-zinc-950/60 border-b border-zinc-800/60 px-6 md:px-10 py-2.5 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center gap-3 text-xs">
          <Link
            href="/portal"
            className="px-3.5 py-1.5 rounded-lg font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors flex items-center gap-2"
          >
            <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
            <span>Métricas & Rendimiento</span>
          </Link>

          <Link
            href="/portal/parrilla"
            className="px-3.5 py-1.5 rounded-lg font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Aprobación de Contenidos</span>
          </Link>

          <Link
            href="/portal/reportes"
            className="px-3.5 py-1.5 rounded-lg font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors hidden sm:flex items-center gap-2"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
            <span>Histórico de Informes</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-800/80 text-center text-xs text-zinc-500 print:hidden">
        © 2026 Davila PM — Transformación Digital & Estrategia de Medios
      </footer>
    </div>
  );
}
