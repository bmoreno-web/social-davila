import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.METRICOOL_API_KEY || 'VQFUFHVQRZQFBPCBXGFFNTFIQYSVJWNFPZFSJDOIOXJXHBXRSOFJQEABULFCBPUI';
const BASE_URL = 'https://app.metricool.com/api';

async function main() {
  const blogId = 2930665;
  const userId = 1395490;
  const ids = [367887293, 367887299];

  for (const id of ids) {
    try {
      const res = await fetch(`${BASE_URL}/v2/scheduler/posts/${id}?blogId=${blogId}&userId=${userId}`, {
        method: 'DELETE',
        headers: { 'X-Mc-Auth': API_KEY }
      });
      console.log(`Deleted post ${id}:`, res.status);
    } catch (e) {}
  }
}

main();
