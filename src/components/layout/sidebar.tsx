'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Share2,
  CalendarDays,
  FileText,
  GitCompare,
  History,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import { AuthSession } from '@/lib/auth/session';

interface SidebarProps {
  user: AuthSession;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Clientes', href: '/clientes', icon: Users },
    { label: 'Parrilla de Contenido', href: '/parrilla', icon: CalendarDays },
    { label: 'Redes Sociales', href: '/redes', icon: Share2 },
    { label: 'Reportes', href: '/reportes', icon: FileText },
    { label: 'Comparador', href: '/reportes/comparar', icon: GitCompare },
    { label: 'Auditoría', href: '/auditoria', icon: History },
    { label: 'Usuarios & Config', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0c0e15] border-r border-zinc-800/80 flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-zinc-800/60">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
          <span className="font-bold text-sm tracking-wider">D</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white font-display">DAVILA PM</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              SOCIAL
            </span>
          </div>
          <p className="text-[10px] text-zinc-400">Digital Agency Suite</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Gestión & Analítica
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href) && (item.href !== '/reportes' || pathname === '/reportes' || pathname.startsWith('/reportes/nuevo') || !pathname.startsWith('/reportes/comparar'));

          const isExactActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                isExactActive
                  ? "bg-purple-600/15 text-purple-300 border border-purple-500/20 shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isExactActive ? "text-purple-400" : "text-zinc-400 group-hover:text-zinc-200"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Client Portal Preview Link */}
        <div className="pt-4 mt-4 border-t border-zinc-800/60">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Portales
          </div>
          <Link
            href="/portal"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 transition-colors border border-amber-500/20"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Portal Cliente (Preview)
            </span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-zinc-800/60 bg-[#090b10]/60">
        <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge
                  variant={user.role === 'ADMIN' ? 'purple' : 'default'}
                  className="text-[9px] px-1.5 py-0 h-4"
                >
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
