// src/RolodexItem.jsx (Corrected and Simplified)
import { motion, useTransform } from "framer-motion";
import { formatDexNumber } from "./dex";

const ITEM_HEIGHT = 56;
const LIST_HEIGHT = 5 * ITEM_HEIGHT;

export function RolodexItem({
    friend,
    scrollY,
    index,
    onClick,
    isSelected,
    dexNumber,
    tier,
}) {
    // This calculates the item's absolute position relative to the top of the viewport.
    const itemY = useTransform(scrollY, (y) => index * ITEM_HEIGHT + y);

    // This calculates the item's distance from the vertical center of the viewport.
    // When this is 0, the item is perfectly centered.
    const distanceFromCenter = useTransform(
        itemY,
        (y) => y - LIST_HEIGHT / 2 + ITEM_HEIGHT / 2
    );

    // The range for transformations. We want the effect to be strongest
    // when an item is at the center and fade out towards the edges.
    const transformationRange = [-LIST_HEIGHT / 2, 0, LIST_HEIGHT / 2];

    // Map the distance from center to our desired visual styles.
    const scale = useTransform(
        distanceFromCenter,
        transformationRange,
        [0.7, 1, 0.7],
        { clamp: true }
    );
    const opacity = useTransform(
        distanceFromCenter,
        transformationRange,
        [0.4, 1, 0.4],
        { clamp: true }
    );
    const x = useTransform(
        distanceFromCenter,
        transformationRange,
        [28, 0, 28],
        { clamp: true }
    );

    return (
        // The item is now positioned absolutely within its parent <ul>
        <motion.li
            className="absolute w-full"
            style={{
                top: index * ITEM_HEIGHT, // Its static position in the long list
                height: ITEM_HEIGHT,
                scale,
                opacity,
                x,
                originX: 0,
            }}
        >
            <button
                onClick={onClick}
                className="w-full text-left font-bold pl-3 pr-2 h-[calc(100%-6px)] mt-[3px] transition-colors duration-150 flex flex-col justify-center border-2"
                style={{
                    // Selected tab runs off the right edge of the page
                    borderRadius: "var(--radius-dex) 0 0 var(--radius-dex)",
                    borderRightWidth: 0,
                    backgroundColor: isSelected ? "var(--color-shell)" : "transparent",
                    borderColor: isSelected ? "#1c1917" : "transparent",
                    boxShadow: isSelected ? "0 3px 0 #1c1917" : "none",
                    color: isSelected ? "#fff" : "var(--color-neutral-800)",
                }}
            >
                <span
                    className={`font-pixel text-[10px] leading-none flex items-center gap-1.5 ${
                        isSelected ? "text-white/80" : "text-stone-500"
                    }`}
                >
                    {formatDexNumber(dexNumber)}
                    {tier && (
                        <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: isSelected ? "#fff" : tier.ring }}
                            role="img"
                            aria-label={tier.label}
                        />
                    )}
                </span>
                <span className="text-xl leading-tight truncate w-full">
                    {friend.name}
                </span>
            </button>
        </motion.li>
    );
}
