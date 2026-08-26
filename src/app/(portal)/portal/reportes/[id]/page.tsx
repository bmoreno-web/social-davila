import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getSession } from '@/lib/auth/session';
import {
  ArrowLeft,
  Printer,
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatDateSpanish } from '@/lib/utils';

export const revalidate = 0;

export default async function ClientReportDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      client: true,
      metrics: true,
      recommendations: true
    }
  });

  if (!report || report.status !== 'PUBLISHED') {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-lg font-bold text-white">Informe no disponible</h2>
        <Link href="/portal" className="mt-4 inline-block text-xs text-purple-400">
          ← Volver al portal
        </Link>
      </div>
    );
  }

  // If client user, ensure tenant isolation
  if (session.role === 'CLIENT' && session.clientId && session.clientId !== report.clientId) {
    redirect('/portal');
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/portal"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al portal
        </Link>
      </div>

      <div className="p-8 md:p-12 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl space-y-8">
        {/* Report Header */}
        <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">
              DAVILA PM — INFORME EJECUTIVO
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
              {report.title}
            </h1>
            <p className="text-xs text-zinc-400">
              Período: <strong className="text-zinc-200">{formatDateSpanish(report.periodStart, "d MMM")} al {formatDateSpanish(report.periodEnd, "d MMM yyyy")}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 shrink-0">
            <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
              {report.client.logo ? (
                <img src={report.client.logo} alt={report.client.name} className="h-full w-full object-cover" />
              ) : (
                report.client.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{report.client.name}</p>
              <p className="text-[10px] text-zinc-500">{report.client.industry || 'Digital'}</p>
            </div>
          </div>
        </div>

        {/* Executive summary */}
        {report.executiveSummary && (
          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Resumen Ejecutivo
            </span>
            <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-sans">
              {report.executiveSummary}
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        {report.metrics && report.metrics.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Resultados Cuantitativos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {report.metrics.map((m: any) => (
                <div key={m.id} className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider text-[9px] block mb-1">
                    {m.metricKey.replace('_', ' ')}
                  </span>
                  <div className="text-lg font-bold text-white">{formatNumber(m.currentValue)}</div>
                  {m.percentageChange !== null && (
                    <span className="text-emerald-400 text-[10px] font-semibold block mt-0.5">
                      +{m.percentageChange}% vs anterior
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANÁLISIS EDITORIAL DAVILA PM */}
        {report.editorialAnalysis && (
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-display">
                Análisis Davila PM
              </h3>
            </div>
            <div className="text-xs md:text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-line space-y-2">
              {report.editorialAnalysis}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Recomendaciones Estratégicas para el Siguiente Ciclo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.recommendations.map((rec: any) => (
                <div key={rec.id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default" className="text-[9px] uppercase font-mono">
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

        {/* Footer */}
        <div className="pt-6 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Elaborado por Davila PM — Digital Agency</span>
          <span>Fecha de Publicación: {formatDateSpanish(report.publishedAt || new Date())}</span>
        </div>
      </div>
    </div>
  );
}
