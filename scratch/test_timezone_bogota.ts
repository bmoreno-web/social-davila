function formatBogotaDateTime(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';

  const y = getPart('year');
  const m = getPart('month');
  const d = getPart('day');
  let h = getPart('hour');
  if (h === '24') h = '00';
  const min = getPart('minute');
  const s = getPart('second');

  return `${y}-${m}-${d}T${h}:${min}:${s}`;
}

// Test case 1: 8:00 PM Colombia time on August 28 = 1:00 AM UTC on August 29
const utcDate = new Date('2026-08-29T01:00:00.000Z');
console.log('UTC Date string:', utcDate.toISOString());
console.log('Server getDay/getHours (UTC):', utcDate.getDate(), utcDate.getHours());
console.log('Formatted for Bogota:', formatBogotaDateTime(utcDate));

// Test case 2: 4:30 PM Colombia time on August 28 = 21:30 UTC on August 28
const utcDate2 = new Date('2026-08-28T21:30:00.000Z');
console.log('\nUTC Date 2:', utcDate2.toISOString());
console.log('Formatted for Bogota 2:', formatBogotaDateTime(utcDate2));
