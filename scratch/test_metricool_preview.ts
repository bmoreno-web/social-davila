import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;

  // Let's test with saveExternalMediaFiles: true and an image URL
  const imgUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80';

  const payload = {
    blogId,
    userId,
    text: 'Prueba de vista previa con saveExternalMediaFiles true',
    publicationDate: {
      dateTime: '2026-09-05T15:00:00',
      timezone: 'America/Bogota'
    },
    providers: [
      { network: 'instagram' },
      { network: 'facebook' }
    ],
    media: [imgUrl],
    autoPublish: true,
    saveExternalMediaFiles: true,
    draft: true
  };

  const res = await fetch(`${BASE_URL}/v2/scheduler/posts?blogId=${blogId}&userId=${userId}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Mc-Auth': API_KEY
    },
    body: JSON.stringify(payload)
  });

  console.log(`Status: ${res.status}`);
  const text = await res.text();
  console.log(`Response: ${text}`);

  if (res.status === 200) {
    const d = JSON.parse(text);
    console.log('Saved media on Metricool CDN:', d.data?.media);
    // Cleanup
    if (d.data?.id) {
      await fetch(`${BASE_URL}/v2/scheduler/posts/${d.data.id}?blogId=${blogId}&userId=${userId}`, {
        method: 'DELETE',
        headers: { 'X-Mc-Auth': API_KEY }
      });
    }
  }
}

main();
