import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;

  // Let's test a sample public video link on Metricool
  const directVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const payload = {
    blogId,
    userId,
    text: 'Reel de prueba programado desde Davila PM',
    publicationDate: {
      dateTime: '2026-09-04T16:00:00',
      timezone: 'America/Bogota'
    },
    providers: [
      { network: 'facebook' }
    ],
    media: [directVideoUrl],
    autoPublish: true,
    saveExternalMediaFiles: true,
    draft: true
  };

  console.log('Sending Facebook Video post to Metricool...');
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
    const data = JSON.parse(text);
    const id = data?.data?.id;
    if (id) {
      console.log(`Cleaning up test post ${id}...`);
      await fetch(`${BASE_URL}/v2/scheduler/posts/${id}?blogId=${blogId}&userId=${userId}`, {
        method: 'DELETE',
        headers: { 'X-Mc-Auth': API_KEY }
      });
    }
  }
}

main();
