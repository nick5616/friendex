// Haptic feedback utilities for mobile devices
export const triggerHapticFeedback = (type = "light") => {
    // Check if the device supports haptic feedback
    if ("vibrate" in navigator) {
        try {
            // Safari on iOS requires longer vibration patterns
            const isSafari = /^((?!chrome|android).)*safari/i.test(
                navigator.userAgent
            );
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

            if (isSafari || isIOS) {
                // iOS Safari needs longer patterns and user interaction
                switch (type) {
                    case "light":
                        navigator.vibrate([50, 10, 50]);
                        break;
                    case "medium":
                        navigator.vibrate([100, 20, 100]);
                        break;
                    case "heavy":
                        navigator.vibrate([200, 30, 200]);
                        break;
                    case "selection":
                        navigator.vibrate([30, 10, 30]);
                        break;
                    default:
                        navigator.vibrate([50, 10, 50]);
                }
            } else {
                // Standard vibration for other browsers
                switch (type) {
                    case "light":
                        navigator.vibrate(10);
                        break;
                    case "medium":
                        navigator.vibrate(20);
                        break;
                    case "heavy":
                        navigator.vibrate(30);
                        break;
                    case "selection":
                        navigator.vibrate(5);
                        break;
                    default:
                        navigator.vibrate(10);
                }
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
    console.log("triggerEnhancedHaptic called with type:", type);
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
            console.log("Triggering vibration with pattern:", pattern);
            navigator.vibrate(pattern);
        } catch (error) {
            console.log("Enhanced haptic feedback failed:", error);
            // Fallback to simple vibration
            triggerHapticFeedback(type);
        }
    } else {
        console.log("navigator.vibrate not available");
    }
};

// Test function to manually trigger vibration
export const testVibration = () => {
    console.log("Testing vibration...");
    triggerEnhancedHaptic("light");
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
