// src/theme.js
// One-tap theme "versions" for the trainer card, on top of the full color picker
import { applyUserColor, getUserColor, COLOR_SCHEMES } from "./utils";

export const THEME_PRESETS = [
    { name: "Red", color: "#dc2626", scheme: COLOR_SCHEMES.MONOCHROME },
    { name: "Blue", color: "#2563eb", scheme: COLOR_SCHEMES.MONOCHROME },
    { name: "Yellow", color: "#eab308", scheme: COLOR_SCHEMES.COMPLEMENTARY },
    { name: "Crystal", color: "#0891b2", scheme: COLOR_SCHEMES.ANALOGOUS },
    { name: "Ruby", color: "#be123c", scheme: COLOR_SCHEMES.ANALOGOUS },
    { name: "Sapphire", color: "#1d4ed8", scheme: COLOR_SCHEMES.COMPLEMENTARY },
    { name: "Emerald", color: "#059669", scheme: COLOR_SCHEMES.ANALOGOUS },
    { name: "Pearl", color: "#db2777", scheme: COLOR_SCHEMES.TRIADIC },
];

export const getCurrentTheme = () => ({
    color: getUserColor().toLowerCase(),
    scheme: localStorage.getItem("colorScheme") || COLOR_SCHEMES.MONOCHROME,
});

// Same storage keys as UserColorPicker, so the full picker opens on this choice
export const setTheme = ({ color, scheme }) => {
    try {
        localStorage.setItem("userColor", color);
        localStorage.setItem("colorScheme", scheme);
    } catch {
        // Storage unavailable: still apply for this session
    }
    applyUserColor(
        color,
        localStorage.getItem("useSameColorText") === "true",
        scheme,
        localStorage.getItem("mixItUp") === "true"
    );
};
