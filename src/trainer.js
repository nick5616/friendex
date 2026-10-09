// src/trainer.js
// Your own "trainer" profile and the catch codes that let other people add you.
// A catch code is a link with your profile packed into the URL fragment
// (#...), so it never hits a server: friendex.app/catch#<base64url JSON>.

import {
    doc,
    setDoc,
    collection,
    getCountFromServer,
    serverTimestamp,
} from "firebase/firestore";
import { firestoreDb } from "./firebase";

const PROFILE_KEY = "trainerProfile";
const PENDING_KEY = "pendingCatch";
const MAX_ABOUT = 140;
const MAX_INTERESTS = 8;
const BIRTHDAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const UID_RE = /^[A-Za-z0-9]{1,128}$/;

const cleanInterests = (list) =>
    list
        .filter((i) => typeof i === "string" && i.trim())
        .map((i) => i.trim().slice(0, 30))
        .slice(0, MAX_INTERESTS);

export const loadTrainerProfile = (user, isDemoMode) => {
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    } catch {
        // Corrupt or unavailable storage: fall back to the account details
    }
    return {
        name:
            saved.name ??
            (isDemoMode ? "Demo Trainer" : user?.displayName || "Trainer"),
        pronouns: saved.pronouns ?? "",
        about: saved.about ?? "",
        interests: Array.isArray(saved.interests) ? saved.interests : [],
        birthday: saved.birthday ?? "",
    };
};

export const saveTrainerProfile = (profile) => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
        // Storage unavailable: the edit still applies for this session
    }
};

// ---------- Catch codes ----------

const toBase64Url = (text) => {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (encoded) => {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
};

// Short keys keep the QR code small enough to scan easily off a phone screen
export const buildCatchUrl = (profile, user) => {
    const payload = { v: 1, n: profile.name.trim() };
    if (profile.pronouns.trim()) payload.p = profile.pronouns.trim();
    if (profile.about.trim()) payload.a = profile.about.trim().slice(0, MAX_ABOUT);
    if (profile.interests.length) payload.t = cleanInterests(profile.interests);
    if (BIRTHDAY_RE.test(profile.birthday)) payload.b = profile.birthday;
    if (user?.photoURL) payload.i = user.photoURL;
    // Lets the catcher's app log the catch so you can see how many people caught you
    if (user?.uid) payload.u = user.uid;
    return `${window.location.origin}/catch#${toBase64Url(JSON.stringify(payload))}`;
};

// Accepts a full catch URL (from a QR code or a pasted link) or just the fragment.
// Returns null for anything that isn't a valid Friendex catch code.
export const parseCatchCode = (text) => {
    if (!text) return null;
    const hashIndex = text.indexOf("#");
    const fragment = hashIndex >= 0 ? text.slice(hashIndex + 1) : text;
    if (hashIndex >= 0 && !text.slice(0, hashIndex).includes("/catch")) return null;
    try {
        const data = JSON.parse(fromBase64Url(fragment));
        if (data?.v !== 1 || typeof data.n !== "string" || !data.n.trim()) return null;
        const photo =
            typeof data.i === "string" && data.i.startsWith("https://") ? data.i : null;
        return {
            name: data.n.trim().slice(0, 80),
            pronouns: typeof data.p === "string" ? data.p.slice(0, 40) : "",
            about: typeof data.a === "string" ? data.a.slice(0, MAX_ABOUT) : "",
            interests: Array.isArray(data.t) ? cleanInterests(data.t) : [],
            birthday: BIRTHDAY_RE.test(data.b) ? data.b : "",
            photoURL: photo,
            uid: typeof data.u === "string" && UID_RE.test(data.u) ? data.u : null,
        };
    } catch {
        return null;
    }
};

// A catch code opened from the phone camera lands on /catch before the user may be
// signed in or synced. Park it here; the main screen picks it up once it's ready.
export const setPendingCatch = (trainer) => {
    try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(trainer));
    } catch {
        // Ignore: worst case the encounter doesn't appear and they rescan
    }
};

export const getPendingCatch = () => {
    try {
        const raw = sessionStorage.getItem(PENDING_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearPendingCatch = () => {
    try {
        sessionStorage.removeItem(PENDING_KEY);
    } catch {
        // Nothing to clear
    }
};

// ---------- Catch log ----------
// catches/{trainerUid}/by/{catcherUid}: one doc per person who caught you, so
// catching the same trainer twice still counts once. Only the catcher can write
// their own entry and only the trainer can count them (see FIREBASE_SETUP.md).

export const recordCatch = async (trainerUid, catcher) => {
    if (!trainerUid || !catcher?.uid || trainerUid === catcher.uid) return;
    try {
        await setDoc(doc(firestoreDb, "catches", trainerUid, "by", catcher.uid), {
            at: serverTimestamp(),
        });
    } catch (err) {
        // Not worth interrupting a catch over; they just won't show up in the count
        console.warn("Couldn't log catch:", err);
    }
};

export const countCatches = async (uid) => {
    const snap = await getCountFromServer(collection(firestoreDb, "catches", uid, "by"));
    return snap.data().count;
};
