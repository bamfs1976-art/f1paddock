export function buildF1Context(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `
CURRENT DATE: ${today}
SEASON: 2026 Formula 1 World Championship

DRIVERS' CHAMPIONSHIP TOP 10 (after 5 of 24 races):
1. Lando Norris (McLaren) — 122 pts (LEADER)
2. Max Verstappen (Red Bull) — 109 pts (-13)
3. Oscar Piastri (McLaren) — 98 pts (-24)
4. Charles Leclerc (Ferrari) — 86 pts (-36)
5. Lewis Hamilton (Ferrari) — 71 pts (-51)
6. George Russell (Mercedes) — 64 pts (-58)
7. Andrea Kimi Antonelli (Mercedes) — 48 pts (-74)
8. Fernando Alonso (Aston Martin) — 41 pts (-81)
9. Carlos Sainz (Williams) — 33 pts (-89)
10. Pierre Gasly (Alpine) — 22 pts (-100)

CONSTRUCTORS' CHAMPIONSHIP TOP 5:
1. McLaren — 220 pts
2. Ferrari — 157 pts
3. Red Bull — 121 pts
4. Mercedes — 112 pts
5. Williams — 52 pts

LAST COMPLETED RACE: Chinese GP, Shanghai (2026-04-26) — Winner: Oscar Piastri
NEXT RACE: Miami GP, Miami International Autodrome (2026-05-10) — Sprint weekend

2026 REGULATIONS HIGHLIGHTS:
- New chassis: 30kg lighter, bio-composite safety cells
- Active aerodynamics: movable front and rear wings
- Power units: 50/50 ICE / electrical split (350kW MGU-K), MGU-H removed
- 100% sustainable e-fuels mandatory
- New entries: Audi (Sauber takeover); Cadillac delayed to 2027

WRITING STYLE: Use British English. Be factual, specific, data-driven. No clichés.
`;
}
