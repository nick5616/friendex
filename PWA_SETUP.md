# Progressive Web App (PWA) Setup

Friendex has been configured as a Progressive Web App (PWA) that can be installed on mobile devices and desktop browsers for offline use.

## Features Implemented

### 1. Web App Manifest (`/public/manifest.json`)

-   App name, description, and theme colors
-   Icons for different sizes (favicon-32x32.png, android-chrome-192x192.png, android-chrome512x512.png)
-   Standalone display mode for native app-like experience
-   App shortcuts for quick access to "Add Friend"
-   Screenshots for app stores

### 2. Service Worker (`/public/sw.js`)

-   Caches all static assets for offline functionality
-   Caches fonts locally to work without internet
-   Implements cache-first strategy for performance
-   Handles offline fallbacks gracefully
-   Background sync support for future features

### 3. Offline Font Support

-   Downloaded Gaegu font files locally (`/public/fonts/`)
-   Created local CSS file to serve fonts offline
-   Removed dependency on Google Fonts CDN

### 4. PWA Installation Prompt

-   Smart install prompt component (`/src/PWAInstallPrompt.jsx`)
-   Detects if app is already installed
-   Respects user dismissal preferences
-   Works on both mobile and desktop browsers

### 5. Meta Tags and Icons

-   Apple Touch Icons for iOS devices
-   Windows tile configuration
-   Theme color and status bar styling
-   Proper viewport configuration

## Installation Instructions

### For Users:

1. **Mobile (iOS/Android):**

    - Open Friendex in your mobile browser
    - Look for "Add to Home Screen" or "Install" prompt
    - Tap the prompt to install the app
    - The app will appear on your home screen like a native app

2. **Desktop (Chrome/Edge/Firefox):**
    - Open Friendex in your browser
    - Look for the install icon in the address bar or install prompt
    - Click "Install" to add to your desktop
    - The app will open in a standalone window

### For Developers:

1. **Replace Icon Placeholders:**

    - Replace `/public/icons/favicon-32x32.png` with your 32x32 icon
    - Replace `/public/icons/android-chrome-192x192.png` with your 192x192 icon
    - Replace `/public/icons/android-chrome512x512.png` with your 512x512 icon

2. **Test PWA Features:**

    ```bash
    npm run build
    npm run preview
    ```

    - Open browser dev tools → Application → Service Workers
    - Check that service worker is registered and active
    - Test offline functionality by going offline in dev tools

3. **PWA Audit:**
    - Use Chrome DevTools → Lighthouse → Progressive Web App
    - Ensure all PWA criteria are met
    - Test installation on different devices

## Offline Functionality

The app works completely offline once installed:

-   All static assets are cached
-   Fonts work without internet connection
-   Data is stored locally using IndexedDB
-   No external dependencies for core functionality

## Browser Support

-   **Chrome/Edge:** Full PWA support with install prompts
-   **Firefox:** Full PWA support with install prompts
-   **Safari (iOS):** "Add to Home Screen" functionality
-   **Safari (macOS):** Limited PWA support

## Future Enhancements

-   Push notifications for friend birthdays
-   Background sync for data backup
-   Offline data synchronization
-   App shortcuts for quick actions
