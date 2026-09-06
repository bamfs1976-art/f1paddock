#!/usr/bin/env node
// Compares DRIVER_NUMBER_MAP and DRIVER_CODE_MAP in src/constants.ts with the
// drivers OpenF1 reports for the latest session. Run after any grid change:
//
//   node scripts/verify-drivers.mjs
//
// Exit code 1 on any mismatch so it can gate a CI job. Requires outbound
// access to api.openf1.org.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = await readFile(join(root, 'src', 'constants.ts'), 'utf8');

function parseMap(name) {
  const m = source.match(new RegExp(`export const ${name}[^{]*\\{([\\s\\S]*?)\\n\\};`));
  if (!m) throw new Error(`${name} not found in constants.ts`);
  const out = {};
  for (const [, key, val] of m[1].matchAll(/([A-Za-z0-9_]+)\s*:\s*'([a-z]+)'/g)) out[key] = val;
  return out;
}

const numberMap = parseMap('DRIVER_NUMBER_MAP'); // number -> app id
const codeMap = parseMap('DRIVER_CODE_MAP');     // code -> app id
const idToCode = Object.fromEntries(Object.entries(codeMap).map(([code, id]) => [id, code]));

const url = 'https://api.openf1.org/v1/drivers?session_key=latest';
const res = await fetch(url);
if (!res.ok) {
  console.error(`OpenF1 returned ${res.status} for ${url}`);
  process.exit(2);
}
const drivers = await res.json();
if (!Array.isArray(drivers) || !drivers.length) {
  console.error('OpenF1 returned no drivers for the latest session');
  process.exit(2);
}

const sessionKey = drivers[0].session_key;
const today = new Date().toISOString().slice(0, 10);
console.log(`OpenF1 session_key=${sessionKey} checked ${today}: ${drivers.length} drivers\n`);

let mismatches = 0;
const seen = new Set();
const rows = [];
for (const d of drivers.sort((a, b) => a.driver_number - b.driver_number)) {
  const appId = numberMap[String(d.driver_number)];
  const expectedCode = appId ? idToCode[appId] : undefined;
  seen.add(String(d.driver_number));
  let status = 'ok';
  if (!appId) { status = 'MISSING number in DRIVER_NUMBER_MAP'; mismatches++; }
  else if (expectedCode !== d.name_acronym) { status = `CODE MISMATCH: map says ${expectedCode}, OpenF1 says ${d.name_acronym}`; mismatches++; }
  rows.push([d.driver_number, d.name_acronym, d.full_name, d.team_name, status]);
}
for (const num of Object.keys(numberMap)) {
  if (!seen.has(num)) {
    rows.push([num, idToCode[numberMap[num]] || '?', '(not in latest session)', '', 'EXTRA number in map']);
  }
}

for (const r of rows) console.log(r.map((c) => String(c).padEnd(24)).join(' '));
console.log(`\n${mismatches} mismatch${mismatches === 1 ? '' : 'es'}`);
console.log(`Record in constants.ts: verified against OpenF1 session_key=${sessionKey} on ${today}`);
process.exit(mismatches ? 1 : 0);
