import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding DAVILA PM SOCIAL Database ---');

  // 1. Clear existing data if any
  await prisma.auditLog.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.contentComment.deleteMany();
  await prisma.contentPost.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.reportMetric.deleteMany();
  await prisma.reportPost.deleteMany();
  await prisma.report.deleteMany();
  await prisma.socialConnection.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();

  const passwordHash = await bcrypt.hash('davila2026!', 10);

  // 2. Create Davila PM agency clients (based on real Metricool profiles discovered)
  const initialBrands = [
    {
      name: 'Acesco Colombia',
      slug: 'acesco-colombia',
      industry: 'Construcción e Ingeniería',
      contactName: 'Carlos Mendoza',
      contactEmail: 'cliente@acesco.com',
      metricoolBlogId: '2930665',
      metricoolUserId: '1395490',
      logo: 'https://static.metricool.com/brand-logo/202409/2930665-temp-file16623787061548330277.com-brand-facebook-page-image',
      socials: [
        { platform: 'INSTAGRAM', accountUsername: 'acescocol', externalId: 'acescocol' },
        { platform: 'FACEBOOK', accountUsername: 'Acesco Colombia', externalId: '104754815752767' }
      ]
    },
    {
      name: 'Dávila P&M',
      slug: 'davila-pm',
      industry: 'Agencia de Publicidad & Marketing',
      contactName: 'Dirección General',
      contactEmail: 'ddigital@davilaweb.com',
      metricoolBlogId: '4056236',
      metricoolUserId: '1395490',
      logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&auto=format&fit=crop&q=80',
      socials: [
        { platform: 'INSTAGRAM', accountUsername: 'davilapublicidad', externalId: 'davilapublicidad' },
        { platform: 'FACEBOOK', accountUsername: 'Dávila Publicidad & Marketing', externalId: '298263086924700' }
      ]
    },
    {
      name: 'Hospital Serena del Mar',
      slug: 'hospital-serena-del-mar',
      industry: 'Salud & Medicina',
      contactName: 'Comunicaciones HSDM',
      contactEmail: 'comms@serenadelmar.com',
      metricoolBlogId: '3996019',
      metricoolUserId: '1395490',
      logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&auto=format&fit=crop&q=80',
      socials: [
        { platform: 'FACEBOOK', accountUsername: 'Hospital Serena del Mar', externalId: '1796253094009092' }
      ]
    },
    {
      name: 'Zona Franca B/quilla',
      slug: 'zona-franca-barranquilla',
      industry: 'Comercio Exterior & Logística',
      contactName: 'Mercadeo ZFB',
      contactEmail: 'mercadeo@zfbaq.com',
      metricoolBlogId: '4058165',
      metricoolUserId: '1395490',
      logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&auto=format&fit=crop&q=80',
      socials: [
        { platform: 'INSTAGRAM', accountUsername: 'zfbaq', externalId: 'zfbaq' }
      ]
    },
    {
      name: 'Eduardo Verano De la Rosa',
      slug: 'eduardo-verano',
      industry: 'Sector Público & Liderazgo',
      contactName: 'Prensa Oficial',
      contactEmail: 'prensa@eduardoverano.com',
      metricoolBlogId: '4058776',
      metricoolUserId: '1395490',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      socials: [
        { platform: 'TIKTOK', accountUsername: 'veranodelarosa', externalId: 'veranodelarosa' }
      ]
    },
    {
      name: 'Charles Chapman',
      slug: 'charles-chapman',
      industry: 'Legal & Corporativo',
      contactName: 'Charles Chapman',
      contactEmail: 'contacto@chapman.com',
      metricoolBlogId: '4588040',
      metricoolUserId: '1395490',
      logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
      socials: [
        { platform: 'LINKEDIN', accountUsername: 'Charles Chapman', externalId: 'urn:li:person:SzncoR4PWH' }
      ]
    },
    {
      name: 'OG Realty Partners',
      slug: 'og-realty-partners',
      industry: 'Bienes Raíces & Inversión',
      contactName: 'Gerencia Inmobiliaria',
      contactEmail: 'info@ogrealty.com',
      metricoolBlogId: '4559324',
      metricoolUserId: '1395490',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80',
      socials: [
        { platform: 'INSTAGRAM', accountUsername: 'ogrealty', externalId: 'ogrealty' }
      ]
    }
  ];

  const createdClients: any[] = [];

  for (const b of initialBrands) {
    const client = await prisma.client.create({
      data: {
        name: b.name,
        slug: b.slug,
        industry: b.industry,
        contactName: b.contactName,
        contactEmail: b.contactEmail,
        metricoolBlogId: b.metricoolBlogId,
        metricoolUserId: b.metricoolUserId,
        logo: b.logo,
        lastSyncAt: new Date(),
        socialConnections: {
          create: b.socials.map(s => ({
            platform: s.platform,
            accountUsername: s.accountUsername,
            externalId: s.externalId,
            active: true
          }))
        }
      }
    });
    createdClients.push(client);
    console.log(`Created Client: ${client.name} (Metricool ID: ${client.metricoolBlogId})`);
  }

  const [acescoClient, davilaClient, serenaClient, zfClient, veranoClient, chapmanClient, ogClient] = createdClients;

  // 3. Create Users with RBAC
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador Davila PM',
      email: 'admin@davilapm.com',
      passwordHash,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      active: true
    }
  });

  const teamUser = await prisma.user.create({
    data: {
      name: 'Analista Social Media',
      email: 'team@davilapm.com',
      passwordHash,
      role: 'TEAM',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      active: true
    }
  });

  const clientUser = await prisma.user.create({
    data: {
      name: 'Carlos Mendoza (Acesco)',
      email: 'cliente@acesco.com',
      passwordHash,
      role: 'CLIENT',
      clientId: acescoClient.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      active: true
    }
  });

  console.log('Created Users:');
  console.log(` - ADMIN: admin@davilapm.com (Pass: davila2026!)`);
  console.log(` - TEAM:  team@davilapm.com  (Pass: davila2026!)`);
  console.log(` - CLIENT: cliente@acesco.com (Pass: davila2026!)`);

  // 4. Create Sample Posts for all Brands
  const clientPostsData = [
    // Acesco
    {
      clientId: acescoClient.id,
      platform: 'INSTAGRAM',
      externalPostId: 'ig-acesco-1',
      publishedAt: new Date(Date.now() - 4 * 86400000),
      mediaUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
      caption: '¡Seguimos transformando la infraestructura del país! 🏗️🔩 Conoce nuestra nueva línea de perfiles estructurales de alta resistencia.',
      postType: 'reel',
      likes: 1840,
      comments: 112,
      shares: 240,
      saves: 310,
      reach: 34200,
      impressions: 41800,
      engagementRate: 7.31,
      permalink: 'https://instagram.com/acescocol'
    },
    // Dávila P&M
    {
      clientId: davilaClient.id,
      platform: 'INSTAGRAM',
      externalPostId: 'ig-davila-1',
      publishedAt: new Date(Date.now() - 5 * 86400000),
      mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      caption: 'Detrás de cada gran resultado hay una estrategia creativa basada en datos. 💡🎬 Conoce el proceso de producción en Dávila P&M.',
      postType: 'reel',
      likes: 1350,
      comments: 94,
      shares: 132,
      saves: 215,
      reach: 22800,
      impressions: 31200,
      engagementRate: 7.85,
      permalink: 'https://instagram.com/davilapublicidad'
    },
    // Serena del Mar
    {
      clientId: serenaClient.id,
      platform: 'FACEBOOK',
      externalPostId: 'fb-serena-1',
      publishedAt: new Date(Date.now() - 3 * 86400000),
      mediaUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      caption: 'Voces Médicas: Conoce los avances en cirugía mínimamente invasiva y cardiología integral en Hospital Serena del Mar. 🏥❤️',
      postType: 'reel',
      likes: 1680,
      comments: 138,
      shares: 210,
      saves: 310,
      reach: 34200,
      impressions: 44600,
      engagementRate: 6.83,
      permalink: 'https://facebook.com/1796253094009092'
    },
    // Zona Franca
    {
      clientId: zfClient.id,
      platform: 'INSTAGRAM',
      externalPostId: 'ig-zf-1',
      publishedAt: new Date(Date.now() - 6 * 86400000),
      mediaUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      caption: 'Barranquilla, el hub logístico y portuario del Caribe. 🚢✈️ Conoce las ventajas tributarias y operativas de operar en Zona Franca.',
      postType: 'reel',
      likes: 1180,
      comments: 78,
      shares: 142,
      saves: 180,
      reach: 22400,
      impressions: 29500,
      engagementRate: 7.05,
      permalink: 'https://instagram.com/zfbaq'
    },
    // Eduardo Verano
    {
      clientId: veranoClient.id,
      platform: 'TIKTOK',
      externalPostId: 'tt-verano-1',
      publishedAt: new Date(Date.now() - 2 * 86400000),
      mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      caption: '¡En el territorio cumpliendo con la gente! 🇨🇴 Recorremos las obras de acueducto y vías que transforman el departamento.',
      postType: 'reel',
      likes: 4200,
      comments: 380,
      shares: 560,
      saves: 420,
      reach: 68400,
      impressions: 92100,
      engagementRate: 8.13,
      permalink: 'https://tiktok.com/@veranodelarosa'
    },
    // Charles Chapman
    {
      clientId: chapmanClient.id,
      platform: 'LINKEDIN',
      externalPostId: 'li-chapman-1',
      publishedAt: new Date(Date.now() - 7 * 86400000),
      mediaUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      caption: '¿Cómo impactará la nueva reforma laboral los costos de nómina en las empresas? ⚖️📋 Análisis preventivo de Charles Chapman.',
      postType: 'carousel',
      likes: 1240,
      comments: 115,
      shares: 180,
      saves: 340,
      reach: 24500,
      impressions: 32800,
      engagementRate: 7.65,
      permalink: 'https://linkedin.com'
    },
    // OG Realty Partners
    {
      clientId: ogClient.id,
      platform: 'INSTAGRAM',
      externalPostId: 'ig-og-1',
      publishedAt: new Date(Date.now() - 4 * 86400000),
      mediaUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
      caption: 'Exclusividad y alta valorización en el Caribe. 🌴✨ Recorrido por penthouse de lujo con OG Realty Partners.',
      postType: 'reel',
      likes: 1490,
      comments: 128,
      shares: 195,
      saves: 280,
      reach: 29800,
      impressions: 38400,
      engagementRate: 7.02,
      permalink: 'https://instagram.com'
    }
  ];

  await prisma.reportPost.createMany({
    data: clientPostsData
  });

  // 5. Create Monthly Reports for each client
  const brandReports = [
    {
      client: acescoClient,
      title: 'Informe Ejecutivo de Rendimiento Digital — Agosto 2026',
      summary: 'Incremento del 24.8% en alcance neto y optimización del engagement rate que alcanzó 7.2%.',
      analysis: 'Los formatos de video corto en obra generaron más del 52% de las interacciones totales.',
      followers: 29903,
      reach: 68400,
      engagement: 7.2
    },
    {
      client: davilaClient,
      title: 'Reporte Estratégico de Posicionamiento de Marca — Agosto 2026',
      summary: 'Crecimiento sostenido del 18.5% en visibilidad B2B en LinkedIn e Instagram.',
      analysis: 'Las publicaciones sobre IA aplicada al marketing y metodologías de agencia generaron un alto volumen de guardados por parte de directores de mercadeo.',
      followers: 4690,
      reach: 28700,
      engagement: 6.4
    },
    {
      client: serenaClient,
      title: 'Auditoría de Impacto Asistencial & Confianza Médica — Agosto 2026',
      summary: 'Aumento del 32% en consultas sobre especialidades médicas y citas hospitalarias.',
      analysis: 'La comunidad en Facebook demostró alta receptividad a los contenidos de tecnología médica de punta y cuidado integral.',
      followers: 16800,
      reach: 34200,
      engagement: 5.8
    },
    {
      client: zfClient,
      title: 'Diagnóstico de Atracción de Inversión y Logística — Agosto 2026',
      summary: 'Incremento del 21% en interacciones de empresas exportadoras e importadoras interesadas en el régimen franco.',
      analysis: 'Posicionamiento multicanal en LinkedIn e Instagram consolidando el liderazgo portuario del Caribe.',
      followers: 15804,
      reach: 44700,
      engagement: 5.9
    },
    {
      client: veranoClient,
      title: 'Monitoreo de Impacto Ciudadano & Rendición de Cuentas — Agosto 2026',
      summary: 'Canal de TikTok alcanzando más de 98.4K personas de alcance neto con videos en terreno.',
      analysis: 'La retención promedio superó el 65%, destacando la cercanía y dinamismo en la comunicación institucional.',
      followers: 48900,
      reach: 98400,
      engagement: 8.4
    },
    {
      client: chapmanClient,
      title: 'Informe de Reputación Jurídica Corporativa — Agosto 2026',
      summary: 'Más de 24.5K profesionales y directores de RRHH alcanzados en LinkedIn.',
      analysis: 'El análisis de la reforma laboral posicionó a la firma como referente de consulta jurídica para medianas y grandes empresas.',
      followers: 18400,
      reach: 24500,
      engagement: 6.8
    },
    {
      client: ogClient,
      title: 'Auditoría de Conversión Inmobiliaria Premium — Agosto 2026',
      summary: 'Campaña de video inmersivo generando más de 280 guardados de alto interés de inversión.',
      analysis: 'El portafolio de propiedades de lujo en el Caribe capturó leads cualificados de compradores nacionales y extranjeros.',
      followers: 1450,
      reach: 8900,
      engagement: 5.9
    }
  ];

  for (const br of brandReports) {
    await prisma.report.create({
      data: {
        clientId: br.client.id,
        title: br.title,
        periodStart: new Date('2026-08-01T00:00:00Z'),
        periodEnd: new Date('2026-08-26T23:59:59Z'),
        status: 'PUBLISHED',
        createdById: adminUser.id,
        publishedAt: new Date(),
        executiveSummary: br.summary,
        editorialAnalysis: br.analysis,
        metrics: {
          create: [
            { platform: 'ALL', metricKey: 'followers', currentValue: br.followers, previousValue: Math.round(br.followers * 0.95), percentageChange: 5.2 },
            { platform: 'ALL', metricKey: 'reach', currentValue: br.reach, previousValue: Math.round(br.reach * 0.82), percentageChange: 21.9 },
            { platform: 'ALL', metricKey: 'engagement', currentValue: br.engagement, previousValue: Number((br.engagement - 0.3).toFixed(2)), percentageChange: 4.1 }
          ]
        },
        recommendations: {
          create: [
            {
              clientId: br.client.id,
              category: 'CONTENIDO',
              priority: 'ALTA',
              title: `Estrategia de formatos de alto impacto para ${br.client.name}`,
              description: `Maximizar la producción de formatos audiovisuales cortos orientados a la propuesta de valor de ${br.client.name}.`,
              status: 'EN_PROGRESO',
              order: 1
            },
            {
              clientId: br.client.id,
              category: 'ESTRATEGIA',
              priority: 'ALTA',
              title: `Optimización de canales y retargeting para ${br.client.name}`,
              description: `Segmentar audiencias calificadas en los canales clave para incrementar la conversión.`,
              status: 'PENDIENTE',
              order: 2
            }
          ]
        }
      }
    });
  }

  // 6. Planned Content Posts
  const contentPostsData = [
    {
      clientId: acescoClient.id,
      title: 'Reel: 3 Errores al instalar Cubiertas de Techo',
      copy: '¿Sabías que el 80% de las filtraciones se deben a un mal traslape? ⚠️🔨 En este Reel te mostramos cómo asegurar tus fijaciones paso a paso con láminas Acesco.\n\n#Acesco #ConstruccionSegura #Cubiertas #IngenieriaCivil',
      scheduledDate: new Date('2026-08-29T16:00:00Z'),
      platforms: 'INSTAGRAM,TIKTOK,FACEBOOK',
      contentType: 'REEL',
      mediaUrls: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
      status: 'PENDIENTE_APROBACION',
      tags: 'Educativo, Producto Estrella'
    },
    {
      clientId: davilaClient.id,
      title: 'Reel: Behind The Scenes Campaña Creativa Caribe 2026',
      copy: 'Detrás de cada gran idea hay un equipo apasionado de estrategas, directores creativos y diseñadores. 💡🎨 Conoce el proceso en Davila PM.\n\n#DavilaPM #PublicidadCreativa #MarketingEstrategico',
      scheduledDate: new Date('2026-08-30T15:00:00Z'),
      platforms: 'INSTAGRAM,LINKEDIN',
      contentType: 'REEL',
      mediaUrls: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      status: 'APROBADO',
      approvedAt: new Date('2026-08-28T10:00:00Z'),
      approvedBy: 'Dirección General Davila',
      tags: 'Cultura de Agencia, Branding'
    },
    {
      clientId: serenaClient.id,
      title: 'Reel: Voces Médicas — Avances en Cirugía Robótica',
      copy: 'En el Hospital Serena del Mar contamos con tecnología quirúrgica de vanguardia para procedimientos mínimamente invasivos. 🏥 Conoce la explicación de nuestros cirujanos líderes.\n\n#HospitalSerenaDelMar #MedicinaAvanzada',
      scheduledDate: new Date('2026-08-30T17:00:00Z'),
      platforms: 'FACEBOOK,INSTAGRAM',
      contentType: 'REEL',
      mediaUrls: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      status: 'APROBADO',
      tags: 'Medicina, Tecnologia'
    },
    {
      clientId: zfClient.id,
      title: 'Reel: Barranquilla — El Hub Logístico y Portuario del Caribe',
      copy: 'Ubicación privilegiada, conectividad multimodal y beneficios del régimen franco. Descubre por qué más de 120 multinacionales confían en Zona Franca de Barranquilla. 🚢✈️📦\n\n#ZonaFrancaBarranquilla #LogisticaCaribe',
      scheduledDate: new Date('2026-08-31T16:30:00Z'),
      platforms: 'INSTAGRAM,LINKEDIN,FACEBOOK',
      contentType: 'REEL',
      mediaUrls: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      status: 'APROBADO',
      tags: 'Logistica, Inversion'
    },
    {
      clientId: veranoClient.id,
      title: 'TikTok: En el Territorio — Inauguración del nuevo acueducto',
      copy: '¡Agua potable y dignidad para más familias del Atlántico! 💧👏 Estuvimos en Repelón entregando el nuevo sistema de acueducto veredal.\n\n#AtlánticoParaElMundo #EduardoVerano #ObrasQueTransforman',
      scheduledDate: new Date('2026-08-29T18:00:00Z'),
      platforms: 'TIKTOK',
      contentType: 'REEL',
      mediaUrls: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      status: 'APROBADO',
      tags: 'GestionDepartamental, Territorio'
    },
    {
      clientId: chapmanClient.id,
      title: 'Video: Análisis Express — Implicaciones de la Reforma Laboral en Nómina',
      copy: '¿Cómo impactan los nuevos recargos dominicales y nocturnos la estructura de costos de las medianas y grandes empresas? ⚖️ Breve análisis jurídico de Charles Chapman.\n\n#DerechoLaboral #ChapmanWilches',
      scheduledDate: new Date('2026-08-30T14:00:00Z'),
      platforms: 'LINKEDIN',
      contentType: 'REEL',
      mediaUrls: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=80',
      status: 'APROBADO',
      tags: 'AnalisisJuridico, ReformaLaboral'
    },
    {
      clientId: ogClient.id,
      title: 'Reel: Recorrido Inmersivo Penthouse con Vista al Mar',
      copy: 'Exclusividad, arquitectura de autor y acabados de lujo. 🌊🏢 Conoce este exclusivo penthouse disponible para entrega inmediata en la zona de mayor plusvalía.\n\n#OGRealty #BienesRaicesLujo #RealEstateColombia',
      scheduledDate: new Date('2026-08-31T17:00:00Z'),
      platforms: 'INSTAGRAM',
      contentType: 'REEL',
      mediaUrls: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      status: 'APROBADO',
      tags: 'Inmobiliaria, Luxury'
    }
  ];

  for (const cp of contentPostsData) {
    await prisma.contentPost.create({
      data: cp
    });
  }

  // 7. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      userEmail: adminUser.email,
      action: 'INITIALIZE',
      resourceType: 'SYSTEM',
      details: 'Inicialización de base de datos para todas las marcas de Davila PM.'
    }
  });

  console.log('--- Database seeding completed successfully for ALL brands! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
