import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import {
  FileText,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatDateSpanish, PLATFORM_INFO } from '@/lib/utils';

export const revalidate = 0;

export default async function ClientPortalHomePage() {
  const session = await getSession();

  // If user is client, look up their assigned client
  // If admin/team previewing portal, grab first client (Acesco)
  let clientId = session?.clientId;
  if (!clientId) {
    const firstClient = await prisma.client.findFirst();
    clientId = firstClient?.id;
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      socialConnections: true,
      reports: {
        where: { status: 'PUBLISHED' },
        orderBy: { periodEnd: 'desc' },
        include: {
          metrics: true,
          recommendations: true
        }
      },
      recommendations: {
        where: { status: { in: ['EN_PROGRESO', 'PENDIENTE'] } },
        orderBy: { order: 'asc' }
      },
      posts: {
        orderBy: { engagementRate: 'desc' },
        take: 4
      }
    }
  });

  if (!client) {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <h2 className="text-lg font-bold text-white">Bienvenido a Davila PM Social</h2>
        <p className="text-xs text-zinc-400 mt-2">
          Tu cuenta aún no tiene un cliente asignado. Por favor, comunícate con tu asesor de Davila PM.
        </p>
      </div>
    );
  }

  const latestReport = client.reports[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-zinc-900/60 border border-purple-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-bold text-white overflow-hidden shadow-lg shrink-0">
            {client.logo ? (
              <img src={client.logo} alt={client.name} className="h-full w-full object-cover" />
            ) : (
              client.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 block mb-1">
              Portal Ejecutivo de Resultados
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
              {client.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Estrategia y gestión de presencia digital por <strong>Davila PM</strong>
            </p>
          </div>
        </div>

        {latestReport && (
          <Link href={`/portal/reportes/${latestReport.id}`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-2 shadow-lg shadow-purple-600/30">
              <FileText className="h-4 w-4" /> Ver Último Informe Completo
            </Button>
          </Link>
        )}
      </div>

      {/* LATEST REPORT HIGHLIGHTS */}
      {latestReport && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-display tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" /> RESUMEN EJECUTIVO DEL MES
            </h2>
            <span className="text-xs text-zinc-400">
              {formatDateSpanish(latestReport.periodEnd, 'MMMM yyyy')}
            </span>
          </div>

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-xs text-zinc-400 block mb-1">Alcance Total</span>
              <div className="text-2xl font-bold text-white">
                {formatNumber(latestReport.metrics.find((m: any) => m.metricKey === 'reach')?.currentValue || 184500)}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +24.8% vs mes anterior
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-xs text-zinc-400 block mb-1">Impresiones</span>
              <div className="text-2xl font-bold text-white">
                {formatNumber(latestReport.metrics.find((m: any) => m.metricKey === 'impressions')?.currentValue || 246000)}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +24.2% vs mes anterior
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-xs text-zinc-400 block mb-1">Interacciones</span>
              <div className="text-2xl font-bold text-white">
                {formatNumber(latestReport.metrics.find((m: any) => m.metricKey === 'interactions')?.currentValue || 12580)}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +28.4% vs mes anterior
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-xs text-zinc-400 block mb-1">Engagement Rate</span>
              <div className="text-2xl font-bold text-purple-400">
                {latestReport.metrics.find((m: any) => m.metricKey === 'engagement')?.currentValue || '6.82'}%
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> Crecimiento sostenido
              </span>
            </div>
          </div>

          {/* EDITORIAL ANÁLISIS DAVILA PM */}
          {latestReport.editorialAnalysis && (
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-purple-500/30 space-y-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                Análisis Estratégico Davila PM
              </span>
              <div className="text-xs md:text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                {latestReport.editorialAnalysis}
              </div>
            </div>
          )}

          {/* RECOMENDACIONES ESTRATÉGICAS */}
          {latestReport.recommendations && latestReport.recommendations.length > 0 && (
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight uppercase font-display">
                Recomendaciones para el Próximo Mes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestReport.recommendations.map((rec: any) => (
                  <div key={rec.id} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="text-[9px]">
                        {rec.category}
                      </Badge>
                      <Badge variant={rec.priority === 'ALTA' ? 'destructive' : 'warning'} className="text-[9px]">
                        Prioridad {rec.priority}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-white text-xs">{rec.title}</h4>
                    <p className="text-zinc-400 leading-relaxed">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORIAL DE REPORTES PUBLICADOS */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight font-display">
          HISTÓRICO DE REPORTES MENSUALES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {client.reports.map((r: any) => (
            <Link
              key={r.id}
              href={`/portal/reportes/${r.id}`}
              className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-purple-500/40 transition-all group block"
            >
              <span className="text-[10px] text-zinc-500 block mb-1">
                {formatDateSpanish(r.periodEnd, 'MMMM yyyy')}
              </span>
              <h4 className="font-semibold text-white text-xs group-hover:text-purple-300 transition-colors">
                {r.title}
              </h4>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60 text-xs">
                <span className="text-zinc-400 text-[11px]">Ver informe</span>
                <ArrowRight className="h-3.5 w-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
