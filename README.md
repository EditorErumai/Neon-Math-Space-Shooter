# Neon Math Space Shooter — Vetri Vel Productions

A responsive browser-based endless maths arcade prototype.

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a modern browser. For service-worker/PWA testing, serve this folder over localhost or HTTPS.
3. Use Left/Right or A/D to move, Space to fire. On touch screens use the on-screen controls.

## Gameplay
- One maths question and three falling answer tiles in fixed left/centre/right lanes.
- Correct answer: +10 points and streak.
- Wrong answer: lose one life.
- Missing the correct answer: lose one life. Missing wrong options is harmless.
- Multiplication operands are limited to 1–12.
- Dimension transition milestones are every 500 points.

## Data and privacy
Current profile, achievements and leaderboard are stored locally in this browser using localStorage. They are not shared online and can be cleared in Settings. Do not enter personal or sensitive information.

## Supabase starter
See `supabase/schema.sql`, `supabase/functions/submit-score/index.ts`, and `docs/LAUNCH_SECURITY_CHECKLIST.md`. These are integration starters, not a complete anti-cheat system. Configure and test server-side validation before accepting public scores. Never expose a service-role key in client code.

## Honest release status
See `BUILD_STATUS.md` for implemented features and remaining work. This is not yet a production-ready online release: authentication, global leaderboard integration, secure run validation, moderation dashboard, offline score sync, full customisation and complete QA remain unfinished.
