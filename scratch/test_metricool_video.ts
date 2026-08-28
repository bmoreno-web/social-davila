import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;

  // Let's test scheduling a Reel / Video on Metricool
  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const payload = {
    blogId,
    userId,
    text: 'Prueba de video Reel desde Davila PM Social Suite',
    publicationDate: {
      dateTime: '2026-09-03T17:00:00',
      timezone: 'America/Bogota'
    },
    providers: [
      { network: 'instagram' },
      { network: 'facebook' }
    ],
    media: [videoUrl],
    autoPublish: true,
    saveExternalMediaFiles: true,
    draft: true,
    instagramData: {
      autoPublish: true,
      reel: true
    }
  };

  console.log('Testing scheduler with MP4 video URL...');
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

  // Also test Metricool media upload endpoint /v2/media or /v2/scheduler/media if any
  try {
    const mediaRes = await fetch(`${BASE_URL}/v2/media?blogId=${blogId}&userId=${userId}`, {
      headers: { 'Accept': 'application/json', 'X-Mc-Auth': API_KEY }
    });
    console.log(`GET /v2/media status: ${mediaRes.status}`);
  } catch (e) {}
}

main();
