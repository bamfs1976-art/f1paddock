# F1 Paddock Intelligence

Single-page Formula 1 dashboard. React 19, TypeScript, Vite 6, Tailwind CSS 4,
motion/react, Recharts, Netlify Functions, Supabase (user preferences only).
Live site: https://fromthepaddock.netlify.app

## Architecture: four layers

1. **Static constants** (`src/constants.ts`). Hand-edited reference data which
   does not change during a season: driver bios, career stats, circuit metadata
   (laps, distance, flag, map id), team colours, engine suppliers and the driver
   identity maps. Nothing here is a season result.
2. **Jolpica (Ergast-compatible) via `netlify/functions/jolpica-proxy.ts`.**
   Standings, race results, podiums, fastest laps and the season schedule.
   Read through `src/services/standingsService.ts` and `scheduleService.ts`.
3. **OpenF1 via `netlify/functions/openf1-proxy.ts`.** Meetings, sessions,
   live positions, weather, race control, pit stops, laps, stints, car data.
   Read through `src/services/f1Service.ts` and `scheduleService.ts`.
4. **Claude AI via Netlify Functions** (`paddock-intel`, `driver-analysis`,
   `chat`). The prompt context is built at request time in
   `netlify/functions/utils/f1-context.ts` from layers 2 and 3. There are no
   hardcoded results in the AI context.

The browser never calls Jolpica, OpenF1 or Anthropic directly. Every external
request goes through a Netlify Function with a server-side cache.

## Data ownership

| Data | Source | Cache |
|---|---|---|
| Driver and constructor standings | Jolpica via `jolpica-proxy` | 1 hour |
| Race results, podiums, fastest lap | Jolpica via `jolpica-proxy` | 1 hour |
| Season schedule (all rounds, session times) | Jolpica `races` via `jolpica-proxy` | 1 hour |
| Calendar rounds, dates, circuits | OpenF1 `meetings` via `openf1-proxy` (Jolpica `races` fills rounds OpenF1 has not published yet) | 24 hours |
| Session times and countdown | OpenF1 `sessions` via `openf1-proxy` | 1 hour |
| Live positions, weather, race control, pits, laps, car data | OpenF1 via `openf1-proxy` | 15 seconds |
| Tyre stints | OpenF1 `stints` via `openf1-proxy` | 15 seconds |
| Driver bios, career stats, circuit metadata, team colours | `constants.ts` (static, edited by hand) | n/a |
| AI content | Netlify functions, context built at request time | 1 hour, keyed on last completed round |
| Model predictions | `github-raw-proxy` (deepan-alve/F1-model, GPL-3.0, credited in the UI) | 6 hours |

OpenF1 only publishes a meeting once its first session has started, so the
schedule for future rounds always comes from Jolpica `races`. When both sources
describe the same session, OpenF1 wins because it carries `date_end`, which is
what decides whether a session is live.

## Proxy caching pattern

Each proxy is a Netlify Function with a module-scoped `Map` cache. Netlify keeps
the function warm between invocations, so the cache survives across requests
without any external store.

- **Allow-list the upstream path.** Reject anything else with 400.
- **Fresh window (TTL).** Serve from cache with `X-Cache: HIT`.
- **Stale window.** If upstream returns 429 or 5xx, or the fetch throws, serve
  the cached copy with `X-Cache: STALE` until the stale window expires.
- **`X-Cache-Timestamp`** carries the time the cached copy was fetched so the
  UI can label stale data ("Data from 14:32").
- **One upstream call per path per window** is the design intent regardless of
  traffic. Jolpica is rate limited to 500 requests per hour, so its proxy uses a
  60 minute TTL and a 24 hour stale window.

Copy `openf1-proxy.ts` when adding a new upstream. Do not add a proxy without a
path allow-list.

## Driver identity

`DRIVER_NUMBER_MAP` in `constants.ts` is the single source of driver identity.
OpenF1 identifies drivers by car number and Jolpica by three-letter code, so the
two maps `DRIVER_NUMBER_MAP` (number to app id) and `DRIVER_CODE_MAP` (code to
app id) are the only places where those are reconciled. Never key on surname.
Verify the numbers against `https://api.openf1.org/v1/drivers?session_key=latest`
with `node scripts/verify-drivers.mjs` whenever the grid changes, and record
the session key and date in the comment above the map.

## Honest data states

Every data-driven component has four states: loading (`SkeletonLoader`), fresh,
stale (labelled with the cached timestamp) and unavailable (short message and a
retry button). The hardcoded snapshot in `constants.ts` renders only when the
proxy fails and no cache exists, and it is always labelled as a snapshot. Random
or simulated numbers are never displayed.

## Design rules

- Editorial identity: Playfair Display headlines, JetBrains Mono labels,
  near-black paper, racing red, numbered sections, ticker. Do not introduce a
  new visual style or palette.
- Type floor is 12px. `.label-mono` is 12px, `.section-label` is 13px.
- `--color-ink-3` is body-level secondary text (55 percent opacity). Borders and
  decorative rules use `--color-rule` (25 percent opacity), never `ink-3`.
- Team colours are never used as text colour on light paper. Use a 4px leading
  bar or a filled chip with ink text.
- Racing red is used as text only at 18px and above, or bold at 14px and above.
  Below that, pair a red mark (dot, bar) with an ink label.
- Times display in the visitor's local timezone with `Intl.DateTimeFormat` and
  the zone abbreviation. Never hardcode BST.
- British English in all interface copy and comments.

## Conventions

- One concern per commit, small commits, clear messages.
- `npm run typecheck` and `npm run build` must pass before every commit.
- No new runtime dependencies without a stated reason in the commit message.
- No Supabase schema changes. No new pages or routing: the app is a single view
  with anchors on desktop and tabs on mobile.
- Do not upgrade `MODEL` in `netlify/functions/utils/claude.ts` unless it fails.

## Commands

```
npm run dev         # Vite only, functions unavailable
npx netlify dev     # Vite plus functions on http://localhost:8888
npm run typecheck
npm run build
node scripts/verify-drivers.mjs
```
