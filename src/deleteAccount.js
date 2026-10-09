// src/deleteAccount.js
// Deletes the signed-in account and every trace of it: the cloud friends doc,
// photo sprites, the catch log, the Firebase Auth user, and everything this
// browser stores for the app. Cloud first, so a failure leaves the account
// intact to retry; local last, so nothing local can sync back up.

import { collection, doc, getDocs, deleteDoc } from "firebase/firestore";
import { deleteUser, reauthenticateWithPopup } from "firebase/auth";
import { auth, firestoreDb, googleProvider } from "./firebase";
import { haltCloudSync, resumeCloudSync } from "./hooks/useFirestoreSync";
import { db } from "./db";
import { demoDb } from "./demoDb";

const deleteCollection = async (ref) => {
    const snap = await getDocs(ref);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
};

export const wipeLocalData = async () => {
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch {
        // Storage unavailable: nothing stored there to clear
    }
    db.close();
    demoDb.close();
    await Promise.all([db.delete(), demoDb.delete()]);
    if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
    }
    if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
    }
};

// Must be called straight from a click: the re-auth popup needs the user gesture.
export const deleteAccountAndData = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not signed in");

    // Firebase only deletes accounts with a fresh sign-in
    await reauthenticateWithPopup(user, googleProvider);

    // Stop the debounced push so it can't recreate the doc mid-delete
    haltCloudSync();
    try {
        const uid = user.uid;
        await deleteCollection(collection(firestoreDb, "users", uid, "photos"));
        await deleteCollection(collection(firestoreDb, "catches", uid, "by"));
        await deleteDoc(doc(firestoreDb, "users", uid));
        await deleteUser(user);
    } catch (err) {
        // Account still exists; let the local data sync back up
        resumeCloudSync();
        throw err;
    }
    try {
        await wipeLocalData();
    } catch (err) {
        // The account is gone either way; whatever's left can't sync anywhere
        console.error("Couldn't fully clear local data:", err);
    }
};
