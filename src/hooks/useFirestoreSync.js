import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestoreDb } from "../firebase";
import { db } from "../db";

// Module-level: persists across component unmount/remount within the same JS session
// (navigation causes App to remount, but this Set survives). Resets on page reload,
// which is intentional — we want to re-sync from Firestore after a reload.
const syncedUsers = new Set();

// Syncs Dexie friends to Firestore for authenticated non-demo users.
// Profile pictures are stripped before cloud writes to stay under Firestore's 1MB doc limit.
export function useFirestoreSync(user, friends, isDemoMode) {
    const saveTimerRef = useRef(null);
    const [initialSyncDone, setInitialSyncDone] = useState(false);

    // On first mount per session: Firestore is the source of truth when it has data.
    // If Firestore has friends → replace local Dexie (preserving profile pictures by name).
    // If Firestore is empty → push local data up to Firestore.
    // Skipped on subsequent mounts (navigation) so imported data isn't wiped before it can push.
    useEffect(() => {
        if (!user || isDemoMode) {
            setInitialSyncDone(true);
            return;
        }

        if (syncedUsers.has(user.uid)) {
            setInitialSyncDone(true);
            return;
        }

        // Reset to false so the redirect in App can't fire while Dexie is being cleared/reloaded
        setInitialSyncDone(false);

        const syncOnLogin = async () => {
            try {
                const docRef = doc(firestoreDb, "users", user.uid);
                const snap = await getDoc(docRef);
                const cloudFriends = snap.exists() ? (snap.data().friends ?? []) : [];

                if (cloudFriends.length > 0) {
                    // Firestore has data — it wins. Preserve any local profile pictures by name.
                    const localFriends = await db.friends.toArray();
                    const picsByName = {};
                    for (const f of localFriends) {
                        if (f.profilePicture) picsByName[f.name] = f.profilePicture;
                    }
                    await db.friends.clear();
                    const toImport = cloudFriends.map(({ id, ...f }) => ({
                        ...f,
                        ...(picsByName[f.name] ? { profilePicture: picsByName[f.name] } : {}),
                    }));
                    await db.friends.bulkAdd(toImport);
                } else {
                    // Firestore is empty — seed it from whatever is local.
                    const localFriends = await db.friends.toArray();
                    if (localFriends.length > 0) {
                        const friendsForCloud = localFriends.map(
                            ({ profilePicture: _pic, ...f }) => f
                        );
                        await setDoc(docRef, { friends: friendsForCloud });
                    }
                }
            } catch (err) {
                console.error("Failed to sync with Firestore on login:", err);
            }
            syncedUsers.add(user.uid);
            setInitialSyncDone(true);
        };

        syncOnLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid, isDemoMode]);

    // After every local change, debounce-push to Firestore (without profile pictures)
    useEffect(() => {
        if (!user || isDemoMode || !initialSyncDone || friends === undefined) return;

        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            const friendsForCloud = friends.map(
                ({ profilePicture: _pic, ...f }) => f
            );
            setDoc(doc(firestoreDb, "users", user.uid), { friends: friendsForCloud }).catch(
                (err) => console.error("Firestore sync failed:", err)
            );
        }, 800);

        return () => clearTimeout(saveTimerRef.current);
    }, [friends, user, isDemoMode, initialSyncDone]);

    return { initialSyncDone };
}
