// src/UnlockCelebration.jsx
// "New unlock!" card for milestones you just crossed. At 10 friends it also
// just asks whether you like it — no strings attached, the answer stays here.
import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Heart } from "lucide-react";
import Burst from "./Burst";

const LIKES_KEY = "friendex_likesIt";

const REPLIES = {
    yes: "Yay! There's a lot more to unlock. Keep catching!",
    meh: "Fair! It gets better the more friends you catch.",
};

export default function UnlockCelebration({ unlocks, best, onDone }) {
    const asks = unlocks.some((m) => m.ask);
    const [answer, setAnswer] = useState(null);

    const reply = (value) => {
        setAnswer(value);
        try {
            localStorage.setItem(LIKES_KEY, value);
        } catch {
            // Nothing depends on it
        }
    };

    const waitingOnAnswer = asks && !answer;

    return (
        <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={waitingOnAnswer ? undefined : onDone}
            role="dialog"
            aria-label="New unlock"
        >
            <motion.div
                className="relative dex-card w-full max-w-xs text-center"
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                onClick={(e) => e.stopPropagation()}
            >
                <Burst burstKey="unlock" shape="confetti" count={18} distance={140} />
                <div className="font-pixel text-xs text-stone-500">
                    {best} FRIENDS REGISTERED
                </div>
                <div
                    className="text-4xl font-bold mt-1 flex items-center justify-center gap-2"
                    style={{ color: "var(--color-title)" }}
                >
                    <Gift className="w-8 h-8" />
                    {unlocks.length > 1 ? "New unlocks!" : "New unlock!"}
                </div>

                <ul className="flex flex-col gap-2 mt-3 text-left">
                    {unlocks.map((m) => (
                        <li key={m.key} className="dex-card-muted !p-2">
                            <div className="text-xl font-bold leading-tight">{m.name}</div>
                            <div className="text-base text-stone-600 leading-snug">
                                {m.blurb}
                            </div>
                        </li>
                    ))}
                </ul>

                {asks && (
                    <div className="mt-4">
                        <div className="text-2xl font-bold">Do you like it?</div>
                        {answer ? (
                            <p className="text-lg text-stone-700 mt-1">{REPLIES[answer]}</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <button
                                    onClick={() => reply("meh")}
                                    className="dex-btn border-2 border-stone-800 bg-white text-base"
                                >
                                    Not yet
                                </button>
                                <button
                                    onClick={() => reply("yes")}
                                    className="dex-btn btn-primary border-2 border-stone-800 text-base flex items-center justify-center gap-1"
                                >
                                    <Heart className="w-4 h-4" /> Love it
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!waitingOnAnswer && (
                    <button
                        onClick={onDone}
                        className="dex-btn btn-primary border-2 border-stone-800 w-full mt-4 text-lg"
                    >
                        Nice!
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
}
