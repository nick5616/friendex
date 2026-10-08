// src/FriendAvatar.jsx
// A friend's photo, or — when they don't have a real one — a "Who's that
// friend?" ray burst tinted from their name with their initial as the silhouette.
// Drawn at render time (never stored) so it survives cloud sync and imports.
import { useId } from "react";

// Older friends have a generated SVG letter avatar saved as their picture; treat
// those as "no photo" so everyone gets the same placeholder
export const realPhoto = (friend) => {
    const pic = friend?.profilePicture;
    return typeof pic === "string" && pic && !pic.startsWith("data:image/svg")
        ? pic
        : null;
};

const nameHue = (name = "") => {
    const hash = Array.from(name).reduce(
        (acc, char) => char.codePointAt(0) + ((acc << 5) - acc),
        0
    );
    return Math.abs(hash) % 360;
};

export function AvatarPlaceholder({ name = "", className = "" }) {
    const gradientId = useId();
    const hue = nameHue(name.trim());
    const initial = Array.from(name.trim())[0]?.toUpperCase() || "?";

    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <defs>
                <radialGradient id={gradientId} cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stopColor={`hsl(${hue}, 90%, 90%)`} />
                    <stop offset="100%" stopColor={`hsl(${hue}, 75%, 55%)`} />
                </radialGradient>
            </defs>
            <rect width="100" height="100" fill={`url(#${gradientId})`} />
            {Array.from({ length: 12 }).map((_, i) => (
                <path
                    key={i}
                    d="M50 45 L46 -20 L54 -20 Z"
                    fill={`hsl(${hue}, 95%, 78%)`}
                    opacity="0.55"
                    transform={`rotate(${i * 30} 50 45)`}
                />
            ))}
            <text
                x="50"
                y="50"
                // Half of Gaegu's ~0.55em capital height, so the letter sits mid-square
                dy="0.27em"
                textAnchor="middle"
                fontSize="70"
                fontWeight="bold"
                fill="#1e293b"
                style={{ fontFamily: "Gaegu, cursive" }}
            >
                {initial}
            </text>
        </svg>
    );
}

export default function FriendAvatar({ friend, name, src, className = "", ...imgProps }) {
    const photo = src ?? realPhoto(friend);
    if (photo) {
        return (
            <img
                src={photo}
                alt=""
                className={`w-full h-full object-cover ${className}`}
                {...imgProps}
            />
        );
    }
    return (
        <AvatarPlaceholder
            name={name ?? friend?.name}
            className={`w-full h-full ${className}`}
        />
    );
}
