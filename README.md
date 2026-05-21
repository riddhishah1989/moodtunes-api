# 🎵 MoodTunes GraphQL API

AI-powered music recommendations with Auth. Built with Apollo Server + Node.js + MongoDB.

---

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/moodtunes-graphql
cd moodtunes-graphql
cp .env.example .env      # fill in your keys
npm install
npm run dev               # starts on http://localhost:4000/graphql
```

---

## Example Queries & Mutations

Open Apollo Studio at: `https://studio.apollographql.com/sandbox?endpoint=http://localhost:4000/graphql`

### 1. Sign Up
```graphql
mutation SignUp {
  signUp(input: {
    name: "Ridzwan"
    email: "ridzwan@example.com"
    password: "secret123"
  }) {
    token
    message
    user {
      id
      name
      email
    }
  }
}
```

### 2. Sign In
```graphql
mutation SignIn {
  signIn(input: {
    email: "ridzwan@example.com"
    password: "secret123"
  }) {
    token
    message
    user {
      id
      name
    }
  }
}
```
**→ Copy the `token` from the response. Add it to the Headers panel:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Get All Mood Options
```graphql
query GetMoods {
  moods {
    id
    label
    emoji
    description
    colorHex
  }
}
```

### 4. Get Music Recommendations (requires token)
```graphql
mutation GetRecommendations {
  getRecommendations(input: {
    mood: "Happy"
    customText: "just got a promotion at work!"
    count: 8
    includeSpotify: true
    includeYoutube: true
  }) {
    id
    moodInterpretation
    songCount
    songs {
      title
      artist
      genre
      reason
      energyLevel
      spotifyUrl
      albumArt
      youtubeUrl
    }
  }
}
```

### 5. Get My History (requires token)
```graphql
query MyHistory {
  myHistory(limit: 10, offset: 0) {
    totalCount
    hasMore
    sessions {
      id
      mood
      moodInterpretation
      songCount
      createdAt
    }
  }
}
```

### 6. Get My Profile (requires token)
```graphql
query Me {
  me {
    id
    name
    email
    createdAt
  }
}
```

### 7. Delete a Session (requires token)
```graphql
mutation DeleteSession {
  deleteSession(id: "SESSION_ID_HERE")
}
```

---

## Deployment (Railway + MongoDB Atlas)

### Step 1 — MongoDB Atlas (free database)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create a free cluster (M0 — always free)
3. Database Access → Add user → set username + password
4. Network Access → Add IP → Allow from anywhere (`0.0.0.0/0`)
5. Connect → Drivers → copy the connection string
6. Replace `<password>` with your DB password

### Step 2 — Railway (free hosting)
1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add all environment variables from `.env.example`
4. Copy the Railway public URL → use it as your GraphQL endpoint in the Android app

### Step 3 — Update Android App
In `app/build.gradle.kts`:
```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://your-app.up.railway.app/graphql\"")
```

---

## Environment Variables

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `JWT_SECRET` | Make up any long random string |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `SPOTIFY_CLIENT_ID` | developer.spotify.com/dashboard |
| `SPOTIFY_CLIENT_SECRET` | developer.spotify.com/dashboard |
| `YOUTUBE_API_KEY` | console.cloud.google.com |
