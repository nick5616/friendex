// src/TypeBadge.jsx
// Pokémon-type-style badge for a relationship ("Bestie", "Coworker", ...)
import { getRelationshipType } from "./dex";

export function TypeBadge({ name, size = "md" }) {
    const { color, icon: Icon, gradient } = getRelationshipType(name);
    const small = size === "sm";

    // Custom relationships without a fixed type fall back to the theme tag colors
    const style = color
        ? { background: gradient || color }
        : {
              background: "var(--color-tag-bg)",
              color: "var(--color-tag-text)",
              textShadow: "none",
          };

    return (
        <span
            className={`type-badge ${gradient ? "shimmer" : ""} ${
                small ? "!text-xs !pr-2 !gap-1" : ""
            }`}
            style={style}
        >
            <span
                className={`type-badge-icon ${small ? "!w-5 !h-5" : ""}`}
                style={{ color: color || "var(--color-tag-text)" }}
            >
                <Icon className={small ? "w-3 h-3" : "w-3.5 h-3.5"} strokeWidth={2.75} />
            </span>
            {name}
        </span>
    );
}

// Renders as a fragment so callers can mix other badges into the same row
export function TypeBadges({ relationships = [], size }) {
    if (!relationships?.length) return null;
    return relationships.map((r) => (
        <TypeBadge key={r} name={r} size={size} />
    ));
}
