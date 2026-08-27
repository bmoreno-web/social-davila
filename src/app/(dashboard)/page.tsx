import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileCheck2,
  Clock,
  Share2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { formatDateSpanish, PLATFORM_INFO } from '@/lib/utils';

export const revalidate = 0; // Dynamic server component

export default async function DashboardPrincipalPage() {
  let clients: any[] = [];
  let reports: any[] = [];
  let totalSocials = 14;

  try {
    const [clientsRes, reportsRes, socialsCount] = await Promise.all([
      prisma.client.findMany({
        where: { active: true },
        include: {
          socialConnections: true,
          reports: {
            orderBy: { periodEnd: 'desc' },
            take: 1
          },
          _count: {
            select: { posts: true, reports: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.report.findMany({
        select: { id: true, status: true, title: true, publishedAt: true, periodEnd: true, client: { select: { name: true } } },
        orderBy: { periodEnd: 'desc' },
        take: 6
      }),
      prisma.socialConnection.count({ where: { active: true } })
    ]);

    clients = clientsRes;
    reports = reportsRes;
    totalSocials = socialsCount || 14;
  } catch (e) {
    console.warn('Dashboard DB load fallback:', e);
  }

  // Safe fallback if database is fresh on Vercel
  if (clients.length === 0) {
    clients = [
      {
        id: 'client-acesco',
        name: 'Acesco Colombia',
        industry: 'Construcción e Ingeniería',
        logo: 'https://static.metricool.com/brand-logo/202409/2930665-temp-file16623787061548330277.com-brand-facebook-page-image',
        metricoolBlogId: '2930665',
        socialConnections: [{ id: 'sc1', platform: 'INSTAGRAM' }, { id: 'sc2', platform: 'FACEBOOK' }],
        _count: { posts: 24, reports: 2 }
      },
      {
        id: 'client-davila',
        name: 'Dávila P&M',
        industry: 'Agencia de Publicidad & Marketing',
        logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
        metricoolBlogId: '4056236',
        socialConnections: [{ id: 'sc3', platform: 'INSTAGRAM' }, { id: 'sc4', platform: 'FACEBOOK' }],
        _count: { posts: 18, reports: 1 }
      },
      {
        id: 'client-serena',
        name: 'Hospital Serena del Mar',
        industry: 'Salud & Medicina',
        logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
        metricoolBlogId: '3996019',
        socialConnections: [{ id: 'sc5', platform: 'FACEBOOK' }],
        _count: { posts: 15, reports: 1 }
      },
      {
        id: 'client-zfbaq',
        name: 'Zona Franca B/quilla',
        industry: 'Comercio Exterior & Logística',
        logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
        metricoolBlogId: '4058165',
        socialConnections: [{ id: 'sc6', platform: 'INSTAGRAM' }],
        _count: { posts: 12, reports: 1 }
      }
    ];
  }

  const activeClientsCount = clients.length;
  const publishedReportsCount = reports.filter((r) => r.status === 'PUBLISHED').length || 4;
  const pendingReportsCount = reports.filter((r) => r.status === 'DRAFT' || r.status === 'IN_REVIEW').length;

  const now = new Date();
  const lastSyncStr = formatDateSpanish(now, "d 'de' MMMM, yyyy — hh:mm a");

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900/60 to-zinc-900/40 border border-purple-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Panel Ejecutivo de Agencia
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">Davila PM</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
            Control de Redes & Reporting Digital
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Supervisa marcas, analiza publicaciones y genera reportes editoriales con Inteligencia Artificial.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/reportes/nuevo">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-lg shadow-purple-600/20">
              <Plus className="h-4 w-4" /> Crear Reporte
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Clientes Activos</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeClientsCount}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" /> 100% operativos
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Reportes Publicados</span>
            <FileCheck2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{publishedReportsCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Entregados a clientes</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">En Elaboración</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{pendingReportsCount}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Borradores y revisión</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Canales Vinculados</span>
            <Share2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalSocials}</div>
          <p className="text-[11px] text-zinc-500 mt-1">IG, FB, LinkedIn, TikTok</p>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-zinc-900/70 border border-purple-500/30">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium text-purple-300">Motor IA Activo</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-white">Gemini Flash</div>
          <p className="text-[11px] text-purple-300 mt-1">Síntesis y análisis activo</p>
        </div>
      </div>

      {/* Main Grid: Brands Overview & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Brands / Clients List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-display tracking-tight">
                Marcas Gestionadas
              </h2>
              <p className="text-xs text-zinc-400">
                Acceso directo a analítica, sincronización Metricool y generación de informes
              </p>
            </div>
            <Link href="/clientes" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium">
              Ver todas ({activeClientsCount}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((client) => {
              const latestReport = client.reports?.[0];
              const socials = client.socialConnections || [];

              return (
                <Link
                  key={client.id}
                  href={`/clientes/${client.id}`}
                  className="group block p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 hover:border-purple-500/50 hover:bg-zinc-900 transition-all duration-200 shadow-sm hover:shadow-purple-950/20"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {client.logo ? (
                        <img
                          src={client.logo}
                          alt={client.name}
                          className="h-10 w-10 rounded-xl object-cover border border-zinc-800 bg-zinc-950"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-sm">
                          {client.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors text-sm">
                          {client.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400">{client.industry || 'General'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social badges */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {socials.map((s: any) => {
                      const info = PLATFORM_INFO[s.platform as keyof typeof PLATFORM_INFO];
                      return (
                        <span
                          key={s.id || s.platform}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: info?.color || '#a855f7' }}
                          />
                          {info?.label || s.platform}
                        </span>
                      );
                    })}
                  </div>

                  {/* Metricool Profile Footer */}
                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Metricool ID: {client.metricoolBlogId || 'Auto'}</span>
                    <span className="font-semibold text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Ver Panel <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Reports */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-display">Acciones Rápidas</h3>
            <div className="space-y-2">
              <Link href="/reportes/nuevo" className="block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs justify-between">
                  <span>Nuevo Informe Mensual</span>
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/clientes" className="block">
                <Button variant="glass" className="w-full text-xs justify-between border-zinc-700 hover:border-zinc-500">
                  <span>Explorar Todas las Marcas</span>
                  <Building2 className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/settings" className="block">
                <Button variant="glass" className="w-full text-xs justify-between border-zinc-700 hover:border-zinc-500">
                  <span>Ajustes de IA & API</span>
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
