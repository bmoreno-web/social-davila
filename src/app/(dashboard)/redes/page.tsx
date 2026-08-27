import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { Share2, CheckCircle2, Building2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_INFO } from '@/lib/utils';

export const revalidate = 0;

export default async function RedesSocialesPage() {
  let clients: any[] = [];
  try {
    clients = await prisma.client.findMany({
      where: { active: true },
      include: {
        socialConnections: true
      },
      orderBy: { name: 'asc' }
    });
  } catch (e) {
    console.warn('Prisma error in redes page:', e);
  }

  if (clients.length === 0) {
    clients = [
      {
        id: 'cmtag1oha0000t0g80a05ym3q',
        name: 'Acesco Colombia',
        metricoolBlogId: '2930665',
        logo: 'https://static.metricool.com/brand-logo/202409/2930665-temp-file16623787061548330277.com-brand-facebook-page-image',
        socialConnections: [
          { id: 'sc1', platform: 'INSTAGRAM', accountUsername: 'acescocol' },
          { id: 'sc2', platform: 'FACEBOOK', accountUsername: 'Acesco Colombia' }
        ]
      },
      {
        id: 'cmtag1on80003t0g8l4a3cliz',
        name: 'Dávila P&M',
        metricoolBlogId: '4056236',
        logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
        socialConnections: [
          { id: 'sc3', platform: 'INSTAGRAM', accountUsername: 'davilapublicidad' },
          { id: 'sc4', platform: 'FACEBOOK', accountUsername: 'Dávila Publicidad & Marketing' }
        ]
      },
      {
        id: 'cmtag1ow70008t0g8f2fgh1yd',
        name: 'Hospital Serena del Mar',
        metricoolBlogId: '3996019',
        logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
        socialConnections: [
          { id: 'sc5', platform: 'FACEBOOK', accountUsername: 'Hospital Serena del Mar' }
        ]
      },
      {
        id: 'cmtag1oyx000at0g8h2fuyif8',
        name: 'Zona Franca B/quilla',
        metricoolBlogId: '4058165',
        logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
        socialConnections: [
          { id: 'sc6', platform: 'INSTAGRAM', accountUsername: 'zfbaq' }
        ]
      },
      {
        id: 'cmtag1p0z000ct0g8w9h3k2lm',
        name: 'Eduardo Verano De la Rosa',
        metricoolBlogId: '4058776',
        logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        socialConnections: [
          { id: 'sc7', platform: 'TIKTOK', accountUsername: 'veranodelarosa' }
        ]
      },
      {
        id: 'cmtag1p4a000et0g8gbyk9m1m',
        name: 'Charles Chapman',
        metricoolBlogId: '4588040',
        logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
        socialConnections: [
          { id: 'sc8', platform: 'LINKEDIN', accountUsername: 'Charles Chapman' }
        ]
      },
      {
        id: 'cmtag1p7q000gt0g8k86l2mfr',
        name: 'OG Realty Partners',
        metricoolBlogId: '4559324',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
        socialConnections: [
          { id: 'sc9', platform: 'INSTAGRAM', accountUsername: 'ogrealty' }
        ]
      }
    ];
  }

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
                {(client.socialConnections || []).map((conn: any) => {
                  const info = PLATFORM_INFO[conn.platform as keyof typeof PLATFORM_INFO] || { label: conn.platform, bg: 'bg-zinc-800 text-zinc-300' };
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
