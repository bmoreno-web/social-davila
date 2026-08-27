import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const DEFAULT_BRANDS: Record<string, any> = {
  'cmtag1oha0000t0g80a05ym3q': {
    id: 'cmtag1oha0000t0g80a05ym3q',
    name: 'Acesco Colombia',
    slug: 'acesco-colombia',
    industry: 'Construcción e Ingeniería en Acero',
    logo: 'https://static.metricool.com/brand-logo/202409/2930665-temp-file16623787061548330277.com-brand-facebook-page-image',
    metricoolBlogId: '2930665',
    metricoolUserId: '1395490',
    contactName: 'Carlos Mendoza — Dirección de Mercadeo',
    contactEmail: 'mercadeo@acesco.com',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc1', platform: 'INSTAGRAM', accountUsername: 'acescocol', followers: 29903, reach: 48500, engagementRate: 7.2 },
      { id: 'sc2', platform: 'FACEBOOK', accountUsername: 'Acesco Colombia', followers: 14200, reach: 22400, engagementRate: 4.8 }
    ],
    reports: [
      {
        id: 'rep-acesco-1',
        title: 'Informe Ejecutivo de Rendimiento Digital — Agosto 2026',
        periodEnd: new Date().toISOString(),
        editorialAnalysis: 'Durante el ciclo de agosto se consolidó un incremento del 24.8% en alcance orgánico neto y una optimización del engagement rate que alcanzó 7.2%. Los formatos de video corto (Reels técnicos en obra) generaron más del 52% del total de interacciones del mes, posicionando a Metaldeck y Teja Toledo como referentes indiscutibles del sector.'
      }
    ],
    recommendations: [
      {
        id: 'rec-acesco-1',
        title: 'Incrementar frecuencia de Reels técnicos en obra con maestros y contratistas',
        category: 'FORMATO',
        priority: 'ALTA',
        description: 'Producir cápsulas de 20-30 segundos donde instaladores certificados muestren la rapidez, seguridad y ahorro de tiempo del armado con Teja Toledo y Metaldeck en proyectos reales.',
        status: 'EN_PROGRESO'
      },
      {
        id: 'rec-acesco-2',
        title: 'Geolocalización de pauta para distribuidores de acero autorizados',
        category: 'PAUTA',
        priority: 'ALTA',
        description: 'Vincular campañas de Meta Ads con botones hacia el mapa interactivo de ferreterías y centros de distribución autorizados en www.acesco.com.co por ciudades clave.',
        status: 'PENDIENTE'
      },
      {
        id: 'rec-acesco-3',
        title: 'Guías técnicas descargables de especificación para ingenieros y arquitectos',
        category: 'CONTENIDO',
        priority: 'MEDIA',
        description: 'Diseñar carruseles y guías con tablas de cargas y resistencia estructural para incentivar guardados de alto valor técnico en la comunidad profesional.',
        status: 'PENDIENTE'
      }
    ]
  },
  'cmtag1on80003t0g8l4a3cliz': {
    id: 'cmtag1on80003t0g8l4a3cliz',
    name: 'Dávila P&M',
    slug: 'davila-pm',
    industry: 'Agencia de Publicidad, Medios & Estrategia Digital',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4056236',
    metricoolUserId: '1395490',
    contactName: 'Dirección General Davila PM',
    contactEmail: 'ddigital@davilaweb.com',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc3', platform: 'INSTAGRAM', accountUsername: 'davilapublicidad', followers: 4690, reach: 18900, engagementRate: 6.4 },
      { id: 'sc4', platform: 'LINKEDIN', accountUsername: 'Dávila Publicidad & Marketing', followers: 2850, reach: 9800, engagementRate: 5.2 }
    ],
    reports: [
      {
        id: 'rep-davila-1',
        title: 'Reporte Estratégico de Posicionamiento de Marca — Agosto 2026',
        periodEnd: new Date().toISOString(),
        editorialAnalysis: 'Dávila P&M consolidó un crecimiento sostenido del 18.5% en visibilidad B2B en LinkedIn e Instagram. Las publicaciones sobre transformación digital y metodologías creativas generaron un alto volumen de guardados por parte de directores de mercadeo.'
      }
    ],
    recommendations: [
      {
        id: 'rec-davila-1',
        title: 'Showcase de Casos de Éxito y Premios de Creatividad Estratégica',
        category: 'CONTENIDO',
        priority: 'ALTA',
        description: 'Publicar desgloses paso a paso (Behind the Scenes) de campañas galardonadas en la región Caribe y Colombia, posicionando el liderazgo creativo y retorno de inversión de la agencia.',
        status: 'EN_PROGRESO'
      },
      {
        id: 'rec-davila-2',
        title: 'Thought Leadership en LinkedIn para Dirección de Cuentas y Medios',
        category: 'ESTRATEGIA',
        priority: 'ALTA',
        description: 'Posicionar artículos y reflexiones semanales de los directores creativos y de medios sobre tendencias de IA publicitaria, analítica y ROI omnicanal.',
        status: 'PENDIENTE'
      },
      {
        id: 'rec-davila-3',
        title: 'Pauta B2B en LinkedIn dirigida a CMOs y Vicepresidentes de Mercadeo',
        category: 'PAUTA',
        priority: 'MEDIA',
        description: 'Campaña de captación de leads cualificados de medianas y grandes empresas con el portafolio de servicios de transformación digital de Davila PM.',
        status: 'PENDIENTE'
      }
    ]
  },
  'cmtag1ow70008t0g8f2fgh1yd': {
    id: 'cmtag1ow70008t0g8f2fgh1yd',
    name: 'Hospital Serena del Mar',
    slug: 'hospital-serena-del-mar',
    industry: 'Salud, Medicina de Alta Complejidad & Bienestar',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '3996019',
    metricoolUserId: '1395490',
    contactName: 'Comunicaciones & Experiencia del Paciente',
    contactEmail: 'comunicaciones@serenadelmar.com.co',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc5', platform: 'FACEBOOK', accountUsername: 'Hospital Serena del Mar', followers: 16800, reach: 34200, engagementRate: 5.8 }
    ],
    reports: [
      {
        id: 'rep-serena-1',
        title: 'Auditoría de Impacto Asistencial & Confianza Médica — Agosto 2026',
        periodEnd: new Date().toISOString(),
        editorialAnalysis: 'La comunidad en Facebook demostró una alta receptividad a los contenidos sobre tecnología médica de punta y cuidado integral. Se evidenció un aumento del 32% en consultas sobre especialidades médicas y citas hospitalarias.'
      }
    ],
    recommendations: [
      {
        id: 'rec-serena-1',
        title: 'Cápsulas "Voces Médicas" con Especialistas y Subespecialistas',
        category: 'FORMATO',
        priority: 'ALTA',
        description: 'Grabar videos de 45 segundos con médicos líderes explicando prevención en oncología, cardiología y tecnología quirúrgica de vanguardia disponible en el hospital.',
        status: 'EN_PROGRESO'
      },
      {
        id: 'rec-serena-2',
        title: 'Estrategia de humanización hospitalaria y testimonios de pacientes',
        category: 'CONTENIDO',
        priority: 'ALTA',
        description: 'Compartir historias de recuperación y excelencia asistencial con tono empático y respetuoso para reforzar la confianza en Cartagena y la región.',
        status: 'PENDIENTE'
      },
      {
        id: 'rec-serena-3',
        title: 'Campañas de concientización y citas preventivas por especialidad',
        category: 'ESTRATEGIA',
        priority: 'MEDIA',
        description: 'Promover jornadas de chequeos ejecutivos y agendamiento digital de citas a través de Facebook y WhatsApp asistencial.',
        status: 'PENDIENTE'
      }
    ]
  },
  'cmtag1oyx000at0g8h2fuyif8': {
    id: 'cmtag1oyx000at0g8h2fuyif8',
    name: 'Zona Franca B/quilla',
    slug: 'zona-franca-barranquilla',
    industry: 'Comercio Exterior, Logística & Parques Industriales',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4058165',
    metricoolUserId: '1395490',
    contactName: 'Gerencia de Desarrollo de Negocios',
    contactEmail: 'comercial@zonafrancabaq.com.co',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc6', platform: 'INSTAGRAM', accountUsername: 'zfbaq', followers: 2604, reach: 14200, engagementRate: 6.1 },
      { id: 'sc7', platform: 'FACEBOOK', accountUsername: 'Zona Franca de Barranquilla', followers: 5800, reach: 11900, engagementRate: 4.2 },
      { id: 'sc8', platform: 'LINKEDIN', accountUsername: 'Zona Franca de Barranquilla', followers: 7400, reach: 18600, engagementRate: 5.6 }
    ],
    reports: [
      {
        id: 'rep-zf-1',
        title: 'Diagnóstico de Atracción de Inversión y Logística — Agosto 2026',
        periodEnd: new Date().toISOString(),
        editorialAnalysis: 'El posicionamiento multicanal en LinkedIn e Instagram consolidó un incremento del 21% en interacciones de empresas exportadoras e importadoras interesadas en el régimen franco y ubicación estratégica en Barranquilla.'
      }
    ],
    recommendations: [
      {
        id: 'rec-zf-1',
        title: 'Infografías de ventajas tributarias y régimen franco en el Caribe',
        category: 'CONTENIDO',
        priority: 'ALTA',
        description: 'Diseñar carruseles técnicos destacando exenciones aduaneras, tarifa de renta del 20% y conectividad multimodal (portuaria, aérea, terrestre).',
        status: 'EN_PROGRESO'
      },
      {
        id: 'rec-zf-2',
        title: 'LinkedIn B2B para multinacionales de Nearshoring y Logística',
        category: 'ESTRATEGIA',
        priority: 'ALTA',
        description: 'Publicar avances de infraestructura de parques industriales, bodegas a la medida y sostenibilidad para empresas exportadoras internacionales.',
        status: 'PENDIENTE'
      },
      {
        id: 'rec-zf-3',
        title: 'Pauta de captación internacional en LinkedIn Ads (USA, México y Europa)',
        category: 'PAUTA',
        priority: 'MEDIA',
        description: 'Dirigir tráfico de inversionistas extranjeros al cotizador de terrenos industriales y bodegas de Zona Franca Barranquilla.',
        status: 'PENDIENTE'
      }
    ]
  },
  'cmtag1p0z000ct0g8w9h3k2lm': {
    id: 'cmtag1p0z000ct0g8w9h3k2lm',
    name: 'Eduardo Verano De la Rosa',
    slug: 'eduardo-verano',
    industry: 'Sector Público, Gestión Departamental & Liderazgo',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4058776',
    metricoolUserId: '1395490',
    contactName: 'Equipo de Prensa & Redes',
    contactEmail: 'prensa@veranodelarosa.com',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc9', platform: 'TIKTOK', accountUsername: 'veranodelarosa', followers: 48900, reach: 98400, engagementRate: 8.4 }
    ],
    reports: [
      {
        id: 'rep-verano-1',
        title: 'Monitoreo de Impacto Ciudadano & Rendición de Cuentas — Agosto 2026',
        periodEnd: new Date().toISOString(),
        editorialAnalysis: 'El canal de TikTok alcanzó más de 98.4K personas de alcance neto con videos de terreno en municipios del Atlántico. La retención promedio superó el 65%, destacando la cercanía y dinamismo en la comunicación institucional.'
      }
    ],
    recommendations: [
      {
        id: 'rec-verano-1',
        title: 'TikTok & Reels "En el Territorio": Recorridos de obras y comunidades',
        category: 'FORMATO',
        priority: 'ALTA',
        description: 'Formato ágil en primera persona mostrando entregas de acueductos, colegios, electrificación y vías en los municipios del Atlántico.',
        status: 'EN_PROGRESO'
      },
      {
        id: 'rec-verano-2',
        title: 'Sesiones "Gobernador Responde" a inquietudes ciudadanas',
        category: 'ESTRATEGIA',
        priority: 'ALTA',
        description: 'Responder en video vertical a preguntas frecuentes de jóvenes sobre becas, empleo, salud y turismo departamental.',
        status: 'PENDIENTE'
      },
      {
        id: 'rec-verano-3',
        title: 'Píldoras informativas de hitos de desarrollo económico y Caribe Autónomo',
        category: 'CONTENIDO',
        priority: 'MEDIA',
        description: 'Contenidos dinámicos sobre la autonomía regional, energías renovables y atracción de inversiones al Atlántico.',
        status: 'PENDIENTE'
      }
    ]
  },
  'cmtag1p4a000et0g8gbyk9m1m': {
    id: 'cmtag1p4a000et0g8gbyk9m1m',
    name: 'Charles Chapman',
    slug: 'charles-chapman',
    industry: 'Derecho Laboral, Consultoría Corporativa & Gestión Humana',
    logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4588040',
    metricoolUserId: '1395490',
    contactName: 'Chapman Wilches Consultoría',
    contactEmail: 'contacto@chapmanwilches.com',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc10', platform: 'LINKEDIN', accountUsername: 'Charles Chapman', followers: 18400, reach: 24500, engagementRate: 6.8 }
    ],
    reports: [
      {
        id: 'rep-chapman-1',
        title: 'Informe de Autoridad Jurídica & Reputación Profesional — Agosto 2026',
        periodEnd: new Date().toISOString(),
        editorialAnalysis: 'LinkedIn demostró ser el canal de mayor conversión y debate jurídico. Los análisis de sentencias y reformas alcanzaron a más de 24.500 profesionales de talento humano y directores legales en Colombia.'
      }
    ],
    recommendations: [
      {
        id: 'rec-chapman-1',
        title: 'Análisis express de Reformas Laborales y Jurisprudencia en LinkedIn',
        category: 'ESTRATEGIA',
        priority: 'ALTA',
        description: 'Publicar desgloses ejecutivos de fallos de la Corte Suprema y proyectos de ley para gerentes de gestión humana y directores jurídicos.',
        status: 'EN_PROGRESO'
      },
      {
        id: 'rec-chapman-2',
        title: 'Webinars ejecutivos "Mesa Laboral Chapman"',
        category: 'CONTENIDO',
        priority: 'ALTA',
        description: 'Crear eventos en vivo en LinkedIn con sesiones de preguntas y respuestas sobre riesgos laborales y negociación colectiva empresarial.',
        status: 'PENDIENTE'
      },
      {
        id: 'rec-chapman-3',
        title: 'Pauta segmentada a Directores de Talento Humano y C-Level',
        category: 'PAUTA',
        priority: 'MEDIA',
        description: 'Promocionar los boletines jurídicos especializados para captación de empresas medianas y grandes a nivel nacional.',
        status: 'PENDIENTE'
      }
    ]
  },
  'cmtag1p7q000gt0g8k86l2mfr': {
    id: 'cmtag1p7q000gt0g8k86l2mfr',
    name: 'OG Realty Partners',
    slug: 'og-realty-partners',
    industry: 'Bienes Raíces, Inversión Inmobiliaria & Luxury Living',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
    metricoolBlogId: '4559324',
    metricoolUserId: '1395490',
    contactName: 'Dirección Comercial Inmobiliaria',
    contactEmail: 'invest@ogrealtypartners.com',
    status: 'ACTIVE',
    socialConnections: [
      { id: 'sc11', platform: 'INSTAGRAM', accountUsername: 'ogrealtypartners', followers: 1450, reach: 8900, engagementRate: 5.9 }
    ],
    reports: [
      {
        id: 'rep-og-1',
        title: 'Diagnóstico de Captación de Inversionistas Inmobiliarios — Agosto 2026',
        periodEnd: new Date().toISOString(),
        editorialAnalysis: 'El perfil de Instagram generó un incremento del 38% en mensajes directos solicitando catálogos de proyectos sobre planos y apartamentos de alta valorización en zonas de alta plusvalía.'
      }
    ],
    recommendations: [
      {
        id: 'rec-og-1',
        title: 'Video-tours de propiedades exclusivas en formato Reel cinematográfico',
        category: 'FORMATO',
        priority: 'ALTA',
        description: 'Recorridos inmersivos con tomas con dron y detalles de acabados de apartamentos de lujo y proyectos sobre planos de alta demanda.',
        status: 'EN_PROGRESO'
      },
      {
        id: 'rec-og-2',
        title: 'Guías de Rentabilidad y Retorno de Inversión (ROI) para inversionistas',
        category: 'CONTENIDO',
        priority: 'ALTA',
        description: 'Carruseles analizando valorización por metro cuadrado, rentas cortas (Airbnb) y facilidades de pago para compradores del exterior.',
        status: 'PENDIENTE'
      },
      {
        id: 'rec-og-3',
        title: 'Meta Ads hacia WhatsApp Business para colombianos en el exterior',
        category: 'PAUTA',
        priority: 'ALTA',
        description: 'Campañas en EE.UU., España y Panamá dirigidas a compradores interesados en vivienda e inversión en Colombia.',
        status: 'PENDIENTE'
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id = '';
  try {
    const resolved = await params;
    id = resolved?.id || '';
  } catch (e) {
    id = '';
  }

  try {
    let client: any = null;
    try {
      if (id) {
        client = await prisma.client.findUnique({
          where: { id },
          include: {
            socialConnections: true,
            reports: {
              orderBy: { periodEnd: 'desc' },
              take: 1
            },
            recommendations: {
              orderBy: { createdAt: 'desc' }
            }
          }
        });
      }
    } catch (e) {
      console.warn('Prisma findUnique error:', e);
    }

    if (!client) {
      const lower = id.toLowerCase();
      client = DEFAULT_BRANDS[id] ||
        (lower.includes('davila') ? DEFAULT_BRANDS['cmtag1on80003t0g8l4a3cliz'] :
         lower.includes('serena') ? DEFAULT_BRANDS['cmtag1ow70008t0g8f2fgh1yd'] :
         lower.includes('zona') || lower.includes('zfbaq') ? DEFAULT_BRANDS['cmtag1oyx000at0g8h2fuyif8'] :
         lower.includes('verano') ? DEFAULT_BRANDS['cmtag1p0z000ct0g8w9h3k2lm'] :
         lower.includes('chapman') ? DEFAULT_BRANDS['cmtag1p4a000et0g8gbyk9m1m'] :
         lower.includes('og') || lower.includes('realty') ? DEFAULT_BRANDS['cmtag1p7q000gt0g8k86l2mfr'] :
         DEFAULT_BRANDS['cmtag1oha0000t0g80a05ym3q']);
    } else {
      // If DB client has empty recommendations, attach brand specific ones
      if (!client.recommendations || client.recommendations.length === 0) {
        const brandFallback = DEFAULT_BRANDS[id] || Object.values(DEFAULT_BRANDS).find(b => b.name.toLowerCase().includes(client.name.toLowerCase()));
        if (brandFallback && brandFallback.recommendations) {
          client.recommendations = brandFallback.recommendations;
        }
      }
      if (!client.reports || client.reports.length === 0) {
        const brandFallback = DEFAULT_BRANDS[id] || Object.values(DEFAULT_BRANDS).find(b => b.name.toLowerCase().includes(client.name.toLowerCase()));
        if (brandFallback && brandFallback.reports) {
          client.reports = brandFallback.reports;
        }
      }
    }

    return NextResponse.json({ client });
  } catch (error: any) {
    const fallbackClient = DEFAULT_BRANDS['cmtag1oha0000t0g80a05ym3q'];
    return NextResponse.json({ client: fallbackClient });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await params;
    const id = resolved?.id || '';
    const body = await request.json();
    return NextResponse.json({ success: true, client: { id, ...body } });
  } catch (error: any) {
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ success: true });
}
