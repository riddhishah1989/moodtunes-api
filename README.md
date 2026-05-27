# 🎵 MoodTunes API

> **"Spotify knows what you listened to. MoodTunes knows how you feel."**

AI-powered mood-based music recommendation API. Built with **Node.js + Express + MongoDB**, powered by **Claude AI**, enriched with **Spotify** and **YouTube**.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

---

## What makes MoodTunes different

| Feature | Spotify | Apple Music | MoodTunes |
|---|---|---|---|
| Music recommendations | Based on history | Based on history | Based on **current emotion** |
| Natural language input | ❌ | ❌ | ✅ "just had a fight with my friend" |
| Mood journal | ❌ | ❌ | ✅ |
| AI personal insights | ❌ | ❌ | ✅ |
| "Why this song fits your mood" | ❌ | ❌ | ✅ |
| Share a mood playlist | ❌ | ❌ | ✅ |
| Spotify + YouTube in one app | ❌ | ❌ | ✅ |

---

## Tech Stack

- **Runtime** — Node.js 18+
- **Framework** — Express 4
- **Database** — MongoDB + Mongoose (Atlas free tier)
- **AI** — Claude API (Anthropic — claude-sonnet-4-20250514)
- **Music** — Spotify Web API + YouTube Data API v3
- **Auth** — JWT (jsonwebtoken + bcryptjs)
- **Architecture** — MVC + Repository Pattern
- **Hosting** — Railway.app

---

## Architecture

```
src/
├── config/          ← JWT auth, database, constants
├── controllers/     ← HTTP request handlers (routes)
├── middleware/       ← Shared auth middleware
├── models/          ← Mongoose schemas
├── repositories/    ← All database queries
└── services/        ← Claude AI, Spotify, YouTube
```

---

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/moodtunes-graphql-api
cd moodtunes-graphql-api
cp .env.example .env      # fill in your keys (see Environment Variables below)
npm install
npm run dev               # starts on http://localhost:4000
```

Test it:
```bash
curl http://localhost:4000/api/v1/health
```

---

## API Endpoints

### Public (no token needed)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check + DB status |
| GET | `/api/v1/moods` | All 8 preset moods |
| GET | `/api/v1/moods/:id` | Single mood by ID |
| GET | `/api/v1/genres` | All 50 genres |
| GET | `/api/v1/genres/:id` | Single genre |
| POST | `/api/v1/genres/seed` | Seed genres (run once) |
| GET | `/api/v1/spotify/search?q=` | Search Spotify tracks |
| GET | `/api/v1/youtube/search?q=` | Search YouTube videos |
| GET | `/api/v1/share/:sessionId` | View shared playlist |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Create account |
| POST | `/api/v1/auth/signin` | Sign in → get token |
| GET | `/api/v1/auth/me` | Get my profile 🔒 |
| PUT | `/api/v1/auth/profile` | Update profile 🔒 |
| PUT | `/api/v1/auth/password` | Change password 🔒 |
| DELETE | `/api/v1/auth/account` | Delete account + all data 🔒 |

### Recommendations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/recommendations` | Get AI music recommendations 🔒 |

### History

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/history` | All past sessions 🔒 |
| GET | `/api/v1/history/:id` | Single session 🔒 |
| DELETE | `/api/v1/history/:id` | Delete session 🔒 |
| DELETE | `/api/v1/history` | Clear all history 🔒 |

### Favourites

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/favourites` | All saved songs 🔒 |
| POST | `/api/v1/favourites` | Save a song 🔒 |
| GET | `/api/v1/favourites/:songId/check` | Is this song saved? 🔒 |
| DELETE | `/api/v1/favourites/:songId` | Remove song 🔒 |
| DELETE | `/api/v1/favourites` | Clear all 🔒 |

### Mood Journal

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/journal` | Create journal entry 🔒 |
| GET | `/api/v1/journal` | All journal entries 🔒 |
| GET | `/api/v1/journal/:id` | Single entry 🔒 |
| DELETE | `/api/v1/journal/:id` | Delete entry 🔒 |
| DELETE | `/api/v1/journal` | Clear all entries 🔒 |

### Insights

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/insights` | AI-powered mood + music analysis 🔒 |

