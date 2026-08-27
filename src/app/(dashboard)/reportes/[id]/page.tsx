'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  TrendingUp,
  Download,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { formatNumber, formatDateSpanish, PLATFORM_INFO } from '@/lib/utils';

export default function ReporteDetallePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const reportId = resolvedParams.id;

  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string>('DRAFT');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState('');

  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  const [isEditingEditorial, setIsEditingEditorial] = useState(false);
  const [editorialText, setEditorialText] = useState('');

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reports/${reportId}`);
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        setStatus(data.report.status);
        setTitleText(data.report.title || '');
        setSummaryText(data.report.executiveSummary || '');
        setEditorialText(data.report.editorialAnalysis || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStatus(newStatus);
        setReport({ ...report, status: newStatus });
        showSuccess('¡Estado del informe actualizado!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveField = async (fields: { title?: string; executiveSummary?: string; editorialAnalysis?: string }) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        setReport((prev: any) => ({ ...prev, ...fields }));
        setIsEditingTitle(false);
        setIsEditingSummary(false);
        setIsEditingEditorial(false);
        showSuccess('¡Cambios guardados con éxito!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente este informe (${report?.title})?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/reportes');
      } else {
        alert('No se pudo eliminar el reporte.');
        setIsDeleting(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al eliminar.');
      setIsDeleting(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  if (isLoading && !report) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-28 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
        <div className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 max-w-lg mx-auto">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Reporte no encontrado</h2>
        <Link href="/reportes" className="mt-4 inline-block text-xs text-purple-400 hover:underline">
          ← Volver a reportes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Save Success Banner */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/reportes"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a lista de reportes
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Workflow Selector */}
          <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <span className="text-zinc-500 pl-2">Estado:</span>
            <select
              value={status}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-200 font-semibold focus:outline-none focus:border-purple-500"
            >
              <option value="DRAFT">Borrador (Draft)</option>
              <option value="IN_REVIEW">En Revisión (In Review)</option>
              <option value="APPROVED">Aprobado (Approved)</option>
              <option value="PUBLISHED">Publicado al Cliente</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={() => window.print()}
            className="text-xs border-zinc-700 gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-zinc-400" /> Exportar / Imprimir
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteReport}
            isLoading={isDeleting}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Eliminar
          </Button>
        </div>
      </div>

      {/* DOCUMENT BODY */}
      <div className="p-8 md:p-12 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl space-y-8 print:p-6 print:border-none print:shadow-none print:bg-white print:space-y-6">
        {/* Report Header */}
        <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">
                DAVILA PM — INFORME MENSUAL
              </span>
              <Badge
                variant={
                  report.status === 'PUBLISHED'
                    ? 'success'
                    : report.status === 'APPROVED'
                    ? 'purple'
                    : 'default'
                }
                className="text-[10px]"
              >
                {report.status}
              </Badge>
            </div>

            {/* Editable Title */}
            {!isEditingTitle ? (
              <div className="flex items-start gap-2 group">
                <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
                  {report.title}
                </h1>
                <button
                  onClick={() => {
                    setTitleText(report.title);
                    setIsEditingTitle(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-500 hover:text-purple-400 print:hidden"
                  title="Editar título"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  className="bg-zinc-950 border-purple-500 text-sm font-bold text-white"
                />
                <Button size="sm" onClick={() => handleSaveField({ title: titleText })} className="bg-purple-600 text-xs shrink-0">
                  <Save className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)} className="text-xs shrink-0">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <p className="text-xs text-zinc-400 flex items-center gap-3">
              <span>Cliente: <strong className="text-zinc-200">{report.client?.name || 'Cliente Davila PM'}</strong></span>
              <span>•</span>
              <span>Período: <strong className="text-zinc-200">{formatDateSpanish(report.periodStart, "d MMM")} al {formatDateSpanish(report.periodEnd, "d MMM yyyy")}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 shrink-0">
            <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
              {report.client?.logo ? (
                <img src={report.client.logo} alt={report.client?.name || 'Cliente'} className="h-full w-full object-cover" />
              ) : (
                (report.client?.name || 'DA').slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{report.client?.name || 'Cliente'}</p>
              <p className="text-[10px] text-zinc-500">{report.client?.industry || 'Digital'}</p>
            </div>
          </div>
        </div>

        {/* Resumen Ejecutivo */}
        <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Resumen Ejecutivo
            </span>
            {!isEditingSummary ? (
              <button
                onClick={() => {
                  setSummaryText(report.executiveSummary || '');
                  setIsEditingSummary(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 print:hidden"
              >
                <Edit3 className="h-3 w-3" /> Editar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => handleSaveField({ executiveSummary: summaryText })} className="bg-purple-600 text-xs h-6 px-2">
                  Guardar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingSummary(false)} className="text-xs h-6 px-2">
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {!isEditingSummary ? (
            <p className="text-xs md:text-sm text-zinc-200 leading-relaxed font-sans">
              {report.executiveSummary || 'Sin resumen ejecutivo.'}
            </p>
          ) : (
            <Textarea
              rows={4}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-xs text-zinc-100 leading-relaxed"
            />
          )}
        </div>

        {/* Métricas Consolidadas */}
        {report.metrics && report.metrics.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Rendimiento Cuantitativo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {report.metrics.map((m: any) => (
                <div key={m.id} className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider text-[9px] block mb-1">
                    {m.metricKey?.replace('_', ' ')}
                  </span>
                  <div className="text-lg font-bold text-white">{formatNumber(m.currentValue)}</div>
                  {m.percentageChange !== null && m.percentageChange !== undefined && (
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
        <div className="p-6 rounded-2xl bg-zinc-950/80 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-display">
                Análisis Davila PM
              </h3>
            </div>
            {!isEditingEditorial ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditorialText(report.editorialAnalysis || '');
                  setIsEditingEditorial(true);
                }}
                className="text-xs text-purple-400 print:hidden gap-1 h-7"
              >
                <Edit3 className="h-3 w-3" /> Editar
              </Button>
            ) : (
              <div className="flex items-center gap-2 print:hidden">
                <Button
                  size="sm"
                  onClick={() => handleSaveField({ editorialAnalysis: editorialText })}
                  className="bg-purple-600 text-white text-xs h-7"
                >
                  Guardar Cambios
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingEditorial(false)}
                  className="text-xs h-7 text-zinc-400"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {isEditingEditorial ? (
            <Textarea
              rows={8}
              value={editorialText}
              onChange={(e) => setEditorialText(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-xs text-zinc-100 font-sans leading-relaxed"
            />
          ) : (
            <div className="text-xs md:text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-line space-y-2">
              {report.editorialAnalysis || 'Sin análisis redactado todavía.'}
            </div>
          )}
        </div>

        {/* RECOMENDACIONES ESTRATÉGICAS */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Recomendaciones Estratégicas para el Siguiente Ciclo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.recommendations.map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default" className="text-[9px] uppercase font-mono">
                      {rec.category}
                    </Badge>
                    <Badge
                      variant={rec.priority === 'ALTA' ? 'destructive' : 'warning'}
                      className="text-[9px]"
                    >
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

        {/* Report Footer */}
        <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Generado por Davila PM — Digital Agency Suite</span>
          <span>Responsable: {report.creator?.name || 'Administrador Davila PM'}</span>
        </div>
      </div>
    </div>
  );
}
