import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;

  const payload = {
    blogId,
    userId,
    text: 'Prueba de publicacion con imagen programada desde Davila PM Social Suite',
    publicationDate: {
      dateTime: '2026-09-02T16:30:00',
      timezone: 'America/Bogota'
    },
    providers: [
      { network: 'facebook' },
      { network: 'instagram' }
    ],
    media: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
    ],
    autoPublish: true,
    saveExternalMediaFiles: true,
    draft: false
  };

  console.log('Testing scheduler with image payload...');
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
}

main();
