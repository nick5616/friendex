// src/CatchCelebration.jsx
// Ball drops in, wobbles three times, clicks shut, stars pop: "Gotcha!"
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Burst from "./Burst";
import { formatDexNumber } from "./dex";

const WOBBLE_MS = 2100;
const TOTAL_MS = 4200;

export default function CatchCelebration({ name, count = 1, dexNumber, onDone }) {
    const reduceMotion = useReducedMotion();
    const [caught, setCaught] = useState(reduceMotion);

    useEffect(() => {
        const click = setTimeout(() => setCaught(true), reduceMotion ? 0 : WOBBLE_MS);
        const done = setTimeout(onDone, reduceMotion ? 2200 : TOTAL_MS);
        return () => {
            clearTimeout(click);
            clearTimeout(done);
        };
    }, [onDone, reduceMotion]);

    const message =
        count > 1
            ? `${count} friends were registered!`
            : `${name || "Your new friend"} was registered!`;

    return (
        <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/45 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDone}
            role="status"
            aria-live="polite"
        >
            <div className="relative w-36 h-36">
                <motion.img
                    src="/icons/android-chrome512x512.png?v=2"
                    alt=""
                    className="w-full h-full drop-shadow-[0_6px_0_rgba(0,0,0,0.35)]"
                    style={{ originY: 0.9 }}
                    initial={reduceMotion ? false : { y: -420, rotate: -200 }}
                    animate={
                        reduceMotion
                            ? {}
                            : caught
                            ? { y: 0, rotate: 0, scale: [1, 1.12, 1] }
                            : {
                                  y: 0,
                                  rotate: [ -200, 0, 0, -22, 22, 0, 0, -18, 18, 0, 0, -12, 12, 0],
                              }
                    }
                    transition={
                        caught
                            ? { duration: 0.3 }
                            : {
                                  y: { type: "spring", stiffness: 260, damping: 16 },
                                  rotate: {
                                      duration: WOBBLE_MS / 1000,
                                      times: [0, 0.2, 0.3, 0.36, 0.42, 0.48, 0.58, 0.64, 0.7, 0.76, 0.86, 0.9, 0.95, 1],
                                  },
                              }
                    }
                />
                <Burst burstKey={caught ? "caught" : null} count={16} distance={110} />
            </div>

            <AnimatePresence>
                {caught && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="dex-card mt-8 text-center max-w-xs"
                    >
                        <div className="text-4xl font-bold" style={{ color: "var(--color-title)" }}>
                            Gotcha!
                        </div>
                        <div className="text-lg text-stone-800 mt-1">{message}</div>
                        {count === 1 && dexNumber && (
                            <div className="font-pixel text-xs text-stone-500 mt-2">
                                FRIENDEX {formatDexNumber(dexNumber)}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
