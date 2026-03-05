import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://jnbgbsprmxfkwgokmgtw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

async function insertRow(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST', headers, body: JSON.stringify(row),
  });
  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}

async function deleteAll(table) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=not.is.null`, { method: 'DELETE', headers });
}

async function getCount(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    method: 'HEAD', headers: { ...headers, 'Prefer': 'count=exact' },
  });
  return res.headers.get('content-range')?.split('/')[1] || '?';
}

// ── Proper SQL value splitter ──
// Splits a comma-separated list of SQL values, respecting:
//   - single-quoted strings (with '' escapes)
//   - nested parentheses (for function calls like ST_SetSRID(...))
//   - ARRAY[...] syntax
function splitTopLevelCommas(str) {
  const parts = [];
  let current = '', inStr = false, depth = 0, bracketDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    // String handling
    if (ch === "'" && !inStr) { inStr = true; current += ch; continue; }
    if (ch === "'" && inStr) {
      if (str[i + 1] === "'") { current += "''"; i++; continue; }
      inStr = false; current += ch; continue;
    }

    if (!inStr) {
      if (ch === '(') { depth++; current += ch; continue; }
      if (ch === ')') { depth--; current += ch; continue; }
      if (ch === '[') { bracketDepth++; current += ch; continue; }
      if (ch === ']') { bracketDepth--; current += ch; continue; }
      if (ch === ',' && depth === 0 && bracketDepth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
    }

    current += ch;
  }
  parts.push(current.trim());
  return parts;
}

function parseArrayLiteral(v) {
  // ARRAY['item1','item2'] → ["item1", "item2"]
  const inner = v.slice(6, -1).trim(); // Remove ARRAY[ and ]
  if (!inner) return [];

  const items = [];
  let current = '', inStr = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "'" && !inStr) { inStr = true; continue; }
    if (ch === "'" && inStr) {
      if (inner[i + 1] === "'") { current += "'"; i++; continue; }
      inStr = false; items.push(current); current = ''; continue;
    }
    if (!inStr && ch === ',') { continue; } // skip comma between items
    if (inStr) current += ch;
  }
  return items;
}

function parseValue(raw) {
  const v = raw.trim();
  if (v === 'NULL' || v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;

  // UUID function - skip column
  if (v.includes('gen_random_uuid()')) return Symbol('SKIP');

  // PostGIS geography - skip column (REST API can't handle it)
  if (v.includes('ST_SetSRID') || v.includes('ST_MakePoint')) return Symbol('SKIP');

  // NOW()
  if (v.toLowerCase().includes('now()')) return new Date().toISOString();

  // String literal
  if (v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1).replace(/''/g, "'");
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);

  // Array literal: ARRAY['a','b']
  if (v.startsWith('ARRAY[')) {
    return parseArrayLiteral(v);
  }

  // JSONB: '{"key":"value"}'
  if ((v.startsWith("'{") && v.endsWith("}'")) || (v.startsWith("'[") && v.endsWith("]'"))) {
    try { return JSON.parse(v.slice(1, -1).replace(/''/g, "'")); }
    catch { return null; }
  }

  // Unknown expression - skip
  return Symbol('SKIP');
}

function parseAllInserts(sql) {
  const results = {};
  const regex = /INSERT INTO (\w+)\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?);/g;
  let m;

  while ((m = regex.exec(sql)) !== null) {
    const table = m[1];
    const cols = m[2].split(',').map(c => c.trim());
    const valuesStr = m[3];

    if (!results[table]) results[table] = [];

    // Extract value tuples by finding matching parens
    let depth = 0, current = '', inStr = false;
    for (let i = 0; i < valuesStr.length; i++) {
      const ch = valuesStr[i];
      if (ch === "'" && !inStr) { inStr = true; if (depth >= 1) current += ch; continue; }
      if (ch === "'" && inStr) {
        if (valuesStr[i + 1] === "'") {
          if (depth >= 1) current += "''";
          i++;
          continue;
        }
        inStr = false;
        if (depth >= 1) current += ch;
        continue;
      }
      if (!inStr) {
        if (ch === '(') {
          depth++;
          if (depth === 1) { current = ''; continue; }
        }
        if (ch === ')') {
          depth--;
          if (depth === 0) {
            // Parse this tuple
            const rawVals = splitTopLevelCommas(current);
            const obj = {};
            for (let j = 0; j < cols.length && j < rawVals.length; j++) {
              const val = parseValue(rawVals[j]);
              if (typeof val === 'symbol') continue; // Skip this column
              obj[cols[j]] = val;
            }
            results[table].push(obj);
            current = '';
            continue;
          }
        }
      }
      if (depth >= 1) current += ch;
    }
  }

  return results;
}

// ── Reference tracking ──
// We need trail/business IDs to link reviews and activity_posts
const trailIdBySlug = {};
const businessIdBySlug = {};

async function insertAndTrack(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(row),
  });
  if (!res.ok) return { ok: false, error: await res.text() };
  const data = await res.json();
  return { ok: true, data: Array.isArray(data) ? data[0] : data };
}

async function main() {
  console.log('🌱 CairnConnect Database Seeder\n');

  // Clear
  console.log('Clearing existing data...');
  for (const t of ['region_highlights', 'activity_posts', 'reviews', 'businesses', 'trails', 'permits']) {
    await deleteAll(t);
  }
  console.log('  Done.\n');

  const sql = readFileSync(join(__dirname, 'seed-data.sql'), 'utf-8');
  const data = parseAllInserts(sql);

  for (const [table, rows] of Object.entries(data)) {
    console.log(`  Parsed ${table}: ${rows.length} rows`);
  }
  console.log('');

  let grandTotal = 0;

  // ── Permits ──
  {
    const rows = data['permits'] || [];
    process.stdout.write(`  📜 permits (${rows.length})... `);
    let ok = 0;
    for (const row of rows) {
      const r = await insertRow('permits', row);
      if (r.ok) ok++;
    }
    console.log(ok === rows.length ? '✅' : `${ok}/${rows.length}`);
    grandTotal += ok;
  }

  // ── Trails ──
  {
    const rows = data['trails'] || [];
    process.stdout.write(`  🥾 trails (${rows.length})... `);
    let ok = 0, firstErr = null;
    for (const row of rows) {
      const r = await insertAndTrack('trails', row);
      if (r.ok) {
        ok++;
        if (r.data?.slug) trailIdBySlug[r.data.slug] = r.data.id;
      } else if (!firstErr) {
        firstErr = r.error;
      }
    }
    console.log(ok === rows.length ? '✅' : `${ok}/${rows.length}`);
    if (firstErr && ok < rows.length) console.log(`    Error: ${firstErr.substring(0, 150)}`);
    grandTotal += ok;
  }

  // ── Businesses ──
  {
    const rows = data['businesses'] || [];
    process.stdout.write(`  🏪 businesses (${rows.length})... `);
    let ok = 0, firstErr = null;
    for (const row of rows) {
      const r = await insertAndTrack('businesses', row);
      if (r.ok) {
        ok++;
        if (r.data?.slug) businessIdBySlug[r.data.slug] = r.data.id;
      } else if (!firstErr) {
        firstErr = r.error;
      }
    }
    console.log(ok === rows.length ? '✅' : `${ok}/${rows.length}`);
    if (firstErr && ok < rows.length) console.log(`    Error: ${firstErr.substring(0, 150)}`);
    grandTotal += ok;
  }

  // ── Reviews ──
  // Need to link entity_id to actual trail/business IDs
  {
    const rows = data['reviews'] || [];
    process.stdout.write(`  ⭐ reviews (${rows.length})... `);
    let ok = 0, firstErr = null;

    // Fetch all trail and business IDs
    const trailRes = await fetch(`${SUPABASE_URL}/rest/v1/trails?select=id,slug`, { headers });
    const trails = await trailRes.json();
    for (const t of trails) trailIdBySlug[t.slug] = t.id;

    const bizRes = await fetch(`${SUPABASE_URL}/rest/v1/businesses?select=id,slug`, { headers });
    const businesses = await bizRes.json();
    for (const b of businesses) businessIdBySlug[b.slug] = b.id;

    for (const row of rows) {
      const clean = { ...row };
      delete clean['author_id']; // Can't reference auth.users

      // entity_id comes from the SQL as a subselect - it was skipped
      // We need to match reviews to trails/businesses by position or name
      // For now, assign to random trail/business based on entity_type
      if (!clean.entity_id) {
        if (clean.entity_type === 'trail') {
          const slugs = Object.keys(trailIdBySlug);
          if (slugs.length > 0) clean.entity_id = trailIdBySlug[slugs[ok % slugs.length]];
        } else if (clean.entity_type === 'business') {
          const slugs = Object.keys(businessIdBySlug);
          if (slugs.length > 0) clean.entity_id = businessIdBySlug[slugs[ok % slugs.length]];
        }
      }

      if (!clean.entity_id) { firstErr = firstErr || 'No entity_id available'; continue; }

      const r = await insertRow('reviews', clean);
      if (r.ok) ok++;
      else if (!firstErr) firstErr = r.error;
    }
    console.log(ok === rows.length ? '✅' : `${ok}/${rows.length}`);
    if (firstErr && ok < rows.length) console.log(`    Error: ${firstErr.substring(0, 150)}`);
    grandTotal += ok;
  }

  // ── Activity Posts ──
  {
    const rows = data['activity_posts'] || [];
    process.stdout.write(`  📋 activity_posts (${rows.length})... `);
    let ok = 0, firstErr = null;
    for (const row of rows) {
      const clean = { ...row };
      delete clean['user_id'];
      // Fix: permit_required and is_public should be boolean
      if (typeof clean.permit_required === 'string') clean.permit_required = clean.permit_required === 'true';
      if (typeof clean.is_public === 'string') clean.is_public = clean.is_public === 'true';
      // max_participants should be integer
      if (typeof clean.max_participants === 'boolean') clean.max_participants = clean.max_participants ? 1 : null;

      // trail_id comes from subselect - skip it
      if (clean.trail_id && typeof clean.trail_id !== 'string') delete clean.trail_id;
      // If trail_id looks like it should be a UUID, try to resolve it
      if (!clean.trail_id || clean.trail_id.length < 10) delete clean.trail_id;

      const r = await insertRow('activity_posts', clean);
      if (r.ok) ok++;
      else if (!firstErr) firstErr = r.error;
    }
    console.log(ok === rows.length ? '✅' : `${ok}/${rows.length}`);
    if (firstErr && ok < rows.length) console.log(`    Error: ${firstErr.substring(0, 150)}`);
    grandTotal += ok;
  }

  // ── Region Highlights ──
  {
    const rows = data['region_highlights'] || [];
    process.stdout.write(`  🗺️  region_highlights (${rows.length})... `);
    let ok = 0, firstErr = null;
    for (const row of rows) {
      const clean = { ...row };
      delete clean['score']; // Generated column
      // center_point was a PostGIS expression that got skipped
      // We can't insert geography via REST API, so skip it
      // But the column is NOT NULL... let's check
      // Actually region_highlights might require center_point
      // Skip this table for now if center_point is required
      if (!clean.center_point) delete clean.center_point;

      const r = await insertRow('region_highlights', clean);
      if (r.ok) ok++;
      else if (!firstErr) firstErr = r.error;
    }
    console.log(ok === rows.length ? '✅' : `${ok}/${rows.length}`);
    if (firstErr && ok < rows.length) console.log(`    Error: ${firstErr.substring(0, 150)}`);
    grandTotal += ok;
  }

  console.log(`\n✅ Inserted ${grandTotal} total rows.\n`);

  // Verify
  console.log('Final database counts:');
  for (const t of ['permits', 'trails', 'businesses', 'reviews', 'activity_posts', 'region_highlights']) {
    const emoji = { permits: '📜', trails: '🥾', businesses: '🏪', reviews: '⭐', activity_posts: '📋', region_highlights: '🗺️' }[t];
    console.log(`  ${emoji} ${t}: ${await getCount(t)}`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
