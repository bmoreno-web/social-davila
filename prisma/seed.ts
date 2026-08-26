import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding DAVILA PM SOCIAL Database ---');

  // 1. Clear existing data if any
  await prisma.auditLog.deleteMany();
  await prisma.syncLog.deleteMany();
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

  const acescoClient = createdClients[0];
  const davilaClient = createdClients[1];

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

  // 4. Create Sample Posts for Acesco
  const postImages = [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&auto=format&fit=crop&q=80'
  ];

  await prisma.reportPost.createMany({
    data: [
      {
        clientId: acescoClient.id,
        platform: 'INSTAGRAM',
        externalPostId: 'ig-acesco-1',
        publishedAt: new Date(Date.now() - 4 * 86400000),
        mediaUrl: postImages[0],
        thumbnailUrl: postImages[0],
        caption: '¡Seguimos transformando la infraestructura del país! 🏗️🔩 Conoce nuestra nueva línea de perfiles estructurales de alta resistencia y durabilidad.',
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
      {
        clientId: acescoClient.id,
        platform: 'INSTAGRAM',
        externalPostId: 'ig-acesco-2',
        publishedAt: new Date(Date.now() - 9 * 86400000),
        mediaUrl: postImages[1],
        thumbnailUrl: postImages[1],
        caption: 'Innovación que protege: Descubre cómo la Teja Toledo combina diseño arquitectónico colonial con frescura térmica superior.',
        postType: 'carousel',
        likes: 1250,
        comments: 64,
        shares: 115,
        saves: 182,
        reach: 22600,
        impressions: 28400,
        engagementRate: 7.12,
        permalink: 'https://instagram.com/acescocol'
      },
      {
        clientId: acescoClient.id,
        platform: 'FACEBOOK',
        externalPostId: 'fb-acesco-1',
        publishedAt: new Date(Date.now() - 14 * 86400000),
        mediaUrl: postImages[2],
        thumbnailUrl: postImages[2],
        caption: 'Consejos técnicos de instalación para contratistas y maestros de obra. Asegura máxima garantía en tus proyectos.',
        postType: 'video',
        likes: 920,
        comments: 48,
        shares: 160,
        saves: 85,
        reach: 18900,
        impressions: 23100,
        engagementRate: 6.42,
        permalink: 'https://facebook.com/104754815752767'
      },
      {
        clientId: acescoClient.id,
        platform: 'INSTAGRAM',
        externalPostId: 'ig-acesco-3',
        publishedAt: new Date(Date.now() - 20 * 86400000),
        mediaUrl: postImages[3],
        thumbnailUrl: postImages[3],
        caption: 'Orgullo por el talento y la ingeniería colombiana. Cada obra construida con Acesco es testimonio de compromiso y calidad.',
        postType: 'image',
        likes: 740,
        comments: 29,
        shares: 55,
        saves: 98,
        reach: 14200,
        impressions: 17500,
        engagementRate: 6.49,
        permalink: 'https://instagram.com/acescocol'
      }
    ]
  });

  // 5. Create Monthly Report for Acesco Colombia
  const reportAcesco = await prisma.report.create({
    data: {
      clientId: acescoClient.id,
      title: 'Informe Ejecutivo de Rendimiento Digital — Agosto 2026',
      periodStart: new Date('2026-08-01T00:00:00Z'),
      periodEnd: new Date('2026-08-26T23:59:59Z'),
      status: 'PUBLISHED',
      createdById: adminUser.id,
      publishedAt: new Date(),
      executiveSummary: 'Durante el ciclo de agosto se consolidó un incremento del 24.8% en alcance orgánico neto y una optimización del engagement rate que alcanzó 6.8%. Los formatos de video corto (Reels) generaron más del 52% del total de interacciones del mes.',
      editorialAnalysis: `### Balance Estratégico Davila PM — Agosto 2026

Durante el período evaluado, la presencia digital de **Acesco Colombia** experimentó una aceleración notable en sus indicadores de comunidad y relevancia de marca:

1. **Eficiencia en Contenido Audiovisual**: La serie de videos enfocados en demostraciones de producto (especialmente la cobertura de Teja Toledo y perfiles estructurales) demostró la mayor retención de audiencia (+38% vs promedio del sector).
2. **Interacción Cualitativa**: Se registró un aumento significativo en comentarios orientados a cotizaciones y puntos de distribución, evidenciando que el canal social está cumpliendo un rol directo en la consideración comercial.
3. **Equilibrio de Redes**: Instagram se mantiene como el canal de mayor dinamismo visual y conversión de interacción, mientras que Facebook sostiene el volumen de alcance en audiencias técnicas y regionales de constructores.`,
      metrics: {
        create: [
          { platform: 'ALL', metricKey: 'followers', currentValue: 38450, previousValue: 36200, percentageChange: 6.2 },
          { platform: 'ALL', metricKey: 'reach', currentValue: 184500, previousValue: 147800, percentageChange: 24.8 },
          { platform: 'ALL', metricKey: 'impressions', currentValue: 246000, previousValue: 198000, percentageChange: 24.2 },
          { platform: 'ALL', metricKey: 'interactions', currentValue: 12580, previousValue: 9800, percentageChange: 28.4 },
          { platform: 'ALL', metricKey: 'engagement', currentValue: 6.82, previousValue: 6.63, percentageChange: 2.9 },
          { platform: 'ALL', metricKey: 'posts_count', currentValue: 22, previousValue: 18, percentageChange: 22.2 }
        ]
      },
      recommendations: {
        create: [
          {
            clientId: acescoClient.id,
            category: 'CONTENIDO',
            priority: 'ALTA',
            title: 'Incrementar frecuencia de Reels técnicos en obra',
            description: 'Producir cápsulas de 20-30 segundos donde instaladores certificados muestren la rapidez y seguridad del armado en proyectos reales.',
            status: 'EN_PROGRESO',
            order: 1
          },
          {
            clientId: acescoClient.id,
            category: 'ESTRATEGIA',
            priority: 'ALTA',
            title: 'Campañas de retargeting a distribuidores oficiales',
            description: 'Vincular llamadas a la acción con enlaces dinámicos por ciudad al mapa de distribuidores autorizados en www.acesco.com.co.',
            status: 'PENDIENTE',
            order: 2
          },
          {
            clientId: acescoClient.id,
            category: 'FORMATO',
            priority: 'MEDIA',
            title: 'Carrouseles educativos de especificaciones técnicas',
            description: 'Diseñar infografías visuales de resistencia climática y durabilidad para arquitectos y diseñadores estructurales.',
            status: 'PENDIENTE',
            order: 3
          }
        ]
      }
    }
  });

  // 6. Create July 2026 historical report for comparison
  await prisma.report.create({
    data: {
      clientId: acescoClient.id,
      title: 'Informe Ejecutivo de Rendimiento Digital — Julio 2026',
      periodStart: new Date('2026-07-01T00:00:00Z'),
      periodEnd: new Date('2026-07-31T23:59:59Z'),
      status: 'ARCHIVED',
      createdById: adminUser.id,
      publishedAt: new Date('2026-08-01T12:00:00Z'),
      executiveSummary: 'Julio representó el relanzamiento de la estrategia de contenido con foco en durabilidad y catálogo.',
      editorialAnalysis: 'Consolidación de las bases de audiencia y adecuación de línea gráfica editorial Davila PM.',
      metrics: {
        create: [
          { platform: 'ALL', metricKey: 'followers', currentValue: 36200, previousValue: 34900, percentageChange: 3.7 },
          { platform: 'ALL', metricKey: 'reach', currentValue: 147800, previousValue: 132000, percentageChange: 12.0 },
          { platform: 'ALL', metricKey: 'impressions', currentValue: 198000, previousValue: 175000, percentageChange: 13.1 },
          { platform: 'ALL', metricKey: 'interactions', currentValue: 9800, previousValue: 8400, percentageChange: 16.7 },
          { platform: 'ALL', metricKey: 'engagement', currentValue: 6.63, previousValue: 6.36, percentageChange: 4.2 },
          { platform: 'ALL', metricKey: 'posts_count', currentValue: 18, previousValue: 16, percentageChange: 12.5 }
        ]
      }
    }
  });

  // 7. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      userEmail: adminUser.email,
      action: 'INITIALIZE',
      resourceType: 'SYSTEM',
      details: 'Inicialización de base de datos y sincronización de 7 marcas Metricool para Davila PM Social.'
    }
  });

  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
