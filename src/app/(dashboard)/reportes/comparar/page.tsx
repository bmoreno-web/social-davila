'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GitCompare,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercentage, formatDateSpanish } from '@/lib/utils';

export default function CompararReportesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [reportAId, setReportAId] = useState<string>('');
  const [reportBId, setReportBId] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.reports && data.reports.length > 0) {
        setReports(data.reports);
        setReportAId(data.reports[0].id);
        if (data.reports.length > 1) {
          setReportBId(data.reports[1].id);
        } else {
          setReportBId(data.reports[0].id);
        }
      }
    };
    fetchReports();
  }, []);

  const handleCompare = async () => {
    if (!reportAId || !reportBId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/compare?reportA=${reportAId}&reportB=${reportBId}`);
      const data = await res.json();
      if (data.reportA && data.reportB) {
        setComparisonData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reportAId && reportBId) {
      handleCompare();
    }
  }, [reportAId, reportBId]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/reportes"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a reportes
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-tight flex items-center gap-2.5">
          <GitCompare className="h-6 w-6 text-purple-400" /> Comparador de Reportes
        </h1>
        <p className="text-xs text-zinc-400">
          Compara dos períodos o informes mensuales lado a lado para evaluar el crecimiento estratégico.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <label className="block text-xs font-semibold text-purple-300 mb-1.5 uppercase tracking-wider">
            Informe Base (Período Reciente)
          </label>
          <select
            value={reportAId}
            onChange={(e) => setReportAId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.client.name} — {r.title} ({formatDateSpanish(r.periodEnd, 'MMM yyyy')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
            Informe Comparativo (Período Anterior)
          </label>
          <select
            value={reportBId}
            onChange={(e) => setReportBId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.client.name} — {r.title} ({formatDateSpanish(r.periodEnd, 'MMM yyyy')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPARISON RESULTS */}
      {isLoading ? (
        <div className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
      ) : comparisonData ? (
        <div className="space-y-6">
          {/* Comparison Table */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-semibold">Métrica Clave</th>
                  <th className="p-4 font-semibold text-purple-300">
                    {comparisonData.reportA.title.split('—')[1]?.trim() || 'Período A'}
                  </th>
                  <th className="p-4 font-semibold text-zinc-400">
                    {comparisonData.reportB.title.split('—')[1]?.trim() || 'Período B'}
                  </th>
                  <th className="p-4 font-semibold text-right">Variación Neta / %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {comparisonData.comparisonMetrics.map((item: any) => (
                  <tr key={item.key} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 font-semibold text-white capitalize">
                      {item.key.replace('_', ' ')}
                    </td>
                    <td className="p-4 font-bold text-white text-sm">
                      {item.key === 'engagement' ? `${item.valueA}%` : formatNumber(item.valueA)}
                    </td>
                    <td className="p-4 text-zinc-400 font-medium">
                      {item.key === 'engagement' ? `${item.valueB}%` : formatNumber(item.valueB)}
                    </td>
                    <td className="p-4 text-right font-bold">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                          item.isPositive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {item.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatPercentage(item.percentageChange)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Editorial Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-purple-500/30 space-y-3">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                Análisis: {comparisonData.reportA.title}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                {comparisonData.reportA.editorialAnalysis || 'Sin análisis registrado.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Análisis: {comparisonData.reportB.title}
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                {comparisonData.reportB.editorialAnalysis || 'Sin análisis registrado.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
