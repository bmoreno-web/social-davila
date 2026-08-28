import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  // 1. Get raw simpleProfiles to see real properties
  const profRes = await fetch(`${BASE_URL}/admin/simpleProfiles`, {
    headers: { 'Accept': 'application/json', 'X-Mc-Auth': API_KEY }
  });
  const profiles = await profRes.json();
  console.log('Full First profile:', JSON.stringify(profiles[0], null, 2));

  const blogId = profiles[0].id || profiles[0].blogId || profiles[0].blog?.id;
  const userId = profiles[0].userId || profiles[0].user?.id || 1395490;
  console.log(`Using blogId: ${blogId}, userId: ${userId}`);

  // Test provider payload variations
  const variations = [
    {
      name: 'Variation A: providers as objects with provider property',
      payload: {
        blogId: Number(blogId),
        userId: Number(userId),
        text: 'Test post from Davila PM API',
        dateTime: '2026-08-29T16:00:00',
        providers: [{ provider: 'instagram' }],
        draft: true
      }
    },
    {
      name: 'Variation B: providers with uppercase provider name',
      payload: {
        blogId: Number(blogId),
        userId: Number(userId),
        text: 'Test post from Davila PM API',
        dateTime: '2026-08-29T16:00:00',
        providers: [{ provider: 'INSTAGRAM' }],
        draft: true
      }
    },
    {
      name: 'Variation C: providers as network object',
      payload: {
        blogId: Number(blogId),
        userId: Number(userId),
        text: 'Test post from Davila PM API',
        dateTime: '2026-08-29T16:00:00',
        providers: [{ network: 'instagram' }],
        draft: true
      }
    }
  ];

  for (const v of variations) {
    console.log(`\n--- Testing ${v.name} ---`);
    const res = await fetch(`${BASE_URL}/v2/scheduler/posts?blogId=${blogId}&userId=${userId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Mc-Auth': API_KEY
      },
      body: JSON.stringify(v.payload)
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
  }
}

main();
