# F1 Paddock Intelligence

> **Moved.** This app now lives in the
> [raceweekedge](https://github.com/bamfs1976-art/raceweekedge) repository
> alongside Grid Edge, with its full history, so there is one app to deploy.
> Paddock is served at `/` and Grid Edge at `/edge/` on the same Netlify site.
> Make changes there. This repository is kept for reference only.


A premium Formula 1 dashboard built with React 19, TypeScript, Vite 6 and Tailwind CSS 4.
Live OpenF1 telemetry, AI-powered analysis via Anthropic Claude, and Supabase user preferences.

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS 4 with custom design tokens
- Framer Motion (motion/react) for animations
- Recharts for speed trace charts
- Lucide React icons
- Anthropic Claude API (via Netlify Functions)
- OpenF1 API for live telemetry
- Supabase for user preferences

## Getting Started

```bash
npm install
cp .env.example .env.local
# add your ANTHROPIC_API_KEY and Supabase keys
npm run dev
```

For full local testing including Netlify Functions:

```bash
npx netlify dev
```

Then open <http://localhost:8888>.

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Netlify Functions | Powers PaddockIntel, AI chat, driver comparison |
| `VITE_SUPABASE_URL` | Client | User preference persistence |
| `VITE_SUPABASE_ANON_KEY` | Client | User preference persistence |

## Supabase Schema

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  favourite_drivers TEXT[] DEFAULT '{}',
  favourite_teams TEXT[] DEFAULT '{}',
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for matching user_id"
  ON user_preferences FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Deploy to Netlify

1. Push to GitHub.
2. Connect repo in Netlify.
3. Set environment variables (`ANTHROPIC_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Deploy. The `netlify.toml` handles the rest.

## Disclaimer

Not affiliated with Formula 1, FIA or any team. Built for demonstration.
