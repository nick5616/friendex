import { useEffect } from "react";

/**
 * Reusable mobile-friendly autofocus hook.
 * - Focuses the given element
 * - Uses VirtualKeyboard API when available (Chrome/Edge)
 * - Adds one-time first interaction fallback for Safari/Firefox/others
 */
export default function useMobileAutofocus(
    targetRef,
    {
        enabled = true,
        attachDocumentListener = true,
        retryDelaysMs = [0, 0, 100],
    } = {}
) {
    useEffect(() => {
        if (!enabled) return;
        const element = targetRef?.current;
        if (!element) return;

        const hasVirtualKeyboard =
            typeof navigator !== "undefined" && "virtualKeyboard" in navigator;

        const focusTarget = () => {
            const el = targetRef?.current;
            if (!el) return false;
            if (document.activeElement === el) return true;
            try {
                el.focus({ preventScroll: true });
                if (hasVirtualKeyboard && navigator.virtualKeyboard?.show) {
                    navigator.virtualKeyboard.show().catch(() => {});
                }
                return document.activeElement === el;
            } catch {
                return false;
            }
        };

        // Attempt focus with small retries to handle layout timing
        let focused = false;
        const tryWithDelays = (delays) => {
            if (!delays.length) return;
            const [first, ...rest] = delays;
            const runner = () => {
                focused = focusTarget() || focused;
                if (!focused && rest.length) {
                    tryWithDelays(rest);
                }
            };
            if (first === 0) {
                // immediate and next frame
                focused = focusTarget() || focused;
                if (!focused) {
                    requestAnimationFrame(runner);
                }
            } else {
                setTimeout(runner, first);
            }
        };

        tryWithDelays(retryDelaysMs);

        // One-time first interaction fallback (helps Safari/Firefox)
        if (!attachDocumentListener) return;
        const handleFirstInteraction = () => {
            if (focusTarget()) {
                document.removeEventListener(
                    "touchstart",
                    handleFirstInteraction,
                    true
                );
                document.removeEventListener(
                    "mousedown",
                    handleFirstInteraction,
                    true
                );
            }
        };
        document.addEventListener("touchstart", handleFirstInteraction, true);
        document.addEventListener("mousedown", handleFirstInteraction, true);

        return () => {
            document.removeEventListener(
                "touchstart",
                handleFirstInteraction,
                true
            );
            document.removeEventListener(
                "mousedown",
                handleFirstInteraction,
                true
            );
        };
    }, [targetRef, enabled, attachDocumentListener, retryDelaysMs]);
}
