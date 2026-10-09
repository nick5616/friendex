import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { firestoreDb } from "../firebase";
import { db } from "../db";
import { hasRealPhoto, makeSprite, newPhotoId } from "../dex";

// Module-level: persists across component unmount/remount within the same JS session
// (navigation causes App to remount, but this Set survives). Resets on page reload,
// which is intentional — we want to re-sync from Firestore after a reload.
const syncedUsers = new Set();

// Set while deleting the account so a pending push can't write the data back.
// Cleared by the page reload that follows.
let halted = false;
export const haltCloudSync = () => {
    halted = true;
};
export const resumeCloudSync = () => {
    halted = false;
};

// Photos live in users/{uid}/photos/{photoId}, one small doc each, so the main
// friends doc stays under Firestore's 1MB limit. Friends reference them by photoId.
// A new/changed photo has photoId cleared; the push step assigns a fresh id and
// uploads it. Only a 64px sprite goes to the cloud — the full photo stays on the
// device that has it. We remember which ids this device has uploaded so we only
// send new ones, and can clean up photos that are no longer referenced.
const photoRef = (uid, photoId) =>
    doc(firestoreDb, "users", uid, "photos", photoId);

const uploadedKey = (uid) => `friendex_uploadedSprites_${uid}`;
// Ids uploaded as full JPEGs before sprites existed. Re-uploaded as sprites
// (same id, overwriting the big doc) and still cleaned up when unreferenced.
const legacyKey = (uid) => `friendex_uploadedPhotos_${uid}`;

const loadIds = (key) => {
    try {
        return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
        return new Set();
    }
};

const saveIds = (key, set) => {
    try {
        if (set.size === 0) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
        // Storage full/unavailable: worst case we re-upload a photo later
    }
};

const stripForCloud = (friends) =>
    friends.map(({ profilePicture: _pic, ...f }) => f);

// Syncs Dexie friends to Firestore for authenticated non-demo users.
export function useFirestoreSync(user, friends, isDemoMode) {
    const saveTimerRef = useRef(null);
    // Which account the initial sync finished for, so a stale "done" from the
    // signed-out state can't leak into the first render after signing in
    const syncKey = !user || isDemoMode ? "none" : user.uid;
    const [syncedFor, setSyncedFor] = useState(null);
    const initialSyncDone = syncedFor === syncKey;

    // On first mount per session: Firestore is the source of truth when it has data.
    // If Firestore has friends → replace local Dexie (keeping/fetching photos).
    // If Firestore is empty → push local data up to Firestore.
    // Skipped on subsequent mounts (navigation) so imported data isn't wiped before it can push.
    useEffect(() => {
        if (!user || isDemoMode || syncedUsers.has(user.uid)) {
            setSyncedFor(syncKey);
            return;
        }

        const syncOnLogin = async () => {
            try {
                const docRef = doc(firestoreDb, "users", user.uid);
                const snap = await getDoc(docRef);
                const cloudFriends = snap.exists() ? (snap.data().friends ?? []) : [];

                if (cloudFriends.length > 0) {
                    // Firestore has data — it wins. Reuse local photos where we can,
                    // fetch the rest from the cloud.
                    const localFriends = await db.friends.toArray();
                    const picsById = {};
                    const picsByName = {};
                    for (const f of localFriends) {
                        if (!f.profilePicture) continue;
                        if (f.photoId) picsById[f.photoId] = f.profilePicture;
                        picsByName[f.name] ??= f.profilePicture;
                    }

                    const uploaded = loadIds(uploadedKey(user.uid));
                    const toImport = await Promise.all(
                        cloudFriends.map(async ({ id: _id, profilePicture: _p, ...f }) => {
                            let pic = f.photoId ? picsById[f.photoId] : undefined;
                            if (!pic && f.photoId) {
                                try {
                                    const photoSnap = await getDoc(photoRef(user.uid, f.photoId));
                                    if (photoSnap.exists()) {
                                        pic = photoSnap.data().data;
                                        // Already in the cloud; nothing for this device to send
                                        uploaded.add(f.photoId);
                                    }
                                } catch (err) {
                                    console.warn(`Couldn't fetch photo for ${f.name}:`, err);
                                }
                            }
                            // Legacy friends (or a failed fetch): fall back to the local photo by name
                            pic ??= picsByName[f.name];
                            return pic ? { ...f, profilePicture: pic } : f;
                        })
                    );
                    saveIds(uploadedKey(user.uid), uploaded);

                    await db.transaction("rw", db.friends, async () => {
                        await db.friends.clear();
                        await db.friends.bulkAdd(toImport);
                    });
                } else {
                    // Firestore is empty — seed it from whatever is local.
                    const localFriends = await db.friends.toArray();
                    if (localFriends.length > 0 && !halted) {
                        await setDoc(docRef, { friends: stripForCloud(localFriends) });
                    }
                }
            } catch (err) {
                console.error("Failed to sync with Firestore on login:", err);
            }
            syncedUsers.add(user.uid);
            setSyncedFor(user.uid);
        };

        syncOnLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, isDemoMode]);

    // After every local change, debounce-push to Firestore
    useEffect(() => {
        if (!user || isDemoMode || !initialSyncDone || friends === undefined) return;

        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            if (halted) return;
            // 1. Give new/changed photos an id. Updating Dexie re-triggers this
            //    effect, and the next run pushes everything with the ids in place.
            const needIds = friends.filter((f) => hasRealPhoto(f) && !f.photoId);
            if (needIds.length > 0) {
                await Promise.all(
                    needIds.map((f) => db.friends.update(f.id, { photoId: newPhotoId() }))
                );
                return;
            }

            // 2. Friend records (without photo data)
            if (halted) return;
            try {
                await setDoc(doc(firestoreDb, "users", user.uid), {
                    friends: stripForCloud(friends),
                });
            } catch (err) {
                console.error("Firestore sync failed:", err);
                return;
            }

            // 3. Upload sprites for photos this device hasn't sent yet
            const uploaded = loadIds(uploadedKey(user.uid));
            const legacy = loadIds(legacyKey(user.uid));
            for (const f of friends) {
                if (halted) return;
                if (!hasRealPhoto(f) || !f.photoId || uploaded.has(f.photoId)) continue;
                try {
                    await setDoc(photoRef(user.uid, f.photoId), {
                        data: await makeSprite(f.profilePicture),
                        updatedAt: Date.now(),
                    });
                    uploaded.add(f.photoId);
                    legacy.delete(f.photoId);
                } catch (err) {
                    console.error(`Photo upload failed for ${f.name}:`, err);
                }
            }

            // 4. Delete photos we uploaded that no friend points to anymore
            const referenced = new Set(friends.map((f) => f.photoId).filter(Boolean));
            for (const photoId of new Set([...uploaded, ...legacy])) {
                if (referenced.has(photoId)) continue;
                try {
                    await deleteDoc(photoRef(user.uid, photoId));
                    uploaded.delete(photoId);
                    legacy.delete(photoId);
                } catch (err) {
                    console.warn("Couldn't delete old photo:", err);
                }
            }

            saveIds(uploadedKey(user.uid), uploaded);
            saveIds(legacyKey(user.uid), legacy);
        }, 800);

        return () => clearTimeout(saveTimerRef.current);
    }, [friends, user, isDemoMode, initialSyncDone]);

    return { initialSyncDone };
}
