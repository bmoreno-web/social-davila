import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Share2, CheckCircle2, Building2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_INFO } from '@/lib/utils';

export const revalidate = 0;

export default async function RedesSocialesPage() {
  const clients = await prisma.client.findMany({
    where: { active: true },
    include: {
      socialConnections: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white font-display tracking-tight flex items-center gap-2.5">
          <Share2 className="h-6 w-6 text-purple-400" /> Redes Sociales Conectadas
        </h1>
        <p className="text-xs text-zinc-400">
          Matriz de canales y perfiles oficiales vinculados mediante la API de Metricool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                  {client.logo ? (
                    <img src={client.logo} alt={client.name} className="h-full w-full object-cover" />
                  ) : (
                    client.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{client.name}</h3>
                  <p className="text-[11px] text-zinc-500 font-mono">ID: {client.metricoolBlogId || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                {client.socialConnections.map((conn) => {
                  const info = PLATFORM_INFO[conn.platform] || { label: conn.platform, bg: 'bg-zinc-800 text-zinc-300' };
                  return (
                    <div
                      key={conn.id}
                      className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${info.bg}`}>
                          {info.label}
                        </span>
                        <span className="text-zinc-200 font-medium font-mono text-[11px]">
                          @{conn.accountUsername}
                        </span>
                      </div>
                      <Badge variant="success" className="text-[9px] h-4">
                        Conectado
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
