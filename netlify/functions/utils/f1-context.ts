import { DRIVERS, TEAMS } from '../../../src/constants';
import { getDriverStandings, getConstructorStandings, getRoundPodium, getUpcomingRound, SEASON } from './upstream';

export interface F1Context {
  text: string;
  lastCompletedRound: number;
  nextRaceName: string | null;
}

// Static team pairings and engine suppliers from the app's single identity
// source. Everything else in the context is fetched at request time.
function pairings(): string {
  return TEAMS.map((t) => {
    const pair = DRIVERS.filter((d) => d.team === t.name).map((d) => `${d.name} (#${d.number})`).join(', ');
    return `- ${t.name} (${t.engine} power unit): ${pair}`;
  }).join('\n');
}

function fmtUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

/**
 * Builds the season context for every AI prompt from live data: current
 * standings, the last three podiums and the next round's sessions. No result
 * is hardcoded here. When an upstream is unreachable the section says so,
 * which the prompts treat as "do not speculate".
 */
export async function buildF1Context(): Promise<F1Context> {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);

  const [drivers, constructors, upcoming] = await Promise.all([
    getDriverStandings(),
    getConstructorStandings(),
    getUpcomingRound(now),
  ]);
  const lastCompletedRound = drivers?.round ?? 0;

  const podiumRounds = [lastCompletedRound, lastCompletedRound - 1, lastCompletedRound - 2].filter((r) => r >= 1);
  const podiums = await Promise.all(podiumRounds.map((r) => getRoundPodium(r)));

  const driverLines = drivers
    ? drivers.rows.slice(0, 22).map((d) => {
        const gap = d.position === 1 ? 'leader' : `-${drivers.rows[0].points - d.points}`;
        return `${d.position}. ${d.name} (${d.code}, ${d.team}) — ${d.points} pts (${gap}${d.wins ? `, ${d.wins} win${d.wins === 1 ? '' : 's'}` : ''})`;
      }).join('\n')
    : 'UNAVAILABLE (do not state or estimate any standings)';

  const constructorLines = constructors
    ? constructors.slice(0, 11).map((c) => `${c.position}. ${c.name} — ${c.points} pts${c.wins ? ` (${c.wins} win${c.wins === 1 ? '' : 's'})` : ''}`).join('\n')
    : 'UNAVAILABLE (do not state or estimate any standings)';

  const podiumLines = podiums.filter((p): p is NonNullable<typeof p> => !!p).length
    ? podiums
        .filter((p): p is NonNullable<typeof p> => !!p)
        .sort((a, b) => a.round - b.round)
        .map((p) => `- R${p.round} ${p.raceName} (${p.date}): ${p.podium.map((x, i) => `${i + 1}. ${x.name} (${x.team}${i ? `, ${x.gap}` : ''})`).join('; ')}`)
        .join('\n')
    : 'UNAVAILABLE (do not describe any race result)';

  const nextLines = upcoming
    ? `NEXT ROUND: R${upcoming.round} ${upcoming.raceName}, ${upcoming.circuit}, ${upcoming.locality}, ${upcoming.country} (race ${upcoming.date})\nSESSIONS:\n${upcoming.sessions.map((s) => `- ${s.name}: ${fmtUtc(s.start)}`).join('\n')}`
    : 'NEXT ROUND: UNAVAILABLE (do not name or preview a race)';

  const text = `
CURRENT DATE: ${today}
SEASON: ${SEASON} Formula 1 World Championship
GRID: 11 teams, 22 drivers (Cadillac joined as the eleventh team)
COMPLETED ROUNDS: ${lastCompletedRound || 'unknown'} of 22

DRIVERS' CHAMPIONSHIP (after round ${lastCompletedRound || '?'}):
${driverLines}

CONSTRUCTORS' CHAMPIONSHIP:
${constructorLines}

LAST THREE PODIUMS:
${podiumLines}

${nextLines}

TEAMS AND DRIVER PAIRINGS:
${pairings()}

2026 REGULATIONS HIGHLIGHTS:
- Active aerodynamics: movable front and rear wings
- Roughly 50/50 combustion and electrical power split (350kW MGU-K), MGU-H removed
- 100 percent sustainable fuels mandatory
- Lighter, narrower cars than the 2022 to 2025 generation

GROUNDING RULES: Use only the standings, results and schedule above. Do not
invent quotations, interviews, incidents, penalties, injuries, contracts or
any event which does not appear in the data. If a section reads UNAVAILABLE,
say the data is unavailable rather than guessing. Never present analysis as
news reporting.

WRITING STYLE: British English. Factual, specific, data-driven. No clichés.
`;

  return { text, lastCompletedRound, nextRaceName: upcoming?.raceName ?? null };
}
