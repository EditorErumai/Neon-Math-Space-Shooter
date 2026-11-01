# Build status — 1 November 2026

This is an improved browser prototype / integration starter, not a production-complete public release.

## Included and implemented in this package
- Responsive multi-screen web shell (Home, Game, Leaderboard, Hangar, Profile, Achievements, Settings)
- Endless single-question / three-lane maths gameplay; addition, subtraction, multiplication (1–12 operands), division
- Fixed horizontal starting row for all three answer tiles; stable left/centre/right lanes
- Correct/wrong/missed-answer life rules
- Keyboard and touch controls, pause/resume, restart
- Score, lives, levels, streaks, local stats and local leaderboard
- Score-based cosmetic ship unlocks and selection
- Dimension transition starter at 500-point milestones
- Basic synthesized shooting/correct/wrong sound effects with mute and SFX volume controls
- Reduced-motion setting stored locally (additional motion tuning remains to be completed)
- PWA manifest and service-worker starter
- Supabase schema and score-function starter, plus security checklist

## Not complete / not production-ready
- Supabase browser authentication, password recovery, profile sync and account deletion UI
- Global top-10 leaderboard integration
- Trusted server-side game-session validation, anti-cheat/rate limiting and secure score acceptance
- Fully implemented staff dashboard, role management, moderation and audit logs
- Reliable offline score queue and later server sync
- Full mix-and-match ship part editor and persistent part inventory
- Music playback/assets and complete sound settings integration
- Full accessibility audit, device/browser QA, penetration/security review and deployment verification

Do not publish this package as a secure competitive online game until the incomplete items are implemented and independently tested. Never place a Supabase service-role key in browser code.
