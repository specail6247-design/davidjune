# EmojiWorld QA Checklist

## Missions
- Tap mission banner opens photo picker for photo missions.
- Check-in mission completes without photo.
- Completed mission shows ✅ and fades.
- Auto-post badge shows 📸✅ when enabled.
- Skipped mission shows 💤 overlay and fade.
- Expired mission shows 🫥 overlay and fade.
- 7-day history renders status tiles.

## Posts
- New post saves emoji-only fields.
- Caption/mood/room emoji-only validation enforced.
- Media upload (mission) stores in Storage path.

## Auto-post
- AUTO_POST_ON_MISSION=true creates a post automatically.
- AUTO_POST_ON_MISSION=false shows ✅/🕒 decision modal.
- “post now” creates a post, “save only” does not.

## Leaderboard
- Completing a mission updates daily leaderboard entry.
- Weekly leaderboard aggregates scores.
- Top entries render with 🥇🥈🥉 and ⭐ score.
- “me” row highlights.

## Monetization
- Reveal consumes monthly quota and blocks when exhausted.
- Reveal shows emoji-only info.
- Subscription period reset updates quota.
- Gift purchase grants emoji and toggles active state.
- Payment copy appears on upgrade screen.
- Reveal animation follows lock → blur → cards → glow → counter.
- Elite visuals are visual-only.
- No copy implies verification or real personal data access.

## Mobile Gate
- Desktop shows “open on mobile” notice.
- DEV_MODE=1 bypasses gate.

## DEV_MODE QA
- `/app/qa` tools work (seed, simulate photo, expire, leaderboard).
