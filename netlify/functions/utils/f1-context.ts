export function buildF1Context(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `
CURRENT DATE: ${today}
SEASON: 2026 Formula 1 World Championship
GRID: 11 teams, 22 drivers (first 11-team grid since 2016, with Cadillac joining)

DRIVERS' CHAMPIONSHIP TOP 10 (after 3 of 22 races):
1. Lando Norris (McLaren) — 60 pts (LEADER, reigning World Champion)
2. Oscar Piastri (McLaren) — 53 pts (-7)
3. Max Verstappen (Red Bull) — 48 pts (-12)
4. Charles Leclerc (Ferrari) — 41 pts (-19)
5. Lewis Hamilton (Ferrari) — 35 pts (-25)
6. George Russell (Mercedes) — 30 pts (-30)
7. Andrea Kimi Antonelli (Mercedes) — 22 pts (-38)
8. Fernando Alonso (Aston Martin) — 18 pts (-42)
9. Carlos Sainz (Williams) — 15 pts (-45)
10. Alex Albon (Williams) — 12 pts (-48)

CONSTRUCTORS' CHAMPIONSHIP TOP 5:
1. McLaren — 113 pts
2. Ferrari — 76 pts
3. Red Bull — 56 pts
4. Mercedes — 52 pts
5. Williams — 27 pts

ALL 11 TEAMS AND DRIVER PAIRINGS FOR 2026:
- McLaren: Lando Norris (#1), Oscar Piastri (#81)
- Ferrari: Charles Leclerc (#16), Lewis Hamilton (#44)
- Red Bull: Max Verstappen (#3), Isack Hadjar (#6) — Hadjar promoted from Racing Bulls
- Mercedes: George Russell (#63), Andrea Kimi Antonelli (#12)
- Aston Martin: Fernando Alonso (#14), Lance Stroll (#18)
- Williams: Carlos Sainz (#55), Alex Albon (#23)
- Alpine: Pierre Gasly (#10), Franco Colapinto (#43)
- Audi: Nico Hülkenberg (#27), Gabriel Bortoleto (#5) — Sauber rebrand
- Haas: Esteban Ocon (#31), Oliver Bearman (#87)
- Racing Bulls: Liam Lawson (#30), Arvid Lindblad (#41) — Lindblad is the rookie
- Cadillac: Sergio Perez (#11), Valtteri Bottas (#77) — NEW American factory entry

LAST COMPLETED RACE: Japanese GP, Suzuka (2026-03-29) — Winner: Oscar Piastri
CURRENT RACE WEEKEND: Miami GP (2026-05-03) — Sprint format
NEXT AFTER MIAMI: Canadian GP, Montréal (2026-05-24)

2026 CALENDAR (22 rounds — Bahrain and Saudi Arabia were cancelled from the original 24):
R01 Australia (08 Mar), R02 China sprint (15 Mar), R03 Japan (29 Mar),
R04 Miami sprint (03 May), R05 Canada sprint (24 May), R06 Monaco (07 Jun),
R07 Catalunya (14 Jun), R08 Austria (28 Jun), R09 Britain sprint (05 Jul),
R10 Belgium (19 Jul), R11 Hungary (26 Jul), R12 Netherlands sprint (23 Aug),
R13 Italy (06 Sep), R14 Spain at Madring (13 Sep), R15 Azerbaijan (26 Sep),
R16 Singapore sprint (11 Oct), R17 USA Austin (25 Oct), R18 Mexico (01 Nov),
R19 Brazil (08 Nov), R20 Las Vegas (21 Nov), R21 Qatar (29 Nov), R22 Abu Dhabi (06 Dec).

2026 REGULATIONS HIGHLIGHTS:
- New chassis: 30kg lighter, bio-composite safety cells
- Active aerodynamics: movable front and rear wings
- Power units: 50/50 ICE / electrical split (350kW MGU-K), MGU-H removed
- 100% sustainable e-fuels mandatory
- New entries: Cadillac (American factory team, Ferrari-powered)
- Norris races with #1 as 2025 World Champion; Verstappen reverts to #3

WRITING STYLE: Use British English. Be factual, specific, data-driven. No clichés.
`;
}
