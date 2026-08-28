import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  console.log('--- Testing Metricool API Scheduler Endpoints ---');

  // 1. Get profiles to get exact blogId and userId
  try {
    const profRes = await fetch(`${BASE_URL}/admin/simpleProfiles`, {
      headers: {
        'Accept': 'application/json',
        'X-Mc-Auth': API_KEY
      }
    });
    const profiles = await profRes.json();
    console.log('Profiles found:', profiles.map((p: any) => ({ name: p.name, blogId: p.blogId, userId: p.userId })));

    if (!profiles || profiles.length === 0) {
      console.log('No profiles returned');
      return;
    }

    const testProfile = profiles[0];
    const { blogId, userId } = testProfile;
    console.log(`\nTesting with profile: ${testProfile.name} (blogId: ${blogId}, userId: ${userId})`);

    // 2. Test GET on Scheduler endpoints to see existing scheduled posts
    const testEndpoints = [
      `/v2/scheduler/posts?blogId=${blogId}&userId=${userId}`,
      `/v2/scheduler/posts?blogId=${blogId}`,
      `/v2/scheduler/planner?blogId=${blogId}&userId=${userId}`,
      `/v2/scheduler/posts`
    ];

    for (const ep of testEndpoints) {
      try {
        console.log(`\nTesting GET ${ep}...`);
        const res = await fetch(`${BASE_URL}${ep}`, {
          headers: {
            'Accept': 'application/json',
            'X-Mc-Auth': API_KEY
          }
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Response snippet: ${text.slice(0, 300)}`);
      } catch (err: any) {
        console.log(`Error on ${ep}:`, err.message);
      }
    }

    // 3. Test POST scheduling on /v2/scheduler/posts
    console.log('\nTesting POST /v2/scheduler/posts ...');
    const futureDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace(/\.\d+Z$/, '');
    const postPayload = {
      blogId: Number(blogId),
      userId: Number(userId),
      text: 'Test automated post from Davila PM Social suite',
      dateTime: futureDate,
      providers: ['instagram', 'facebook'],
      draft: true
    };

    const postRes = await fetch(`${BASE_URL}/v2/scheduler/posts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Mc-Auth': API_KEY
      },
      body: JSON.stringify(postPayload)
    });

    console.log(`POST Status: ${postRes.status}`);
    const postResText = await postRes.text();
    console.log(`POST Response: ${postResText}`);

  } catch (e: any) {
    console.error('Fatal test error:', e);
  }
}

main();
