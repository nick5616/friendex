// src/RolodexList.jsx (Corrected)
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { RolodexItem } from "./RolodexItem";
import {
    createDebouncedHaptic,
    isHapticSupported,
    triggerEnhancedHaptic,
} from "./hapticUtils";
import React from "react";

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = VISIBLE_ITEMS * ITEM_HEIGHT;

function RolodexList({ friends, selectedId, onSelect }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollY = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Haptic feedback setup
    const hapticSupported = isHapticSupported();
    const debouncedHaptic = createDebouncedHaptic(100); // 100ms debounce for smooth scrolling
    const lastScrollDirection = useRef<"up" | "down" | null>(null);
    const lastCenterIndex = useRef<number>(-1);

    const selectedIndex = friends.findIndex((f) => f.id === selectedId);

    console.log("RolodexList Debug - friends length:", friends.length);
    console.log("RolodexList Debug - selectedId:", selectedId);
    console.log("RolodexList Debug - selectedIndex:", selectedIndex);
    console.log("RolodexList Debug - hapticSupported:", hapticSupported);
    console.log(
        "RolodexList Debug - selectedColor:",
        hapticSupported ? "blue" : "amber"
    );
    console.log(
        "RolodexList Debug - friends names:",
        friends.map((f) => f.name)
    );

    useEffect(() => {
        if (selectedIndex !== -1 && !isDragging && !isScrolling) {
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
    }, [selectedId, isDragging, isScrolling, selectedIndex]);

    const handleDragEnd = (event, info) => {
        setIsDragging(false);

        // Trigger haptic feedback for drag end
        if (hapticSupported) {
            triggerEnhancedHaptic("selection");
        }

        const currentY = scrollY.get();
        const velocity = info.velocity.y;
        const projectedPosition = currentY + velocity * 0.2;

        // Calculate the closest item index based on the projected final scroll position.
        const centerOffset = LIST_HEIGHT / 2 - ITEM_HEIGHT / 2;
        const closestItemIndex = Math.round(
            -(projectedPosition - centerOffset) / ITEM_HEIGHT
        );

        // Clamp the index to valid range (no wrapping)
        const newIndex = Math.max(
            0,
            Math.min(friends.length - 1, closestItemIndex)
        );

        onSelect(friends[newIndex].id);
    };

    const getCenterFriendIndex = (currentY) => {
        const centerOffset = LIST_HEIGHT / 2 - ITEM_HEIGHT / 2;
        const centerItemIndex = Math.round(
            -(currentY - centerOffset) / ITEM_HEIGHT
        );
        // Clamp to valid range (no wrapping)
        const clampedIndex = Math.max(
            0,
            Math.min(friends.length - 1, centerItemIndex)
        );
        return clampedIndex;
    };

    // Check if center item changed and trigger haptic feedback
    const checkCenterItemChange = (currentY) => {
        const centerIndex = getCenterFriendIndex(currentY);
        if (
            centerIndex !== lastCenterIndex.current &&
            lastCenterIndex.current !== -1
        ) {
            // Center item changed, trigger haptic feedback
            if (hapticSupported) {
                triggerEnhancedHaptic("light");
            }
        }
        lastCenterIndex.current = centerIndex;
        return centerIndex;
    };

    const handleWheel = (e) => {
        e.preventDefault();

        // Enhanced haptic feedback based on scroll direction and velocity
        if (hapticSupported) {
            const currentDirection = e.deltaY > 0 ? "down" : "up";
            const scrollVelocity = Math.abs(e.deltaY);

            // Only trigger haptic if direction changed or for significant scroll
            if (
                lastScrollDirection.current !== currentDirection ||
                scrollVelocity > 50
            ) {
                const hapticType = scrollVelocity > 100 ? "medium" : "light";
                // Use enhanced haptic for better mobile compatibility
                triggerEnhancedHaptic(hapticType);
                lastScrollDirection.current = currentDirection;
            }
        }

        // Update scroll position with clamping
        const currentY = scrollY.get();
        const centerOffset = LIST_HEIGHT / 2 - ITEM_HEIGHT / 2;
        const maxY = centerOffset; // First item centered
        const minY = -(friends.length - 1) * ITEM_HEIGHT + centerOffset; // Last item centered
        const newY = Math.max(minY, Math.min(maxY, currentY - e.deltaY * 0.5));

        // Check if we hit a boundary and provide stronger haptic feedback
        if (hapticSupported && (newY === maxY || newY === minY)) {
            triggerEnhancedHaptic("heavy");
        }

        scrollY.set(newY);

        setIsScrolling(true);

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Calculate which friend is in the center and check for changes
        const centerIndex = checkCenterItemChange(newY);

        // Update selected friend immediately as user scrolls
        if (friends[centerIndex]) {
            onSelect(friends[centerIndex].id);
        }

        // Set timeout to snap to position and end scrolling state
        scrollTimeoutRef.current = setTimeout(() => {
            const finalCenterIndex = getCenterFriendIndex(scrollY.get());
            const targetY =
                -(finalCenterIndex * ITEM_HEIGHT) +
                LIST_HEIGHT / 2 -
                ITEM_HEIGHT / 2;

            animate(scrollY, targetY, {
                type: "spring",
                stiffness: 300,
                damping: 30,
            });

            setIsScrolling(false);
        }, 150);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [friends, scrollY]);

    if (!friends.length) {
        return (
            <div className="flex-1 card-hand-drawn flex items-center justify-center text-stone-500">
                No friends yet!
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative"
            style={{ height: LIST_HEIGHT }}
        >
            <motion.ul
                className="relative w-full"
                // Give the <ul> the full height of all its items.
                style={{ y: scrollY, height: friends.length * ITEM_HEIGHT }}
                drag="y"
                onDragStart={() => {
                    setIsDragging(true);
                    // Trigger haptic feedback for drag start
                    if (hapticSupported) {
                        triggerEnhancedHaptic("light");
                    }
                }}
                onDragEnd={handleDragEnd}
                // Constrain dragging to keep first item at top and last item at bottom
                dragConstraints={{
                    top:
                        -(friends.length - 1) * ITEM_HEIGHT +
                        LIST_HEIGHT / 2 -
                        ITEM_HEIGHT / 2,
                    bottom: LIST_HEIGHT / 2 - ITEM_HEIGHT / 2,
                }}
                dragTransition={{ bounceStiffness: 400, bounceDamping: 50 }}
            >
                {/* Map over the entire friends list with distinct top and bottom */}
                {friends.map((friend, i) => (
                    <RolodexItem
                        key={friend.id}
                        friend={friend}
                        index={i}
                        scrollY={scrollY}
                        isSelected={friend.id === selectedId}
                        onClick={() => onSelect(friend.id)}
                        selectedColor={hapticSupported ? "blue" : "amber"}
                    />
                ))}
            </motion.ul>
        </div>
    );
}

export default RolodexList;
