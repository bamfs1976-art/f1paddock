// Every time shown to a visitor is in their own timezone, with the zone
// abbreviation from Intl. Nothing here hardcodes BST or any other zone.

const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
const dayTimeFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' });
const longDateFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
const clockFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** "14:00 BST" in the visitor's zone. */
export function fmtLocalTime(iso: string | number | Date): string {
  return timeFmt.format(new Date(iso));
}

/** "Sunday 14:00 BST" in the visitor's zone. */
export function fmtDayTime(iso: string | number | Date): string {
  return dayTimeFmt.format(new Date(iso));
}

/** "06 SEP" for calendar cards. Date-only strings are treated as local dates. */
export function fmtShortDate(iso: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return dateFmt.format(d).toUpperCase();
}

/** "SUN 06 SEP 2026" for the hero date label. */
export function fmtLongDate(d: Date): string {
  return longDateFmt.format(d).toUpperCase().replace(/,/g, '');
}

/** "14:32" without a zone, for "Data from 14:32" labels. */
export function fmtClock(ts: number): string {
  return clockFmt.format(new Date(ts));
}

export interface Countdown { days: number; hours: number; minutes: number; seconds: number; total: number }

export function countdownTo(iso: string | number, now = Date.now()): Countdown {
  const total = Math.max(0, new Date(iso).getTime() - now);
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total % 86_400_000) / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
  };
}