### Share

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/share` | Generate shareable playlist link 🔒 |
| GET | `/api/v1/share/:sessionId` | View shared playlist (public) |

> 🔒 Requires `Authorization: Bearer YOUR_TOKEN` header

---

## Example Requests

### Sign up
```bash
curl -X POST https://your-api.up.railway.app/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ridzwan",
    "email": "ridzwan@example.com",
    "password": "MoodTunes@1"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Ridzwan",
      "email": "ridzwan@example.com",
      "isVerified": false,
      "createdAt": "2026-05-27T10:00:00.000Z"
    },
    "message": "Welcome to MoodTunes, Ridzwan! 🎵"
  }
}
```

### Get music recommendations (requires token)
```bash
curl -X POST https://your-api.up.railway.app/api/v1/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mood": "Happy",
    "custom_text": "just got a promotion at work!",
    "count": 3,
    "include_spotify": true,
    "include_youtube": true
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "session_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "mood_input": "Happy",
    "mood_interpretation": "Upbeat celebratory energy — perfect for anthems that make you move.",
    "count": 3,
    "recommendations": [
      {
        "title": "Happy",
        "artist": "Pharrell Williams",
        "genre": "Pop / Soul",
        "reason": "The quintessential feel-good anthem.",
        "spotify_url": "https://open.spotify.com/track/...",
        "album_art": "https://i.scdn.co/image/...",
        "youtube_url": "https://www.youtube.com/watch?v=..."
      }
    ]
  }
}
```

### Add journal entry (requires token)
```bash
curl -X POST https://your-api.up.railway.app/api/v1/journal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mood": "Happy",
    "rating": 5,
    "note": "Got a promotion today, feeling amazing!"
  }'
```

### Get AI insights (requires token)
```bash
curl https://your-api.up.railway.app/api/v1/insights \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "has_data": true,
    "period_days": 30,
    "most_common_mood": { "mood": "Focused", "emoji": "🎯", "count": 12 },
    "mood_breakdown": [
      { "mood": "Focused", "emoji": "🎯", "count": 12, "avg_rating": 4.2 },
      { "mood": "Happy",   "emoji": "😊", "count": 8,  "avg_rating": 4.8 }
    ],
    "top_genres": [
      { "genre": "Lo-Fi", "count": 24 },
      { "genre": "Pop",   "count": 18 }
    ],
    "ai_insight": "You gravitate towards Lo-Fi during focused work sessions, and your mood ratings are consistently highest after Happy playlists. Wednesday mornings seem to be your most productive listening time."
  }
}
```

### Share a playlist (requires token)
```bash
curl -X POST https://your-api.up.railway.app/api/v1/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{ "session_id": "665f1a2b3c4d5e6f7a8b9c0d" }'
```

Response:
```json
{
  "success": true,
  "data": {
    "share_url": "https://your-api.up.railway.app/api/v1/share/665f1a2b3c4d5e6f7a8b9c0d",
    "mood": "Happy",
    "song_count": 8,
    "message": "Share this link with anyone to show your playlist!"
  }
}
```

---

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (`@$!%*?&_#^`)
- No spaces

Example valid password: `MoodTunes@1`

---

## Deployment

### Step 1 — MongoDB Atlas (free database)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create a free **M0** cluster → choose **AWS Singapore (ap-southeast-1)**
3. Database Access → Add user → Auto-generate password → save it
4. Network Access → Add IP → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Clusters → Connect → Drivers → copy the connection string
6. Replace `<password>` with your DB password, add `/moodtunes` at the end

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - MoodTunes API"
git remote add origin https://github.com/YOUR_USERNAME/moodtunes-graphql-api.git
git push -u origin master
```

### Step 3 — Deploy to Railway
1. Go to [railway.app](https://railway.app) → Sign in with GitHub
2. New Project → Deploy from GitHub → select `moodtunes-graphql-api`
3. Click your service → **Variables** → add all env vars from table below
4. Click **Settings** → **Networking** → **Generate Domain**
5. Your API is live at `https://your-app.up.railway.app`

### Step 4 — Seed genres (run once after deploy)
```bash
curl -X POST https://your-app.up.railway.app/api/v1/genres/seed
```

### Step 5 — Update Android app
In `app/build.gradle.kts`:
```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://your-app.up.railway.app/\"")
```

---

## Environment Variables

| Variable | Where to get it | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers | ✅ |
| `JWT_SECRET` | Any long random string (min 32 chars) | ✅ |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` | ✅ |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | ✅ |
| `SPOTIFY_CLIENT_ID` | [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) | ✅ |
| `SPOTIFY_CLIENT_SECRET` | [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) | ✅ |
| `YOUTUBE_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) | ✅ |
| `PORT` | `4000` | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `APP_BASE_URL` | Your Railway URL e.g. `https://your-app.up.railway.app` | Optional |

---

## Git Branching Strategy

```
dev     ← development branch (work here)
master  ← production branch (Railway deploys from here)
```

```bash
# Work on dev
git checkout dev
git add .
git commit -m "your change"
git push origin dev

# Deploy to production
git checkout master
git merge dev
git push origin master   # Railway auto-deploys
git checkout dev
```

---

## Related Repository

**Android App** → [moodtunes-android](https://github.com/YOUR_USERNAME/moodtunes-android)
Built with Kotlin + Jetpack Compose + MVVM + Hilt

---

## License

MIT
