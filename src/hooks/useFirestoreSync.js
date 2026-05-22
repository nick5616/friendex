import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestoreDb } from "../firebase";
import { db } from "../db";

// Syncs Dexie friends to Firestore for authenticated non-demo users.
// Profile pictures are stripped before cloud writes to stay under Firestore's 1MB doc limit.
// On first login with empty local DB, data is loaded FROM Firestore into Dexie.
export function useFirestoreSync(user, friends, isDemoMode) {
    const saveTimerRef = useRef(null);
    const [initialSyncDone, setInitialSyncDone] = useState(false);

    // On login: if local Dexie is empty, pull friends from Firestore
    useEffect(() => {
        if (!user || isDemoMode) {
            setInitialSyncDone(true);
            return;
        }

        const loadFromCloud = async () => {
            const localFriends = await db.friends.toArray();
            if (localFriends.length === 0) {
                try {
                    const docRef = doc(firestoreDb, "users", user.uid);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        const cloudFriends = snap.data().friends ?? [];
                        if (cloudFriends.length > 0) {
                            // Strip id so Dexie generates fresh auto-increment IDs
                            const toImport = cloudFriends.map(({ id, ...f }) => f);
                            await db.friends.bulkAdd(toImport);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load friends from Firestore:", err);
                }
            }
            setInitialSyncDone(true);
        };

        loadFromCloud();
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
