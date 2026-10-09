// src/WildEncounter.jsx
// "A wild Kyler appeared!" Shown after scanning (or opening) a trainer card's
// catch code. Throwing the ball registers them as a new friend.
import { useState } from "react";
import { motion } from "framer-motion";
import { compressImage } from "./dex";
import FriendAvatar from "./FriendAvatar";
import { recordCatch } from "./trainer";

// Pull their account photo into a local data URL so it syncs like any other
// photo. Remote hosts that block CORS just get the letter placeholder instead.
const fetchPhoto = async (url) => {
    if (!url) return null;
    try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) return null;
        return await compressImage(await res.blob());
    } catch {
        return null;
    }
};

export default function WildEncounter({
    trainer,
    friends,
    currentDb,
    user,
    isDemoMode,
    onCaught,
    onRun,
}) {
    const [throwing, setThrowing] = useState(false);
    const [photoFailed, setPhotoFailed] = useState(false);

    const existing = friends?.find(
        (f) => f.name?.trim().toLowerCase() === trainer.name.toLowerCase()
    );

    const handleThrow = async () => {
        setThrowing(true);
        const today = new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        const profilePicture = await fetchPhoto(trainer.photoURL);
        const newFriendId = await currentDb.friends.add({
            name: trainer.name,
            pronouns: trainer.pronouns,
            profilePicture,
            tags: [],
            about: {
                description: trainer.about,
                interests: trainer.interests ?? [],
                loveLanguages: [],
            },
            keyInfo: {
                birthday: trainer.birthday ?? "",
                howWeMet: `Scanned their trainer card on ${today}`,
                relationships: [],
            },
            notes: "",
            createdAt: new Date(),
        });
        if (!isDemoMode) recordCatch(trainer.uid, user);
        onCaught(newFriendId);
    };

    const showPhoto = trainer.photoURL && !photoFailed;

    return (
        <motion.div
            className="fixed inset-0 z-[56] flex items-end sm:items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                role="dialog"
                aria-label={`Wild ${trainer.name} appeared`}
                className="w-full max-w-md bg-white border-[2.5px] border-stone-900 overflow-hidden safe-bottom"
                style={{ borderRadius: "20px 20px 0 0" }}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
            >
                {/* Battle scene */}
                <div
                    className="relative h-56 overflow-hidden"
                    style={{
                        background:
                            "linear-gradient(180deg, #bae6fd 0%, #e0f2fe 55%, #bbf7d0 55%, #86efac 100%)",
                    }}
                >
                    <div
                        className="absolute left-1/2 -translate-x-1/2 bottom-6 w-56 h-12 rounded-[50%]"
                        style={{ background: "#4ade80", boxShadow: "inset 0 -6px 0 #16a34a" }}
                    />
                    <motion.div
                        className="absolute left-1/2 bottom-12 w-32 h-32 rounded-full border-[3px] border-stone-900 bg-white overflow-hidden"
                        initial={{ x: 220, opacity: 0 }}
                        animate={
                            throwing
                                ? { scale: 0, opacity: 0, x: "-50%" }
                                : { x: "-50%", opacity: 1 }
                        }
                        transition={
                            throwing
                                ? { duration: 0.35, delay: 0.25 }
                                : { type: "spring", stiffness: 140, damping: 16 }
                        }
                    >
                        <FriendAvatar
                            name={trainer.name}
                            src={showPhoto ? trainer.photoURL : null}
                            referrerPolicy="no-referrer"
                            onError={() => setPhotoFailed(true)}
                        />
                    </motion.div>
                    {throwing && (
                        <motion.img
                            src="/icons/android-chrome512x512.png?v=2"
                            alt=""
                            className="absolute w-14 h-14"
                            initial={{ left: "-10%", bottom: "-10%", rotate: 0 }}
                            animate={{ left: "42%", bottom: "38%", rotate: 540 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    )}
                </div>

                {/* Dialogue box */}
                <div className="p-4 flex flex-col gap-3">
                    <div className="dex-card !p-4">
                        <p className="text-2xl font-bold leading-tight">
                            A wild {trainer.name} appeared!
                        </p>
                        {trainer.pronouns && (
                            <span className="dex-pill mt-2">{trainer.pronouns}</span>
                        )}
                        {trainer.about && (
                            <p className="text-lg text-stone-700 mt-2 leading-snug">
                                “{trainer.about}”
                            </p>
                        )}
                        {trainer.interests?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {trainer.interests.map((interest) => (
                                    <span key={interest} className="dex-pill !text-xs">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        )}
                        {existing && (
                            <p className="text-base text-amber-800 mt-2">
                                You already have a {existing.name} in your Friendex.
                                Catching adds another entry.
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onRun}
                            disabled={throwing}
                            className="dex-btn border-2 border-stone-800 bg-white text-stone-800 shadow-[3px_3px_0_#1c1917]"
                        >
                            Run
                        </button>
                        <button
                            onClick={handleThrow}
                            disabled={throwing}
                            className="dex-btn border-2 border-stone-800 text-white shadow-[3px_3px_0_#1c1917] flex items-center justify-center gap-2"
                            style={{
                                background: "var(--color-shell)",
                                textShadow: "1px 1px 0 rgba(0,0,0,0.35)",
                            }}
                        >
                            <img
                                src="/icons/android-chrome512x512.png?v=2"
                                alt=""
                                className="w-6 h-6"
                            />
                            {throwing ? "Throwing…" : "Throw ball"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
