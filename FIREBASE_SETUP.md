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
    // The user doc (friends list). Firestore's 1MB doc limit caps its size.
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // One 64px sprite per photo. The size cap keeps a modified client from
    // filling storage with full-size images.
    match /users/{userId}/photos/{photoId} {
      allow read, delete: if request.auth != null && request.auth.uid == userId;
      allow create, update: if request.auth != null
        && request.auth.uid == userId
        && request.resource.data.keys().hasOnly(['data', 'updatedAt'])
        && request.resource.data.data is string
        && request.resource.data.data.size() <= 16000;
    }
    // Catch log: one doc per person who caught a trainer. The catcher writes
    // their own entry; only the trainer can read (count) them. The trainer can
    // delete them when deleting their account.
    match /catches/{trainerId}/by/{catcherId} {
      allow create, update: if request.auth != null
        && request.auth.uid == catcherId
        && catcherId != trainerId
        && request.resource.data.keys().hasOnly(['at']);
      allow read, delete: if request.auth != null && request.auth.uid == trainerId;
    }
  }
}
```

The "Caught you" count on the trainer card reads `catches/{uid}/by`. Without
the `catches` rule, catching still works but the count stays at "–".

Friend photos are stored one per document in `users/{uid}/photos/{photoId}`
as 64px JPEG sprites (a few KB each). Full photos stay on the device that
added them; other devices show the sprite. Devices that still hold a full
photo overwrite its old full-size cloud copy with a sprite on their next sync.
If you set up an older rule, replace it with the one above — otherwise photos
won't sync, or big uploads won't be blocked. See `SCALING.md` for why.

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
