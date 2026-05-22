# Firebase Setup

One-time setup to enable Google Auth + cloud sync.

## Steps

### 1. Create a Firebase project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `friendex` → click through
3. Disable Google Analytics if you don't need it

### 2. Enable Google Auth
1. In the Firebase console → **Authentication** → **Sign-in method**
2. Enable **Google** → set your support email → Save
3. Under **Authorized domains**, add `friendex.online`

### 3. Create Firestore database
1. **Firestore Database** → **Create database**
2. Choose **production mode** → pick a region close to you
3. After creation, go to **Rules** and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Get your web app config
1. Project Overview → **Add app** → Web (</>) icon
2. Register the app (any nickname, skip Firebase Hosting)
3. Copy the `firebaseConfig` values

### 5. Create your .env.local
Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with the values from step 4.

For Netlify/production: add these same env vars in **Site settings → Environment variables**.

### 6. Build & deploy
```bash
npm run build
```
