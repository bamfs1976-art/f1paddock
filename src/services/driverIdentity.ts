import { DRIVER_NUMBER_MAP, DRIVER_CODE_MAP } from '../constants';
import { fetchOpenF1 } from './f1Service';

interface OpenF1Driver {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  session_key: number;
}

export interface IdentityMismatch {
  number: number;
  openf1Code: string;
  mapCode: string | null;
  fullName: string;
}

let checked = false;

/**
 * Runtime cross-check of DRIVER_NUMBER_MAP against OpenF1's driver list for the
 * latest session. The proxy caches `drivers` for an hour so this costs one
 * upstream call per hour across all visitors. Mismatches are logged to the
 * console with the session key so they can be recorded in constants.ts; the
 * static map stays the source of truth and is never patched at runtime.
 */
export async function checkDriverIdentity(): Promise<IdentityMismatch[]> {
  if (checked) return [];
  checked = true;
  const drivers = await fetchOpenF1<OpenF1Driver[]>('drivers', 'session_key=latest');
  if (!drivers || !drivers.length) return [];

  const idToCode = new Map(Object.entries(DRIVER_CODE_MAP).map(([code, id]) => [id, code]));
  const mismatches: IdentityMismatch[] = [];
  for (const d of drivers) {
    const id = DRIVER_NUMBER_MAP[d.driver_number];
    const mapCode = id ? idToCode.get(id) ?? null : null;
    if (mapCode !== d.name_acronym) {
      mismatches.push({ number: d.driver_number, openf1Code: d.name_acronym, mapCode, fullName: d.full_name });
    }
  }
  if (mismatches.length) {
    console.warn(
      `[driver identity] ${mismatches.length} mismatch(es) against OpenF1 session ${drivers[0].session_key}. ` +
      'Update DRIVER_NUMBER_MAP in src/constants.ts:',
      mismatches
    );
  } else {
    console.info(`[driver identity] DRIVER_NUMBER_MAP matches OpenF1 session ${drivers[0].session_key} (${drivers.length} drivers)`);
  }
  return mismatches;
}
