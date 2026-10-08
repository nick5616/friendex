// src/FriendGrid.jsx
// Dex-style grid of numbered tiles, an alternative to the rolodex wheel
import { formatDexNumber, getFriendshipTier } from "./dex";
import FriendAvatar from "./FriendAvatar";

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
                                <FriendAvatar friend={friend} loading="lazy" />
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
