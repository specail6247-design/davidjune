# EmojiWorld Firebase Schema (V2)

## Collections

### missions
- id (string)
- roomEmoji (string, emoji-only)
- missionEmoji (string, emoji-only)
- bannerEmoji (string, emoji-only)
- type (photo | checkin)
- active (boolean)
- createdAt (timestamp)

### userMissions
- userId (string)
- missionId (string)
- date (YYYY-MM-DD)
- status (active | completed | skipped | expired)
- completedAt (timestamp, optional)
- mediaUrl (string, optional)
- missionEmoji (string, optional)
- autoPosted (boolean, optional)
- createdAt (timestamp)

### posts
- userId (string)
- roomEmoji (string, emoji-only)
- moodEmoji (string, emoji-only)
- captionEmoji (string, emoji-only)
- mediaUrl (string, optional)
- visibility (public | friends)
- createdAt (timestamp)

### userProfiles
- userId (string)
- avatarEmoji (string, emoji-only)
- countryEmoji (string, emoji-only, use 🌍 by default)
- visualIntensity (S | M | L)
- createdAt (timestamp)
- updatedAt (timestamp)

### leaderboardDaily/{date}/entries/{userId}
- userId (string)
- score (number)
- streak (number)
- avatarEmoji (string)
- countryEmoji (string)

### leaderboardWeekly/{weekKey}/entries/{userId}
- userId (string)
- score (number)
- streak (number)
- avatarEmoji (string)
- countryEmoji (string)

### subscriptions
- userId (string)
- plan (basic | plus | elite)
- status (active | canceled)
- currentPeriodStart (YYYY-MM-DD)
- currentPeriodEnd (YYYY-MM-DD)

### info_reveals
- viewerId (string)
- targetUserId (string)
- periodKey (YYYY-MM)
- planAtTime (basic | plus | elite)
- createdAt (timestamp)

### user_gifts
- userId (string)
- giftId (string)
- emoji (string)
- tier (basic | plus | premium | legend)
- active (boolean)
- createdAt (timestamp)

### gift_rate (system)
- lastAt (timestamp)

### reveal_rate (system)
- lastAt (timestamp)

### admin_settings
- auth_mode (uid | email | domain | manual)
- available_scopes (array)

### admin_users
- identity_type (uid | email | domain | manual)
- identity_value (string)
- role (super_admin | staff)
- scopes (array)
- created_at (timestamp)
- created_by (string)

## Storage
- missions/{userId}/{missionId}/{timestamp}.jpg
