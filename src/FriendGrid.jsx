// src/FriendGrid.jsx
// Dex-style grid of numbered tiles, an alternative to the rolodex wheel
import { formatDexNumber, getFriendshipTier } from "./dex";

export default function FriendGrid({ friends, dexNumbers, selectedId, onSelect }) {
    return (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3 px-3">
            {friends.map((friend) => {
                const tier = getFriendshipTier(friend);
                const selected = friend.id === selectedId;
                return (
                    <li key={friend.id}>
                        <button
                            onClick={() => onSelect(friend.id)}
                            className="w-full bg-white border-2 border-stone-800 p-1.5 text-left transition-transform active:scale-95"
                            style={{
                                borderRadius: "12px 12px 12px 22px",
                                boxShadow: selected
                                    ? "3px 3px 0 var(--color-shell)"
                                    : "3px 3px 0 #1c1917",
                            }}
                        >
                            <div
                                className="dex-screen aspect-square !rounded-md"
                                style={tier ? { boxShadow: `0 0 0 3px ${tier.ring}` } : undefined}
                            >
                                {friend.profilePicture ? (
                                    <img
                                        src={friend.profilePicture}
                                        alt=""
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-sky-300">
                                        <svg viewBox="0 0 100 100" className="w-3/4 h-3/4" aria-hidden="true">
                                            <circle cx="50" cy="38" r="17" fill="#1e293b" />
                                            <path d="M18 100 Q18 62 50 60 Q82 62 82 100 Z" fill="#1e293b" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="font-pixel text-[10px] text-stone-500 mt-1">
                                {formatDexNumber(dexNumbers.get(friend.id))}
                            </div>
                            <div className="text-sm font-bold leading-tight truncate">
                                {friend.name}
                            </div>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
