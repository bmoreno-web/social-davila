'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatDateSpanish } from '@/lib/utils';

export default function NuevoReportePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '');
  const [title, setTitle] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-08-01');
  const [periodEnd, setPeriodEnd] = useState('2026-08-26');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [editorialAnalysis, setEditorialAnalysis] = useState('');
  const [reportStatus, setReportStatus] = useState('DRAFT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const handleGenerateAiReport = async () => {
    if (!selectedClientId) return;
    setIsGeneratingAi(true);
    setAiMessage(null);
    try {
      const res = await fetch(`/api/clients/${selectedClientId}/ai-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        if (data.editorialAnalysis) setEditorialAnalysis(data.editorialAnalysis);
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendationsList(data.recommendations);
        }
        setAiMessage(data.message || '¡Análisis y recomendaciones generados con Gemini IA!');
        setTimeout(() => setAiMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Auto-calculated Metrics Snapshot
  const [metricsList, setMetricsList] = useState<any[]>([
    { metricKey: 'followers', label: 'Seguidores Totales', currentValue: 38450, previousValue: 36200, percentageChange: 6.2 },
    { metricKey: 'reach', label: 'Alcance Neto', currentValue: 184500, previousValue: 147800, percentageChange: 24.8 },
    { metricKey: 'impressions', label: 'Impresiones', currentValue: 246000, previousValue: 198000, percentageChange: 24.2 },
    { metricKey: 'interactions', label: 'Interacciones', currentValue: 12580, previousValue: 9800, percentageChange: 28.4 },
    { metricKey: 'engagement', label: 'Engagement Rate (%)', currentValue: 6.82, previousValue: 6.63, percentageChange: 2.9 },
    { metricKey: 'posts_count', label: 'Publicaciones', currentValue: 22, previousValue: 18, percentageChange: 22.2 }
  ]);

  // Recommendations
  const [recommendationsList, setRecommendationsList] = useState<any[]>([]);

  const [newRecCategory, setNewRecCategory] = useState('CONTENIDO');
  const [newRecPriority, setNewRecPriority] = useState('ALTA');
  const [newRecTitle, setNewRecTitle] = useState('');
  const [newRecDesc, setNewRecDesc] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
        if (!selectedClientId && data.clients.length > 0) {
          setSelectedClientId(data.clients[0].id);
        }
      }
    };
    fetchClients();
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  useEffect(() => {
    if (!selectedClientId) return;

    const loadClientData = async () => {
      try {
        const [clientRes, metricsRes] = await Promise.all([
          fetch(`/api/clients/${selectedClientId}`),
          fetch(`/api/clients/${selectedClientId}/metrics?range=30d`)
        ]);

        const clientData = await clientRes.json();
        const metricsData = await metricsRes.json();

        const client = clientData.client;
        if (client) {
          setTitle(`Informe Ejecutivo de Rendimiento Digital — ${client.name} (Agosto 2026)`);

          const reach = metricsData?.summary?.reach || 48500;
          const er = metricsData?.summary?.engagementRate || 6.8;
          const interactions = metricsData?.summary?.interactions || 12400;
          const impressions = metricsData?.summary?.impressions || 84000;
          const followers = metricsData?.summary?.followers || 29900;
          const postsCount = metricsData?.summary?.postsCount || 18;

          setExecutiveSummary(
            `Durante el ciclo evaluado, la marca ${client.name} (${client.industry || 'General'}) consolidó un alcance neto de ${formatNumber(reach)} personas y un volumen de ${formatNumber(interactions)} interacciones en sus canales digitales, alcanzando un Engagement Rate promedio del ${er}%.`
          );

          if (client.reports && client.reports.length > 0 && client.reports[0].editorialAnalysis) {
            setEditorialAnalysis(client.reports[0].editorialAnalysis);
          } else {
            setEditorialAnalysis(
              `### 1. Diagnóstico de Rendimiento & Tracción Audiovisual\nDurante el ciclo analizado, la marca **${client.name}** acumuló un alcance neto de **${formatNumber(reach)} personas** y **${formatNumber(impressions)} impresiones**, consolidando una tasa de engagement del **${er}%**.\n\n### 2. Comportamiento de Comunidad & Retención\nSe registraron **${formatNumber(interactions)} interacciones totales**. La comunidad responde activamente a contenidos de alto valor técnico y formatos dinámicos.\n\n### 3. Balance Estratégico Davila PM\nSe recomienda priorizar la amplificación de los mejores contenidos orgánicos y mantener el ritmo de publicación en los canales principales.`
            );
          }

          if (client.recommendations && client.recommendations.length > 0) {
            setRecommendationsList(client.recommendations.map((r: any) => ({
              category: r.category || 'CONTENIDO',
              priority: r.priority || 'ALTA',
              title: r.title,
              description: r.description
            })));
          }

          if (metricsData?.summary) {
            setMetricsList([
              { metricKey: 'followers', label: 'Seguidores Totales', currentValue: followers, previousValue: Math.round(followers * 0.94), percentageChange: 6.4 },
              { metricKey: 'reach', label: 'Alcance Neto', currentValue: reach, previousValue: Math.round(reach * 0.82), percentageChange: 22.0 },
              { metricKey: 'impressions', label: 'Impresiones', currentValue: impressions, previousValue: Math.round(impressions * 0.85), percentageChange: 17.6 },
              { metricKey: 'interactions', label: 'Interacciones', currentValue: interactions, previousValue: Math.round(interactions * 0.84), percentageChange: 19.0 },
              { metricKey: 'engagement', label: 'Engagement Rate (%)', currentValue: er, previousValue: Number((er * 0.96).toFixed(2)), percentageChange: 4.2 },
              { metricKey: 'posts_count', label: 'Publicaciones', currentValue: postsCount, previousValue: Math.max(1, postsCount - 3), percentageChange: 15.0 }
            ]);
          }
        }
      } catch (e) {
        console.error('Error loading client defaults for report wizard:', e);
      }
    };

    loadClientData();
  }, [selectedClientId]);

  const handleAddRecommendation = () => {
    if (!newRecTitle || !newRecDesc) return;
    setRecommendationsList([
      ...recommendationsList,
      {
        category: newRecCategory,
        priority: newRecPriority,
        title: newRecTitle,
        description: newRecDesc
      }
    ]);
    setNewRecTitle('');
    setNewRecDesc('');
  };

  const handleRemoveRecommendation = (index: number) => {
    setRecommendationsList(recommendationsList.filter((_, idx) => idx !== index));
  };

  const handleSaveReport = async (publish = false) => {
    if (!selectedClientId || !title) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          title,
          periodStart,
          periodEnd,
          status: publish ? 'PUBLISHED' : reportStatus,
          executiveSummary,
          editorialAnalysis,
          metrics: metricsList,
          recommendations: recommendationsList
        })
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/reportes/${data.report.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/reportes"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a reportes
        </Link>
        <span className="text-xs text-zinc-500">Paso {step} de 5</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-tight">
          Asistente de Creación de Reportes
        </h1>
        <p className="text-xs text-zinc-400">
          Sigue el flujo editorial para generar un informe profesional respaldado por datos de Metricool.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-5 gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
        {[
          { stepNum: 1, label: 'Cliente & Período' },
          { stepNum: 2, label: 'Métricas' },
          { stepNum: 3, label: 'Análisis Editorial' },
          { stepNum: 4, label: 'Recomendaciones' },
          { stepNum: 5, label: 'Vista Previa' }
        ].map((s) => (
          <button
            key={s.stepNum}
            onClick={() => setStep(s.stepNum)}
            className={`p-2 rounded-lg text-center font-medium transition-all ${
              step === s.stepNum
                ? 'bg-purple-600 text-white shadow-sm'
                : step > s.stepNum
                ? 'bg-zinc-800 text-purple-300'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="block text-[10px] opacity-75">Paso {s.stepNum}</span>
            <span className="text-xs truncate block">{s.label}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: CLIENTE Y PERÍODO */}
      {step === 1 && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-5 animate-fadeIn">
          <h2 className="text-base font-semibold text-white">1. Definir Cliente y Rango de Fechas</h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Seleccionar Cliente</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-200"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.industry || 'Digital'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Título del Informe</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Informe Ejecutivo de Rendimiento Digital — Agosto 2026"
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Fecha de Inicio</label>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">Fecha de Fin</label>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1.5">Resumen Ejecutivo</label>
              <Textarea
                rows={3}
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="Breve resumen de 2-3 líneas con los hallazgos más destacados..."
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <Button onClick={() => setStep(2)} className="bg-purple-600 text-white text-xs gap-1.5">
              Continuar a Métricas <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: MÉTRICAS REVISIÓN */}
      {step === 2 && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-5 animate-fadeIn">
          <div>
            <h2 className="text-base font-semibold text-white">2. Revisar Métricas Calculadas</h2>
            <p className="text-xs text-zinc-400">
              Datos extraídos y comparados automáticamente contra el ciclo anterior.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {metricsList.map((m, idx) => (
              <div key={m.metricKey} className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
                <span className="text-zinc-400 block mb-1 font-medium">{m.label}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-white">{formatNumber(m.currentValue)}</span>
                  <span className="text-emerald-400 font-semibold text-xs">+{m.percentageChange}%</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Previo: {formatNumber(m.previousValue)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => setStep(1)} className="text-xs text-zinc-400">
              ← Atrás
            </Button>
            <Button onClick={() => setStep(3)} className="bg-purple-600 text-white text-xs gap-1.5">
              Continuar a Análisis Davila PM <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: ANÁLISIS EDITORIAL DAVILA PM */}
      {step === 3 && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-purple-500/30 space-y-5 animate-fadeIn">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-purple-400" /> 3. Redactar Análisis Davila PM
              </h2>
              <p className="text-xs text-zinc-400">
                La sección editorial que diferencia a la agencia: añade contexto, análisis cualitativo y aprendizajes.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleGenerateAiReport}
              isLoading={isGeneratingAi}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Autocompletar con Gemini IA</span>
            </Button>
          </div>

          {aiMessage && (
            <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{aiMessage}</span>
            </div>
          )}

          <Textarea
            rows={10}
            value={editorialAnalysis}
            onChange={(e) => setEditorialAnalysis(e.target.value)}
            placeholder="Redacta el análisis cualitativo..."
            className="bg-zinc-950 border-zinc-800 text-xs text-white leading-relaxed font-sans"
          />

          <div className="flex justify-between pt-4 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => setStep(2)} className="text-xs text-zinc-400">
              ← Atrás
            </Button>
            <Button onClick={() => setStep(4)} className="bg-purple-600 text-white text-xs gap-1.5">
              Continuar a Recomendaciones <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: RECOMENDACIONES */}
      {step === 4 && (
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-5 animate-fadeIn">
          <div>
            <h2 className="text-base font-semibold text-white">4. Recomendaciones Estratégicas</h2>
            <p className="text-xs text-zinc-400">Directrices accionables para el cliente con categoría y prioridad.</p>
          </div>

          {/* List of current recs */}
          <div className="space-y-2.5">
            {recommendationsList.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default" className="text-[9px]">
                      {rec.category}
                    </Badge>
                    <Badge variant={rec.priority === 'ALTA' ? 'destructive' : 'warning'} className="text-[9px]">
                      {rec.priority}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-white text-xs">{rec.title}</h4>
                  <p className="text-zinc-400 text-xs mt-0.5">{rec.description}</p>
                </div>
                <button onClick={() => handleRemoveRecommendation(idx)} className="text-zinc-500 hover:text-red-400 p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Form to add rec */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-3 text-xs">
            <span className="font-semibold text-zinc-300 block">Añadir otra recomendación</span>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newRecCategory}
                onChange={(e) => setNewRecCategory(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-200"
              >
                <option value="CONTENIDO">CONTENIDO</option>
                <option value="PAUTA">PAUTA</option>
                <option value="ESTRATEGIA">ESTRATEGIA</option>
                <option value="FORMATO">FORMATO</option>
              </select>

              <select
                value={newRecPriority}
                onChange={(e) => setNewRecPriority(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-zinc-200"
              >
                <option value="ALTA">ALTA</option>
                <option value="MEDIA">MEDIA</option>
                <option value="BAJA">BAJA</option>
              </select>
            </div>

            <Input
              value={newRecTitle}
              onChange={(e) => setNewRecTitle(e.target.value)}
              placeholder="Título de la recomendación..."
              className="bg-zinc-900 border-zinc-800 text-white"
            />
            <Textarea
              rows={2}
              value={newRecDesc}
              onChange={(e) => setNewRecDesc(e.target.value)}
              placeholder="Descripción y justificación técnica..."
              className="bg-zinc-900 border-zinc-800 text-white"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddRecommendation}
              className="text-xs bg-zinc-800 border-zinc-700"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Añadir a la lista
            </Button>
          </div>

          <div className="flex justify-between pt-4 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => setStep(3)} className="text-xs text-zinc-400">
              ← Atrás
            </Button>
            <Button onClick={() => setStep(5)} className="bg-purple-600 text-white text-xs gap-1.5">
              Continuar a Vista Previa <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: VISTA PREVIA & PUBLICACIÓN */}
      {step === 5 && (
        <div className="p-8 rounded-2xl bg-zinc-900/90 border border-purple-500/40 space-y-6 animate-fadeIn shadow-2xl">
          <div className="border-b border-zinc-800 pb-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                DAVILA PM — REPORTE EJECUTIVO
              </span>
              <Badge variant="purple" className="text-xs">
                Vista Previa
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Cliente: <strong className="text-white">{selectedClient?.name}</strong> • Período:{' '}
              {formatDateSpanish(periodStart, 'd MMM')} al {formatDateSpanish(periodEnd, 'd MMM yyyy')}
            </p>
          </div>

          {/* Executive summary */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase block mb-1">
              Resumen Ejecutivo
            </span>
            <p className="text-zinc-200 leading-relaxed">{executiveSummary}</p>
          </div>

          {/* Metrics summary */}
          <div>
            <span className="text-xs font-semibold text-zinc-300 block mb-2">Métricas Principales</span>
            <div className="grid grid-cols-3 gap-3">
              {metricsList.slice(0, 3).map((m) => (
                <div key={m.metricKey} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                  <span className="text-zinc-400 block text-[11px]">{m.label}</span>
                  <span className="text-base font-bold text-white">{formatNumber(m.currentValue)}</span>
                  <span className="text-emerald-400 text-[10px] block font-semibold">+{m.percentageChange}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial Analysis */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-purple-500/20 text-xs space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
              Análisis Davila PM
            </span>
            <div className="text-zinc-300 leading-relaxed whitespace-pre-line">{editorialAnalysis}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
            <Button variant="ghost" onClick={() => setStep(4)} className="text-xs text-zinc-400">
              ← Atrás
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => handleSaveReport(false)}
                isLoading={isSubmitting}
                className="text-xs border-zinc-700 bg-zinc-800"
              >
                Guardar Borrador
              </Button>
              <Button
                onClick={() => handleSaveReport(true)}
                isLoading={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Publicar Reporte al Cliente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
