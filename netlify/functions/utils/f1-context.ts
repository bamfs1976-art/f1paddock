export function buildF1Context(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `
CURRENT DATE: ${today}
SEASON: 2026 Formula 1 World Championship
GRID: 11 teams, 22 drivers (first 11-team grid since 2016, with Cadillac joining)
COMPLETED: 3 of 22 races, plus the Miami sprint

DRIVERS' CHAMPIONSHIP STANDINGS (after Miami sprint):
1. Andrea Kimi Antonelli (Mercedes) — 75 pts (LEADER, 2 wins, youngest leader in F1 history)
2. George Russell (Mercedes) — 68 pts (-7, 1 win)
3. Charles Leclerc (Ferrari) — 55 pts (-20)
4. Lewis Hamilton (Ferrari) — 43 pts (-32)
5. Lando Norris (McLaren, #1, reigning World Champion) — 33 pts (-42)
6. Oscar Piastri (McLaren) — 28 pts (-47)
7. Oliver Bearman (Haas) — 17 pts (-58)
8. Pierre Gasly (Alpine) — 16 pts (-59)
9. Max Verstappen (Red Bull) — 16 pts (-59)
10. Liam Lawson (Racing Bulls) — 10 pts (-65)
11. Arvid Lindblad (Racing Bulls) — 4 pts (-71, rookie)
12. Isack Hadjar (Red Bull) — 4 pts (-71)
13. Gabriel Bortoleto (Audi) — 2 pts (-73)
14. Carlos Sainz (Williams) — 2 pts (-73)
15. Esteban Ocon (Haas) — 1 pt (-74)
16. Franco Colapinto (Alpine) — 1 pt (-74)
17. Nico Hülkenberg (Audi) — 0
18. Alex Albon (Williams) — 0
19. Valtteri Bottas (Cadillac) — 0
20. Sergio Perez (Cadillac) — 0
21. Fernando Alonso (Aston Martin) — 0
22. Lance Stroll (Aston Martin) — 0

CONSTRUCTORS' CHAMPIONSHIP STANDINGS:
1. Mercedes — 143 pts (3 wins)
2. Ferrari — 98 pts
3. McLaren — 61 pts
4. Red Bull — 20 pts
5. Haas — 18 pts
6. Alpine — 17 pts
7. Racing Bulls — 14 pts
8. Audi — 2 pts
9. Williams — 2 pts
10. Cadillac — 0
11. Aston Martin — 0

RACE-BY-RACE RESULTS:
- R1 Australia (Albert Park, 8 Mar): 1. Russell, 2. Antonelli, 3. Leclerc
- R2 China (Shanghai, 15 Mar, sprint): 1. Antonelli, 2. Russell, 3. Hamilton
- R3 Japan (Suzuka, 29 Mar): 1. Antonelli, 2. Piastri, 3. Leclerc
- R4 Miami (3 May, sprint format) — RACE WEEKEND IN PROGRESS

NEXT AFTER MIAMI: Canadian GP, Montréal (24 May, sprint).

ALL 11 TEAMS AND DRIVER PAIRINGS:
- McLaren: Lando Norris (#1), Oscar Piastri (#81)
- Ferrari: Charles Leclerc (#16), Lewis Hamilton (#44)
- Red Bull: Max Verstappen (#3), Isack Hadjar (#6)
- Mercedes: George Russell (#63), Andrea Kimi Antonelli (#12)
- Aston Martin: Fernando Alonso (#14), Lance Stroll (#18)
- Williams: Carlos Sainz (#55), Alex Albon (#23)
- Alpine: Pierre Gasly (#10), Franco Colapinto (#43)
- Audi: Nico Hülkenberg (#27), Gabriel Bortoleto (#5)
- Haas: Esteban Ocon (#31), Oliver Bearman (#87)
- Racing Bulls: Liam Lawson (#30), Arvid Lindblad (#41, rookie)
- Cadillac: Sergio Perez (#11), Valtteri Bottas (#77)

2026 CALENDAR (22 rounds):
R01 Australia (08 Mar), R02 China sprint (15 Mar), R03 Japan (29 Mar),
R04 Miami sprint (03 May), R05 Canada sprint (24 May), R06 Monaco (07 Jun),
R07 Catalunya (14 Jun), R08 Austria (28 Jun), R09 Britain sprint (05 Jul),
R10 Belgium (19 Jul), R11 Hungary (26 Jul), R12 Netherlands sprint (23 Aug),
R13 Italy (06 Sep), R14 Spain at Madring (13 Sep), R15 Azerbaijan (26 Sep),
R16 Singapore sprint (11 Oct), R17 USA Austin (25 Oct), R18 Mexico (01 Nov),
R19 Brazil (08 Nov), R20 Las Vegas (21 Nov), R21 Qatar (29 Nov), R22 Abu Dhabi (06 Dec).

2026 REGULATIONS HIGHLIGHTS:
- 30kg lighter chassis with bio-composite safety cells
- Active aerodynamics: movable front and rear wings
- 50/50 ICE / electrical power split (350kW MGU-K), MGU-H removed
- 100% sustainable e-fuels mandatory
- New entries: Cadillac (American factory team, Ferrari-powered)
- Norris races with #1 as 2025 World Champion; Verstappen reverts to #3

WRITING STYLE: Use British English. Be factual, specific, data-driven. No clichés.
`;
}
