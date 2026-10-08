// src/DexScreen.jsx
// The photo "screen" of the Pokédex, framed by a bezel whose look reflects the
// friendship tier, with the last-hangout stamp pressed onto the corner.
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Crown, Heart, Star, Cake, Camera } from "lucide-react";
import { formatHangoutAgo } from "./dex";

function WhosThatFriend() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Ray burst background */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                    <radialGradient id="wtf-bg" cx="50%" cy="45%" r="60%">
                        <stop offset="0%" stopColor="#fef9c3" />
                        <stop offset="100%" stopColor="#38bdf8" />
                    </radialGradient>
                </defs>
                <rect width="100" height="100" fill="url(#wtf-bg)" />
                {Array.from({ length: 12 }).map((_, i) => (
                    <path
                        key={i}
                        d="M50 45 L46 -20 L54 -20 Z"
                        fill="#fde047"
                        opacity="0.55"
                        transform={`rotate(${i * 30} 50 45)`}
                    />
                ))}
                {/* Silhouette */}
                <circle cx="50" cy="38" r="15" fill="#1e293b" />
                <path d="M22 100 Q22 60 50 58 Q78 60 78 100 Z" fill="#1e293b" />
                <text x="50" y="44" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#f8fafc" style={{ fontFamily: "Gaegu, cursive" }}>
                    ?
                </text>
            </svg>
            <span
                className="relative mt-auto mb-1.5 px-2 text-center text-sm font-bold leading-tight text-white"
                style={{
                    WebkitTextStroke: "3px #1e3a8a",
                    paintOrder: "stroke fill",
                }}
            >
                Who's that friend?
            </span>
            <span className="relative mb-2 flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-white/80 rounded-full px-2">
                <Camera className="w-3 h-3" /> add photo
            </span>
        </div>
    );
}

function HangoutStamp({ lastHangout, stampKey }) {
    const reduceMotion = useReducedMotion();
    const ago = formatHangoutAgo(lastHangout);
    if (!ago) return null;
    return (
        <motion.div
            key={stampKey}
            initial={reduceMotion ? false : { scale: 2.2, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -bottom-3 -right-3 z-10 pointer-events-none"
        >
            <div
                className="px-2 py-0.5 text-center leading-none"
                style={{
                    border: "2.5px solid #be123c",
                    borderRadius: "6px",
                    color: "#be123c",
                    background: "rgba(255, 255, 255, 0.92)",
                    boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.9), inset 0 0 0 3px #be123c",
                }}
            >
                <div className="font-pixel text-[9px] pt-1">HUNG OUT</div>
                <div className="text-sm font-bold pb-0.5">{ago}</div>
            </div>
        </motion.div>
    );
}

export default function DexScreen({
    friend,
    tier,
    lastHangout,
    stampKey,
    birthdayToday,
    onPhotoClick,
}) {
    const hasPhoto = Boolean(friend?.profilePicture);
    const ring = tier?.ring;

    return (
        <div className="dex-bezel p-3 pb-2 w-44 flex-shrink-0 relative">
            <div className="relative">
                {/* Tier frame: colored ring, shimmering gold for the very best */}
                <div
                    className={`rounded-[12px] p-[3px] ${tier?.crown ? "shimmer" : ""}`}
                    style={{
                        background: tier?.crown
                            ? "linear-gradient(135deg, #fde047, #f59e0b, #fef08a, #eab308)"
                            : ring || "transparent",
                    }}
                >
                    <button
                        type="button"
                        onClick={onPhotoClick}
                        className="dex-screen block w-full aspect-square"
                        aria-label={hasPhoto ? `Change photo of ${friend?.name}` : `Add a photo of ${friend?.name}`}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={friend?.id ?? "none"}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="absolute inset-0"
                            >
                                {hasPhoto ? (
                                    <img
                                        src={friend.profilePicture}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <WhosThatFriend />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </button>
                </div>

                {/* Tier emblem in the top-left corner */}
                {tier && (tier.crown || tier.stars > 0 || tier.hearts) && (
                    <div
                        className="absolute -top-3 -left-3 z-10 flex items-center gap-0.5 rounded-full border-2 border-stone-800 bg-white px-1.5 py-0.5"
                        title={tier.label}
                    >
                        {tier.crown ? (
                            <Crown className="w-4 h-4" style={{ color: "#eab308" }} fill="#fde047" strokeWidth={2.5} />
                        ) : tier.hearts ? (
                            <Heart className="w-4 h-4" style={{ color: ring }} fill={ring} />
                        ) : (
                            Array.from({ length: tier.stars }).map((_, i) => (
                                <Star key={i} className="w-3 h-3" style={{ color: ring }} fill={ring} />
                            ))
                        )}
                    </div>
                )}

                {birthdayToday && (
                    <div className="absolute -top-3 -right-3 z-10 rounded-full border-2 border-stone-800 bg-pink-200 p-1" title="Birthday today!">
                        <Cake className="w-4 h-4 text-pink-700" />
                    </div>
                )}

                <HangoutStamp lastHangout={lastHangout} stampKey={stampKey} />
            </div>

            {/* Speaker grille */}
            <div className="flex justify-end gap-[3px] mt-2 pr-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="w-4 h-[3px] rounded-full bg-stone-700 rotate-[-20deg]" />
                ))}
            </div>
        </div>
    );
}
