# Friendex Dex

Friendex is a Pokedex-style personal relationship manager designed to help you remember and strengthen your connections with friends, family, and partners. It acts as an external memory aid, allowing you to keep track of important information about the people in your life, all in one private, offline-first application.

The core philosophy is to convert passive knowledge into active connection by reducing the cognitive load of relationship maintenance.

## ✨ Core Features (Vision)

-   **Offline-First:** Runs entirely in your browser. All data is stored locally on your device using IndexedDB, ensuring complete privacy.
-   **Tactile Interface:** A "rolling index" UI inspired by the classic Rolodex and Pokedex, designed to be fun and engaging.
-   **Rich Profiles:** Store everything from contact info and social media handles to birthdays, interests, gift ideas, and personal notes.
-   **Easy Sharing:** Generate a QR code of your public profile to quickly and easily exchange information with new friends.
-   **Data Portability:** Export your entire friend database to a single JSON file for backup and import it on any device.
-   **Installable PWA:** Install Friendex to your phone's home screen for a native app-like experience.

## 🚀 Tech Stack

This project is a modern, frontend-only application built with:

-   **Vite:** A blazing-fast build tool for modern web development.
-   **React:** A JavaScript library for building user interfaces.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **Framer Motion:** A production-ready motion library for creating fluid animations and the core "rolling index" experience.
-   **Dexie.js:** A minimalist wrapper for IndexedDB that makes client-side storage powerful and easy to use.

## 🛠️ Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18.x or higher is recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation & Setup

1.  **Clone the repository (or set up from scratch):**

    ```bash
    # Note: If you've already created the project, you can skip this part
    # and just use these instructions for future reference.
    git clone https://your-repo-url/friendex.git
    cd friendex
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Open your browser and navigate to `http://localhost:5173` (or the URL provided in your terminal).

## 📜 Available Scripts

In the project directory, you can run:

-   `npm run dev`: Starts the development server with Hot Module Replacement (HMR).
-   `npm run build`: Bundles the app for production into the `dist` folder.
-   `npm run lint`: Lints the project files using ESLint.
-   `npm run preview`: Serves the production build locally to preview it before deployment.

---

This project is a personal tool and a journey in creating intentional, beautifully designed software.
