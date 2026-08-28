import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;

  // Let's test endpoints for media upload in Metricool
  const endpoints = [
    `/v2/scheduler/media?blogId=${blogId}&userId=${userId}`,
    `/v2/scheduler/posts/media?blogId=${blogId}&userId=${userId}`,
    `/v2/media/upload?blogId=${blogId}&userId=${userId}`,
    `/v2/resources/media?blogId=${blogId}&userId=${userId}`,
    `/v2/files?blogId=${blogId}&userId=${userId}`
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep}`, {
        method: 'OPTIONS',
        headers: { 'X-Mc-Auth': API_KEY }
      });
      console.log(`OPTIONS ${ep} -> ${res.status}`);
    } catch (e) {}
  }
}

main();
