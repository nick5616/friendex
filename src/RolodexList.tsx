// src/RolodexList.jsx (Corrected)
import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { RolodexItem } from "./RolodexItem";
import React from "react";

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;

function RolodexList({ friends, selectedId, onSelect }) {
    const [isDragging, setIsDragging] = useState(false);
    const scrollY = useMotionValue(0);

    const selectedIndex = friends.findIndex((f) => f.id === selectedId);

    useEffect(() => {
        if (selectedIndex !== -1 && !isDragging) {
            // The target position needs to place the selected item in the center.
            const targetY =
                -(selectedIndex * ITEM_HEIGHT) +
                LIST_HEIGHT / 2 -
                ITEM_HEIGHT / 2;
            animate(scrollY, targetY, {
                type: "spring",
                stiffness: 400,
                damping: 40,
            });
        }
    }, [selectedId, isDragging, selectedIndex]);

    const handleDragEnd = (event, info) => {
        setIsDragging(false);
        const currentY = scrollY.get();
        const velocity = info.velocity.y;
        const projectedPosition = currentY + velocity * 0.2;

        // Calculate the closest item index based on the projected final scroll position.
        const centerOffset = LIST_HEIGHT / 2 - ITEM_HEIGHT / 2;
        const closestItemIndex = Math.round(
            -(projectedPosition - centerOffset) / ITEM_HEIGHT
        );

        // Use modulo to wrap the index around the list for infinite scrolling.
        const newIndex =
            ((closestItemIndex % friends.length) + friends.length) %
            friends.length;

        onSelect(friends[newIndex].id);
    };

    if (!friends.length) {
        return (
            <div className="flex-1 card-hand-drawn flex items-center justify-center text-stone-500">
                No friends yet!
            </div>
        );
    }

    return (
        <div
            className="flex-1 overflow-hidden relative"
            style={{ height: LIST_HEIGHT }}
        >
            <motion.ul
                className="relative w-full"
                // Give the <ul> the full height of all its items.
                style={{ y: scrollY, height: friends.length * ITEM_HEIGHT }}
                drag="y"
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                // No drag constraints for infinite scrolling!
                dragConstraints={{ top: -Infinity, bottom: Infinity }}
                dragTransition={{ bounceStiffness: 400, bounceDamping: 50 }}
            >
                {/* We now map over the ENTIRE friends list. Each item gets its true index. */}
                {friends.map((friend, i) => (
                    <RolodexItem
                        key={friend.id}
                        friend={friend}
                        index={i}
                        scrollY={scrollY}
                        isSelected={friend.id === selectedId}
                        onClick={() => onSelect(friend.id)}
                    />
                ))}
            </motion.ul>
        </div>
    );
}

export default RolodexList;
