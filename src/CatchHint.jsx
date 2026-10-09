// src/CatchHint.jsx
// "Catch a Friend!" circling the catch ball: on page open and every 30s after,
// until the ball has been pressed once. Then it never comes back.
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SEEN_KEY = "catchHintDismissed";
const EVERY_MS = 30_000;
const VISIBLE_MS = 5_000;

// Geometry in CSS px (the svg is drawn 1:1). The ball is 76px with ~35px of
// visible radius; the text baseline sits a few px outside it.
const SIZE = 124;
const RADIUS = 40;
const FONT_SIZE = 12;
const START_OFFSET = 3; // keeps the "C" fully on the path
const TEXT_TRAVEL = 110; // roughly the text's length, so it starts fully hidden

// Point on the circle, measured clockwise from 12 o'clock
const at = (deg) => {
    const rad = (deg * Math.PI) / 180;
    const c = SIZE / 2;
    return `${(c + RADIUS * Math.sin(rad)).toFixed(2)},${(c - RADIUS * Math.cos(rad)).toFixed(2)}`;
};
// 8 o'clock (240°) clockwise over the top to 2 o'clock (60°), slack past 1 o'clock
const ARC = `M ${at(240)} A ${RADIUS},${RADIUS} 0 0,1 ${at(58)}`;

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
                    // Explicit size: Safari doesn't stretch an <svg> between inset
                    // offsets, so `inset` alone left it at the wrong scale
                    width={SIZE}
                    height={SIZE}
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="absolute pointer-events-none overflow-visible"
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    style={{
                        left: "50%",
                        top: "50%",
                        marginLeft: -SIZE / 2,
                        marginTop: -SIZE / 2,
                    }}
                >
                    <defs>
                        {/* Clockwise arc hugging the ball from 8 o'clock past
                            1 o'clock. Letters before the start of the path aren't
                            drawn, so sliding the offset up makes the text emerge
                            from the 8 o'clock end. */}
                        <path id="catch-hint-arc" d={ARC} />
                    </defs>
                    <text
                        className="font-bold"
                        fontSize={FONT_SIZE}
                        letterSpacing="1.5"
                        fill="#1c1917"
                        stroke="#fff"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        style={{ paintOrder: "stroke" }}
                    >
                        <motion.textPath
                            href="#catch-hint-arc"
                            initial={{ startOffset: -TEXT_TRAVEL }}
                            animate={{ startOffset: START_OFFSET }}
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
