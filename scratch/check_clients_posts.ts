import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const clients = await prisma.client.findMany({
    include: {
      contentPosts: true,
      socialConnections: true
    }
  });

  console.log(`Found ${clients.length} clients in database:`);
  for (const c of clients) {
    console.log(`- ${c.name} (${c.slug}, ID: ${c.id}, Metricool BlogId: ${c.metricoolBlogId}): ${c.contentPosts.length} content posts`);
  }
}

check().then(() => prisma.$disconnect());
