// src/Burst.jsx
// A little one-shot burst of stars/confetti. Re-trigger by changing `burstKey`.
import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#facc15", "#f472b6", "#38bdf8", "#4ade80", "#fb923c", "#a78bfa"];

export default function Burst({ burstKey, count = 14, distance = 90, shape = "star" }) {
    const reduceMotion = useReducedMotion();
    if (!burstKey || reduceMotion) return null;

    return (
        <div
            key={burstKey}
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-20"
            aria-hidden="true"
        >
            {Array.from({ length: count }).map((_, i) => {
                const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.3;
                const d = distance * (0.7 + ((i * 37) % 10) / 20);
                const color = COLORS[i % COLORS.length];
                return (
                    <motion.span
                        key={i}
                        className="absolute"
                        initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
                        animate={{
                            x: Math.cos(angle) * d,
                            y: Math.sin(angle) * d,
                            scale: [0.2, 1.1, 0.8],
                            opacity: [1, 1, 0],
                            rotate: 180,
                        }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        style={{ color }}
                    >
                        {shape === "star" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" />
                            </svg>
                        ) : (
                            <span
                                className="block w-2 h-3 rounded-sm"
                                style={{ background: color }}
                            />
                        )}
                    </motion.span>
                );
            })}
        </div>
    );
}
