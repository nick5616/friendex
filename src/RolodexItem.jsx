// src/RolodexItem.jsx (Corrected and Simplified)
import { motion, useTransform } from "framer-motion";

const ITEM_HEIGHT = 56;
const LIST_HEIGHT = 5 * ITEM_HEIGHT;

export function RolodexItem({
    friend,
    scrollY,
    index,
    onClick,
    isSelected,
    selectedColor,
}) {
    // Define color mappings for better visibility
    const colorMap = {
        blue: {
            selected: { backgroundColor: "#93c5fd", color: "#1c1917" }, // blue-300 bg, stone-900 text
            unselected: { backgroundColor: "#eff6ff", color: "#1c1917" }, // blue-50 bg, stone-900 text
        },
        amber: {
            selected: { backgroundColor: "#fde047", color: "#1c1917" }, // yellow-300 bg, stone-900 text
            unselected: { backgroundColor: "#fefce8", color: "#1c1917" }, // yellow-50 bg, stone-900 text
        },
    };

    const colors = colorMap[selectedColor] || colorMap.amber;

    // Debug logging
    console.log("RolodexItem Debug - selectedColor:", selectedColor);
    console.log("RolodexItem Debug - isSelected:", isSelected);
    console.log("RolodexItem Debug - colors:", colors);
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
        [60, 0, 60],
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
            }}
        >
            <button
                onClick={onClick}
                className="w-full text-left text-xl leading-[1.2rem] font-bold p-2 h-full transition-colors duration-150"
                style={{
                    borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
                    backgroundColor: isSelected
                        ? colors.selected.backgroundColor
                        : colors.unselected.backgroundColor,
                    color: isSelected
                        ? colors.selected.color
                        : colors.unselected.color,
                }}
            >
                {friend.name}
            </button>
        </motion.li>
    );
}
