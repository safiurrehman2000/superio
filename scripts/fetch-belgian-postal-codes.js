/**
 * Fetch every Belgian postal code + coordinates from OpenDataSoft's public
 * geonames-postal-code dataset and write a compact JSON lookup to
 * utils/belgian-postal-codes.json.
 *
 * Run: `node scripts/fetch-belgian-postal-codes.js`
 *
 * Output shape (postal_code -> [lat, lng, place_name]):
 *   { "1000": [50.8467, 4.3499, "Bruxelles"], ... }
 *
 * When a postal code has multiple entries (e.g. shared across sub-municipalities)
 * we keep the first one — good enough for a town-level distance estimate.
 */

const fs = require('fs');
const path = require('path');

const API = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-postal-code/records';
const PAGE_SIZE = 100;

async function fetchAll() {
  const out = {};
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const url = `${API}?where=country_code%3D%22BE%22&limit=${PAGE_SIZE}&offset=${offset}&order_by=postal_code%20ASC`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    const json = await res.json();
    total = json.total_count;

    for (const row of json.results) {
      const code = row.postal_code;
      if (!code || out[code]) continue;
      if (typeof row.latitude !== 'number' || typeof row.longitude !== 'number') continue;
      out[code] = [
        Number(row.latitude.toFixed(4)),
        Number(row.longitude.toFixed(4)),
        row.place_name || '',
      ];
    }

    process.stdout.write(`\rFetched ${Math.min(offset + PAGE_SIZE, total)}/${total}`);
    offset += PAGE_SIZE;
  }

  process.stdout.write('\n');
  return out;
}

(async () => {
  const data = await fetchAll();
  const outPath = path.join(__dirname, '..', 'utils', 'belgian-postal-codes.json');
  fs.writeFileSync(outPath, JSON.stringify(data));
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`Wrote ${Object.keys(data).length} postal codes to ${outPath} (${kb} KB)`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
