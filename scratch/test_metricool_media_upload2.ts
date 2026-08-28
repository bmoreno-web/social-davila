import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;

  // Create a small sample buffer
  const sampleBuffer = Buffer.from('fake image content for testing');
  const blob = new Blob([sampleBuffer], { type: 'image/jpeg' });

  const formData = new FormData();
  formData.append('file', blob, 'sample.jpg');

  const res = await fetch(`${BASE_URL}/v2/scheduler/media?blogId=${blogId}&userId=${userId}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'X-Mc-Auth': API_KEY
    },
    body: formData
  });

  console.log(`POST /v2/scheduler/media Status: ${res.status}`);
  const text = await res.text();
  console.log(`Response: ${text}`);
}

main();
