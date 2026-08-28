import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;

  // Let's test with saveExternalMediaFiles: false vs true
  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const testPayloads = [
    {
      name: 'No saveExternalMediaFiles',
      payload: {
        blogId,
        userId,
        text: 'Reel de prueba',
        publicationDate: { dateTime: '2026-09-04T16:00:00', timezone: 'America/Bogota' },
        providers: [{ network: 'instagram' }],
        media: [videoUrl],
        draft: true
      }
    },
    {
      name: 'With instagramData reel type',
      payload: {
        blogId,
        userId,
        text: 'Reel de prueba',
        publicationDate: { dateTime: '2026-09-04T16:00:00', timezone: 'America/Bogota' },
        providers: [{ network: 'instagram' }],
        media: [videoUrl],
        instagramData: { type: 'REEL' },
        draft: true
      }
    }
  ];

  for (const t of testPayloads) {
    console.log(`\nTesting ${t.name}...`);
    const res = await fetch(`${BASE_URL}/v2/scheduler/posts?blogId=${blogId}&userId=${userId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Mc-Auth': API_KEY
      },
      body: JSON.stringify(t.payload)
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
    if (res.status === 200) {
      const d = JSON.parse(text);
      if (d.data?.id) {
        await fetch(`${BASE_URL}/v2/scheduler/posts/${d.data.id}?blogId=${blogId}&userId=${userId}`, {
          method: 'DELETE',
          headers: { 'X-Mc-Auth': API_KEY }
        });
      }
    }
  }
}

main();
