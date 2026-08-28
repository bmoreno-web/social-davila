import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;

  const variations = [
    {
      name: 'Var 1: publicationDate as ISO String with facebook',
      payload: {
        blogId,
        userId,
        text: 'Prueba de publicacion programada desde Davila PM Social Suite',
        publicationDate: '2026-09-01T15:00:00',
        providers: [{ provider: 'facebook' }],
        draft: true
      }
    },
    {
      name: 'Var 2: publicationDate as object with dateTime and timezone',
      payload: {
        blogId,
        userId,
        text: 'Prueba de publicacion programada desde Davila PM Social Suite',
        publicationDate: {
          dateTime: '2026-09-01T15:00:00',
          timezone: 'America/Bogota'
        },
        providers: [{ provider: 'facebook' }],
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
