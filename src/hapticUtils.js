// Haptic feedback utilities for mobile devices
export const triggerHapticFeedback = (type = "light") => {
    if ("vibrate" in navigator) {
        try {
            // Use longer patterns that work better on mobile
            const patterns = {
                light: [100],
                medium: [200],
                heavy: [300],
                selection: [50],
            };

            const pattern = patterns[type] || patterns.light;
            navigator.vibrate(pattern);
        } catch (error) {
            // Silent fail
        }
    }
};

// Check if device supports haptic feedback
export const isHapticSupported = () => {
    // Check if vibration API exists
    const hasVibrateAPI =
        "vibrate" in navigator && navigator.vibrate !== undefined;

    // Check if it's a mobile device
    const isMobileDevice =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

    // Check for touch capabilities
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // For mobile devices, we support haptic if they have the API
    return hasVibrateAPI && (isMobileDevice || hasTouch);
};

// Enhanced haptic feedback optimized for mobile
export const triggerEnhancedHaptic = (type = "light") => {
    if (!navigator.vibrate) {
        return;
    }

    try {
        // Use longer, more noticeable patterns for mobile
        const patterns = {
            light: [100],
            medium: [200],
            heavy: [300],
            selection: [50],
        };

        const pattern = patterns[type] || patterns.light;
        navigator.vibrate(pattern);
    } catch (error) {
        // Fallback to simple vibration
        triggerHapticFeedback(type);
    }
};

// Test function to manually trigger vibration
export const testVibration = () => {
    if (!navigator.vibrate) {
        return;
    }

    // Try multiple different vibration approaches
    try {
        // Approach 1: Simple long vibration
        navigator.vibrate(500);

        // Approach 2: Pattern vibration
        setTimeout(() => navigator.vibrate([100, 50, 100]), 100);

        // Approach 3: Multiple short vibrations
        setTimeout(() => navigator.vibrate([50, 50, 50, 50]), 200);

        // Approach 4: Very long vibration
        setTimeout(() => navigator.vibrate(1000), 300);
    } catch (error) {
        // Silent fail
    }
};

// Debounced haptic feedback to prevent excessive vibrations
export const createDebouncedHaptic = (delay = 50) => {
    let timeoutId = null;

    return (type = "light") => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            triggerEnhancedHaptic(type);
            timeoutId = null;
        }, delay);
    };
};
