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
  const [clients, reports, totalSocials] = await Promise.all([
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

  const activeClientsCount = clients.length;
  const publishedReportsCount = reports.filter((r) => r.status === 'PUBLISHED').length;
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
            Supervisa marcas, analiza publicaciones y genera reportes editoriales de alto impacto.
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
          <p className="text-[11px] text-zinc-400 mt-1">Disponibles a clientes</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Reportes Pendientes</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{pendingReportsCount}</div>
          <p className="text-[11px] text-amber-400/80 mt-1">En borrador / revisión</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Redes Conectadas</span>
            <Share2 className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalSocials}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Instagram, FB, TikTok, LI</p>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Última Sincronización</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xs font-semibold text-zinc-200 truncate">{lastSyncStr}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Motor Metricool API v2</p>
        </div>
      </div>

      {/* CLIENTS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight font-display">
              CLIENTES & MARCAS
            </h2>
            <p className="text-xs text-zinc-400">
              Marcas vinculadas para analítica social y entrega de valor editorial
            </p>
          </div>
          <Link
            href="/clientes"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Ver todos los clientes <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => {
            const lastReport = client.reports[0];
            const hasSocials = client.socialConnections.length > 0;

            return (
              <div
                key={client.id}
                className="group rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-purple-500/40 p-5 transition-all duration-200 hover:shadow-xl hover:shadow-purple-950/20 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Logo + Name + Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0">
                        {client.logo ? (
                          <img
                            src={client.logo}
                            alt={client.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{client.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base group-hover:text-purple-300 transition-colors">
                          {client.name}
                        </h3>
                        <p className="text-xs text-zinc-400">{client.industry || 'Digital Marketing'}</p>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      Activo
                    </Badge>
                  </div>

                  {/* Connected Socials */}
                  <div className="mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Redes Activas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hasSocials ? (
                        client.socialConnections.map((s) => {
                          const info = PLATFORM_INFO[s.platform] || { label: s.platform, bg: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
                          return (
                            <span
                              key={s.id}
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${info.bg}`}
                            >
                              {info.label}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-zinc-500 italic">Sin redes conectadas</span>
                      )}
                    </div>
                  </div>

                  {/* Reporting Status */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Último Reporte:</span>
                      <span className="font-medium text-zinc-200 truncate block">
                        {lastReport ? lastReport.title.split('—')[1]?.trim() || lastReport.title : 'Sin reporte'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Próximo Reporte:</span>
                      <span className="font-medium text-purple-300 block">Septiembre 2026</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <Link href={`/clientes/${client.id}`} className="w-full block">
                  <Button
                    variant="secondary"
                    className="w-full text-xs font-semibold justify-between bg-zinc-800/80 hover:bg-purple-600 hover:text-white border-zinc-700/60 group-hover:border-purple-500/30 transition-all"
                  >
                    <span>VER CLIENTE</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT REPORTS TABLE */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight font-display">
              HISTORIAL RECIENTE DE REPORTES
            </h2>
            <p className="text-xs text-zinc-400">Informes editoriales mensuales generados para clientes</p>
          </div>
          <Link
            href="/reportes"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Ver todos los reportes <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Título del Informe</th>
                <th className="pb-3 font-semibold">Período</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 font-semibold text-white">{report.client.name}</td>
                  <td className="py-3.5 font-medium text-zinc-200">{report.title}</td>
                  <td className="py-3.5 text-zinc-400">
                    {formatDateSpanish(report.periodEnd, "MMMM yyyy")}
                  </td>
                  <td className="py-3.5">
                    <Badge
                      variant={
                        report.status === 'PUBLISHED'
                          ? 'success'
                          : report.status === 'IN_REVIEW'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-[10px]"
                    >
                      {report.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link href={`/reportes/${report.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-400 hover:text-purple-300">
                        Abrir Reporte
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
