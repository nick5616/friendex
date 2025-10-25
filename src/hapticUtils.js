// Haptic feedback utilities for mobile devices
export const triggerHapticFeedback = (type = "light") => {
    // Check if the device supports haptic feedback
    if ("vibrate" in navigator) {
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
    }
};

// Check if device supports haptic feedback
export const isHapticSupported = () => {
    return "vibrate" in navigator;
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
