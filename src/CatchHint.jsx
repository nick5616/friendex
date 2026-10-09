// src/CatchHint.jsx
// "Catch a Friend!" circling the catch ball: on page open and every 30s after,
// until the ball has been pressed once. Then it never comes back.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SEEN_KEY = "catchHintDismissed";
const EVERY_MS = 30_000;
const VISIBLE_MS = 5_000;
// 150° of a radius-42 circle (just outside the ball): 8 o'clock round to 1 o'clock
const ARC_LENGTH = 110;

const isDismissed = () => {
    try {
        return localStorage.getItem(SEEN_KEY) === "1";
    } catch {
        return false;
    }
};

// `pressed` flips true once the ball is tapped (its menu opens)
export default function CatchHint({ pressed }) {
    const [dismissed, setDismissed] = useState(isDismissed);
    const [visible, setVisible] = useState(false);
    const active = !dismissed && !pressed;

    useEffect(() => {
        if (!pressed || dismissed) return;
        setDismissed(true);
        try {
            localStorage.setItem(SEEN_KEY, "1");
        } catch {
            // Storage unavailable: it just comes back next visit
        }
    }, [pressed, dismissed]);

    useEffect(() => {
        if (!active) {
            setVisible(false);
            return;
        }
        let hideTimer;
        const show = () => {
            setVisible(true);
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
        };
        const first = setTimeout(show, 800);
        const repeat = setInterval(show, EVERY_MS);
        return () => {
            clearTimeout(first);
            clearTimeout(hideTimer);
            clearInterval(repeat);
        };
    }, [active]);

    // Tapping the ball makes it vanish on the spot, skipping the slide-out
    if (!active) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.svg
                    aria-hidden="true"
                    viewBox="0 0 120 120"
                    className="absolute -inset-6 pointer-events-none overflow-visible"
                >
                    <defs>
                        {/* Arc over the top of the ball, from about 8 o'clock to
                            1 o'clock. Text off either end of the path isn't drawn, so
                            sliding the offset makes it emerge at one end and leave
                            at the other. */}
                        <path id="catch-hint-arc" d="M 23.6,81 A 42,42 0 0,1 81,23.6" />
                    </defs>
                    <text
                        className="font-bold"
                        fontSize="15"
                        letterSpacing="1"
                        fill="#1c1917"
                        stroke="#fff"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        style={{ paintOrder: "stroke" }}
                    >
                        <motion.textPath
                            href="#catch-hint-arc"
                            textLength={ARC_LENGTH}
                            lengthAdjust="spacing"
                            initial={{ startOffset: -ARC_LENGTH }}
                            animate={{ startOffset: 0 }}
                            exit={{ startOffset: ARC_LENGTH }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                        >
                            Catch a Friend!
                        </motion.textPath>
                    </text>
                </motion.svg>
            )}
        </AnimatePresence>
    );
}
