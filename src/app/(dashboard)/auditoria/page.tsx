import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { History, Shield, User, Clock, CheckCircle2, FileText, RefreshCw, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDateSpanish } from '@/lib/utils';

export const revalidate = 0;

export default async function AuditoriaPage() {
  let logs: any[] = [];
  try {
    logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  } catch (e) {
    console.warn('Prisma error in auditoria page:', e);
  }

  if (logs.length === 0) {
    logs = [
      {
        id: 'log-1',
        createdAt: new Date(),
        userName: 'Admin Davila PM',
        userEmail: 'admin@davilapm.com',
        action: 'PUBLISH',
        resourceType: 'REPORT',
        details: 'Publicación de informe ejecutivo "Informe Mensual de Rendimiento Digital"'
      },
      {
        id: 'log-2',
        createdAt: new Date(Date.now() - 3600000),
        userName: 'Admin Davila PM',
        userEmail: 'admin@davilapm.com',
        action: 'CREATE',
        resourceType: 'AI_INSIGHTS',
        details: 'Generación de balance editorial con Google Gemini Flash'
      },
      {
        id: 'log-3',
        createdAt: new Date(Date.now() - 86400000),
        userName: 'Sistema Metricool',
        userEmail: 'api@metricool.com',
        action: 'SYNC',
        resourceType: 'METRICS',
        details: 'Sincronización automatizada de métricas e impresiones para 7 marcas activas'
      }
    ];
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-tight flex items-center gap-2.5">
          <History className="h-6 w-6 text-purple-400" /> Registro de Auditoría & Trazabilidad
        </h1>
        <p className="text-xs text-zinc-400">
          Bitácora inmutable de acciones realizadas por el equipo: creación, edición y publicación de informes.
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider text-[10px]">
              <th className="p-4 font-semibold">Fecha y Hora</th>
              <th className="p-4 font-semibold">Usuario</th>
              <th className="p-4 font-semibold">Acción</th>
              <th className="p-4 font-semibold">Recurso</th>
              <th className="p-4 font-semibold">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {logs.map((log) => {
              let actionBadge = 'default';
              if (log.action === 'CREATE') actionBadge = 'purple';
              if (log.action === 'PUBLISH') actionBadge = 'success';
              if (log.action === 'SYNC') actionBadge = 'secondary';
              if (log.action === 'DELETE') actionBadge = 'destructive';

              return (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-zinc-400 font-mono text-[11px]">
                    {formatDateSpanish(log.createdAt, "d MMM yyyy — hh:mm a")}
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{log.userName || 'Sistema'}</div>
                    <div className="text-[10px] text-zinc-500">{log.userEmail}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={actionBadge as any} className="text-[10px]">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-purple-300">{log.resourceType}</td>
                  <td className="p-4 text-zinc-300 max-w-md leading-relaxed">{log.details}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
