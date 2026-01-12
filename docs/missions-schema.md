# EmojiWorld Missions Schema

## Collections

### missions (global definitions)
- id (string)
- mission_emoji (string, emoji-only)
- banner_emoji (string, emoji-only, 1-2 emoji)
- type (string: photo | checkin)
- active (boolean)

### user_missions (per user)
- user_id (string)
- mission_id (string)
- assigned_date (string, YYYY-MM-DD)
- completed (boolean)
- completed_at (timestamp, optional)
- media_url (string, optional)

### user_stamps
- user_id (string)
- date (string, YYYY-MM-DD)
- created_at (timestamp)

### slot_ledger
- user_id (string)
- delta (number)
- reason (string: stamp_reward)
- reward_key (string, YYYY-Www)
- created_at (timestamp)

### user_notifications
- user_id (string)
- emoji (string, emoji-only)
- created_at (timestamp)

### mission_rejections (system)
- mission_id (string)
- mission_emoji (string | null)
- banner_emoji (string | null)
- created_at (timestamp)

## Storage
- missions/{userId}/{missionId}/{timestamp}.jpg

## Notes
- missions are validated for emoji-only values in `functions/index.js`.
- user_missions are assigned per day and marked completed on upload/check-in.
