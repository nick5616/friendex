// Haptic feedback utilities for mobile devices
export const triggerHapticFeedback = (type = "light") => {
    // Check if the device supports haptic feedback
    if ("vibrate" in navigator) {
        try {
            switch (type) {
                case "light":
                    // Light haptic feedback (10ms)
                    navigator.vibrate(10);
                    break;
                case "medium":
                    // Medium haptic feedback (20ms)
                    navigator.vibrate(20);
                    break;
                case "heavy":
                    // Heavy haptic feedback (30ms)
                    navigator.vibrate(30);
                    break;
                case "selection":
                    // Selection haptic feedback (5ms)
                    navigator.vibrate(5);
                    break;
                default:
                    navigator.vibrate(10);
            }
        } catch (error) {
            console.log("Haptic feedback not supported or blocked:", error);
        }
    }
};

// Check if device supports haptic feedback
export const isHapticSupported = () => {
    return "vibrate" in navigator && navigator.vibrate !== undefined;
};

// Enhanced haptic feedback with fallback
export const triggerEnhancedHaptic = (type = "light") => {
    // Try modern haptic feedback first
    if (navigator.vibrate) {
        try {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                selection: [5],
                double: [10, 10, 10],
                triple: [10, 10, 10, 10, 10],
            };

            const pattern = patterns[type] || patterns.light;
            navigator.vibrate(pattern);
        } catch (error) {
            console.log("Enhanced haptic feedback failed:", error);
            // Fallback to simple vibration
            triggerHapticFeedback(type);
        }
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
            triggerHapticFeedback(type);
            timeoutId = null;
        }, delay);
    };
};
