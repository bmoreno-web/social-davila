'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  GitCompare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  Sparkles,
  Building2,
  Trash2,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDateSpanish } from '@/lib/utils';

export default function ReportesGlobalPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reportsRes, clientsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/clients')
      ]);
      const reportsData = await reportsRes.json();
      const clientsData = await clientsRes.json();

      if (reportsData.reports) setReports(reportsData.reports);
      if (clientsData.clients) setClients(clientsData.clients);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteReport = async (reportId: string, title: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el informe "${title}"?`)) {
      return;
    }

    setDeletingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        alert('No se pudo eliminar el reporte.');
      }
    } catch (e) {
      console.error('Error deleting report:', e);
      alert('Error de conexión al eliminar el reporte.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesClient = selectedClientId === 'ALL' || r.clientId === selectedClientId;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    const clientName = r.client?.name || '';
    const reportTitle = r.title || '';
    const matchesSearch =
      reportTitle.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase());
    return matchesClient && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display tracking-tight">
            Gestión de Reportes Editoriales
          </h1>
          <p className="text-xs text-zinc-400">
            Crea, revisa, edita, aprueba y publica informes mensuales de rendimiento para tus clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/reportes/comparar">
            <Button variant="glass" className="text-xs border-zinc-700/80 gap-1.5">
              <GitCompare className="h-4 w-4 text-purple-400" /> Comparar Reportes
            </Button>
          </Link>

          <Link href="/reportes/nuevo">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-md shadow-purple-600/20">
              <Plus className="h-4 w-4" /> Crear Reporte
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Buscar reporte por título o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-950/70 border-zinc-800 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Todos los Clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="IN_REVIEW">En Revisión</option>
              <option value="APPROVED">Aprobado</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-zinc-400">
          <span className="font-semibold text-white">{filteredReports.length}</span> informes encontrados
        </div>
      </div>

      {/* Reports Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <FileText className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No se encontraron reportes</h3>
          <p className="text-xs text-zinc-500 mt-1">Genera tu primer informe mensual para un cliente.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider text-[10px]">
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Título del Reporte</th>
                <th className="p-4 font-semibold">Período</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold">Responsable</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="p-4 font-semibold text-white flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] overflow-hidden shrink-0">
                      {report.client?.logo ? (
                        <img src={report.client.logo} alt={report.client?.name || 'Cliente'} className="h-full w-full object-cover" />
                      ) : (
                        (report.client?.name || 'DA').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span>{report.client?.name || 'Cliente Davila PM'}</span>
                  </td>
                  <td className="p-4 font-medium text-zinc-200">{report.title}</td>
                  <td className="p-4 text-zinc-400">
                    {formatDateSpanish(report.periodStart, "d MMM")} - {formatDateSpanish(report.periodEnd, "d MMM yyyy")}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        report.status === 'PUBLISHED'
                          ? 'success'
                          : report.status === 'IN_REVIEW'
                          ? 'warning'
                          : report.status === 'APPROVED'
                          ? 'purple'
                          : 'default'
                      }
                      className="text-[10px]"
                    >
                      {report.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-zinc-400">{report.creator?.name || 'Equipo Davila'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/reportes/${report.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-400 hover:text-purple-300 gap-1 px-2.5">
                          <Edit3 className="h-3 w-3" /> Ver / Editar
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleDeleteReport(report.id, report.title)}
                        disabled={deletingId === report.id}
                        title="Eliminar Reporte"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className={`h-3.5 w-3.5 ${deletingId === report.id ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
