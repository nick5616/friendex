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

// Manual override for testing (set this to true to force haptic support)
let forceHapticSupport = false;
let vibrationTested = false;
let vibrationActuallyWorks = false;

// Check if device supports haptic feedback
export const isHapticSupported = () => {
    // Manual override for testing
    if (forceHapticSupport) {
        console.log("Haptic Support: FORCED ON for testing");
        return true;
    }

    // Check if vibration API exists
    const hasVibrateAPI =
        "vibrate" in navigator && navigator.vibrate !== undefined;

    // Check if it's actually a mobile device (not just dev tools)
    const isMobileDevice =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );

    // Check for touch capabilities
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Additional checks to detect dev tools simulation
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isDesktopChrome = isChrome && !isMobileDevice;
    const hasHighDPI = window.devicePixelRatio > 1;
    const hasOrientationAPI = "orientation" in window;
    const hasViewportMeta = document.querySelector('meta[name="viewport"]');

    // Check if we're likely in dev tools by looking for desktop Chrome with mobile simulation
    const isLikelyDevTools = isDesktopChrome && isMobileDevice && hasTouch;

    // More robust mobile detection
    const isRealMobile = isMobileDevice && hasTouch && !isLikelyDevTools;

    console.log("Haptic Support Debug:", {
        hasVibrateAPI,
        isMobileDevice,
        hasTouch,
        isRealMobile,
        isChrome,
        isDesktopChrome,
        isLikelyDevTools,
        hasHighDPI,
        hasOrientationAPI,
        hasViewportMeta: !!hasViewportMeta,
        userAgent: navigator.userAgent,
        maxTouchPoints: navigator.maxTouchPoints,
        devicePixelRatio: window.devicePixelRatio,
    });

    // If we've tested vibration and it doesn't work, don't support it
    if (vibrationTested && !vibrationActuallyWorks) {
        console.log("Haptic Support: Vibration tested and failed");
        return false;
    }

    return hasVibrateAPI && isRealMobile;
};

// Function to manually override haptic support for testing
export const setForceHapticSupport = (force) => {
    forceHapticSupport = force;
    console.log("Haptic support force override:", force);
};

// Enhanced haptic feedback with fallback
export const triggerEnhancedHaptic = (type = "light") => {
    console.log("triggerEnhancedHaptic called with type:", type);

    if (!navigator.vibrate) {
        console.log("navigator.vibrate not available");
        return;
    }

    try {
        // Use different patterns for different mobile browsers
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        let pattern;

        if (isIOS) {
            // iOS Safari needs longer, simpler patterns
            const iosPatterns = {
                light: [50],
                medium: [100],
                heavy: [200],
                selection: [30],
            };
            pattern = iosPatterns[type] || iosPatterns.light;
        } else if (isAndroid) {
            // Android Chrome works better with shorter patterns
            const androidPatterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                selection: [5],
            };
            pattern = androidPatterns[type] || androidPatterns.light;
        } else {
            // Fallback for other browsers
            const fallbackPatterns = {
                light: [50],
                medium: [100],
                heavy: [200],
                selection: [30],
            };
            pattern = fallbackPatterns[type] || fallbackPatterns.light;
        }

        console.log(
            "Triggering vibration with pattern:",
            pattern,
            "for",
            isIOS ? "iOS" : isAndroid ? "Android" : "other"
        );
        navigator.vibrate(pattern);
    } catch (error) {
        console.log("Enhanced haptic feedback failed:", error);
        // Fallback to simple vibration
        triggerHapticFeedback(type);
    }
};

// Test function to manually trigger vibration and check if it actually works
export const testVibration = () => {
    console.log("Testing vibration...");
    vibrationTested = true;

    // Use the enhanced haptic function which has better mobile support
    triggerEnhancedHaptic("light");

    // Also try a simple vibration as backup
    if (navigator.vibrate) {
        try {
            // Try a longer vibration that should be more noticeable
            navigator.vibrate(200);
            console.log("Vibration command sent successfully");

            // Set a timeout to check if vibration "worked" (this is a heuristic)
            setTimeout(() => {
                vibrationActuallyWorks = true;
                console.log("Vibration test completed - assuming it works");
            }, 300);
        } catch (error) {
            console.log("Vibration test failed:", error);
            vibrationActuallyWorks = false;
        }
    } else {
        console.log("Vibration API not available");
        vibrationActuallyWorks = false;
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
