import { useState, useEffect } from "react";
import {
    applyUserColor,
    getUserColor,
    DEFAULT_COLOR,
    hslToHex,
    hexToHsl,
    checkContrastAccessibility,
    COLOR_SCHEMES,
    getSchemeInfo,
    calculateColorHarmony,
    calculateContrastRatio,
} from "./utils";

const USER_COLOR_KEY = "userColor";
const LAST_COLOR_KEY = "lastColor";
const COLOR_HISTORY_KEY = "colorHistory";
const USE_SAME_COLOR_TEXT_KEY = "useSameColorText";
const COLOR_SCHEME_KEY = "colorScheme";
const MIX_IT_UP_KEY = "mixItUp";
const MAX_HISTORY = 20;
const COLORS_PER_PAGE = 4;

// Ordered by number of colors
const SCHEME_ORDER = [
    COLOR_SCHEMES.MONOCHROME,
    COLOR_SCHEMES.COMPLEMENTARY,
    COLOR_SCHEMES.TRIADIC,
    COLOR_SCHEMES.SPLIT_COMPLEMENTARY,
    COLOR_SCHEMES.SQUARE,
    COLOR_SCHEMES.RECTANGULAR,
];

// 6 hues, 60 degrees apart: 0, 60, 120, 180, 240, 300
const HUES = [0, 60, 120, 180, 240, 300];
// 3 lightnesses
const LIGHTNESSES = [50, 70, 90];
// Default saturation (will be controlled by slider)
const DEFAULT_SATURATION = 85;

function UserColorPicker({ onCancel, basePath = "" }) {
    const [savedColor, setSavedColor] = useState(DEFAULT_COLOR); // Currently applied color
    const [previewColor, setPreviewColor] = useState(DEFAULT_COLOR); // Preview color (not applied yet)
    const [saturation, setSaturation] = useState(DEFAULT_SATURATION);
    const [colorHistory, setColorHistory] = useState([]); // Memento pattern: array of color states
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null); // Track which history entry is selected
    const [selectedSwatchHex, setSelectedSwatchHex] = useState(null); // Track which swatch is selected
    const [useSameColorText, setUseSameColorText] = useState(true);
    const [accessibilityCheck, setAccessibilityCheck] = useState(null);
    const [doItAnyway, setDoItAnyway] = useState(false);
    const [colorScheme, setColorScheme] = useState(COLOR_SCHEMES.MONOCHROME);
    const [mixItUp, setMixItUp] = useState(false);

    // Load saved color and color history on mount
    useEffect(() => {
        const currentSavedColor = getUserColor();
        setSavedColor(currentSavedColor);
        setPreviewColor(currentSavedColor);

        // Load useSameColorText preference
        const savedUseSameColorText =
            localStorage.getItem(USE_SAME_COLOR_TEXT_KEY) === "true";
        setUseSameColorText(savedUseSameColorText);

        // Load color scheme preference
        const savedScheme =
            localStorage.getItem(COLOR_SCHEME_KEY) || COLOR_SCHEMES.MONOCHROME;
        setColorScheme(savedScheme);

        // Load mixItUp preference
        const savedMixItUp = localStorage.getItem(MIX_IT_UP_KEY) === "true";
        setMixItUp(savedMixItUp);

        applyUserColor(
            currentSavedColor,
            savedUseSameColorText,
            savedScheme,
            savedMixItUp
        );

        // Load color history from localStorage
        const savedHistory = localStorage.getItem(COLOR_HISTORY_KEY);
        if (savedHistory) {
            try {
                const history = JSON.parse(savedHistory);
                // Migrate old format (array of strings) to new format (array of objects)
                const migratedHistory = history.map((entry) => {
                    if (typeof entry === "string") {
                        // Old format: just a color string, use saved scheme as default
                        return { color: entry, scheme: savedScheme };
                    }
                    // New format: already an object with color and scheme
                    return entry;
                });
                setColorHistory(migratedHistory);
            } catch (e) {
                console.error("Error loading color history:", e);
            }
        }

        // Extract saturation from saved color if it exists
        if (currentSavedColor !== DEFAULT_COLOR) {
            const hsl = hexToHsl(currentSavedColor);
            setSaturation(hsl.s);
        }
    }, []);

    // Check accessibility whenever preview color, useSameColorText, mixItUp, or colorScheme changes
    useEffect(() => {
        let check;
        if (
            useSameColorText &&
            mixItUp &&
            colorScheme !== COLOR_SCHEMES.MONOCHROME
        ) {
            // When mixItUp is enabled, check contrast between background and the actual text color that will be used
            const schemeColors = calculateColorHarmony(
                previewColor,
                colorScheme
            );
            if (schemeColors.length > 1) {
                const textColor = schemeColors[1];
                const textHsl = hexToHsl(textColor);
                // Check contrast: light background (90% lightness) with dark text (25% lightness of different hue)
                const lightBg = hslToHex(
                    hexToHsl(previewColor).h,
                    hexToHsl(previewColor).s,
                    90
                );
                const darkText = hslToHex(textHsl.h, textHsl.s, 25);
                const darkBg = hslToHex(
                    hexToHsl(previewColor).h,
                    hexToHsl(previewColor).s,
                    25
                );
                const lightText = hslToHex(textHsl.h, textHsl.s, 90);

                const contrastLightBg = calculateContrastRatio(
                    lightBg,
                    darkText
                );
                const contrastDarkBg = calculateContrastRatio(
                    darkBg,
                    lightText
                );
                const worstContrast = Math.min(contrastLightBg, contrastDarkBg);

                const meetsWCAGAA = worstContrast >= 4.5;
                const meetsWCAGAAA = worstContrast >= 7;

                check = {
                    meetsWCAGAA,
                    meetsWCAGAAA,
                    recommendedTextColor: null,
                    contrastRatio: worstContrast,
                    warning: !meetsWCAGAA
                        ? "Contrast ratio not high enough. The stuff's going to be hard to read."
                        : null,
                    contrastWithBlack: contrastLightBg,
                    contrastWithWhite: contrastDarkBg,
                };
            } else {
                check = checkContrastAccessibility(
                    previewColor,
                    useSameColorText
                );
            }
        } else {
            check = checkContrastAccessibility(previewColor, useSameColorText);
        }
        setAccessibilityCheck(check);
        setDoItAnyway(false); // Reset when color changes
    }, [previewColor, useSameColorText, mixItUp, colorScheme]);

    // Update text color preference and apply it
    const handleUseSameColorTextChange = (checked) => {
        setUseSameColorText(checked);
        localStorage.setItem(USE_SAME_COLOR_TEXT_KEY, checked.toString());
        // Apply immediately to both saved color (for app) and preview
        applyUserColor(savedColor, checked, colorScheme, mixItUp);
        applyUserColor(previewColor, checked, colorScheme, mixItUp);
    };

    // Update color scheme and apply it
    const handleSchemeChange = (scheme) => {
        setColorScheme(scheme);
        localStorage.setItem(COLOR_SCHEME_KEY, scheme);
        // Apply immediately to both saved color (for app) and preview
        applyUserColor(savedColor, useSameColorText, scheme, mixItUp);
        applyUserColor(previewColor, useSameColorText, scheme, mixItUp);
    };

    // Update mix it up preference and apply it
    const handleMixItUpChange = (checked) => {
        setMixItUp(checked);
        localStorage.setItem(MIX_IT_UP_KEY, checked.toString());
        // Apply immediately to both saved color (for app) and preview
        applyUserColor(savedColor, useSameColorText, colorScheme, checked);
        applyUserColor(previewColor, useSameColorText, colorScheme, checked);
    };

    // Generate all 18 swatches organized as 3 rows (lightnesses) × 6 columns (hues)
    const generateSwatches = () => {
        const swatches = [];
        // Group by lightness (rows), then by hue (columns)
        LIGHTNESSES.forEach((lightness) => {
            HUES.forEach((hue) => {
                const hex = hslToHex(hue, saturation, lightness);
                swatches.push({
                    hue,
                    lightness,
                    saturation,
                    hex,
                });
            });
        });
        return swatches;
    };

    const swatches = generateSwatches();

    const handleSwatchClick = (hex) => {
        // Only update preview, don't apply to app
        setPreviewColor(hex);
        setSelectedSwatchHex(hex); // Track which swatch was selected
        setSelectedHistoryIndex(null); // Clear history selection when selecting a swatch
    };

    // Memento pattern: Save color state to history with scheme
    const saveColorToHistory = (color, scheme) => {
        const historyEntry = { color, scheme };
        const newHistory = [...colorHistory, historyEntry];
        // Limit history size
        const trimmedHistory = newHistory.slice(-MAX_HISTORY);
        setColorHistory(trimmedHistory);
        localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(trimmedHistory));
        // Select the newly added entry
        setSelectedHistoryIndex(trimmedHistory.length - 1);
    };

    const handleHistoryColorClick = (historyEntry, index) => {
        const color =
            typeof historyEntry === "string"
                ? historyEntry
                : historyEntry.color;
        setPreviewColor(color);
        setSelectedHistoryIndex(index);
        setSelectedSwatchHex(null); // Clear swatch selection when selecting from history
        const hsl = hexToHsl(color);
        setSaturation(hsl.s);
    };

    const handleDone = () => {
        // Check if we need to warn about accessibility
        if (
            accessibilityCheck &&
            !accessibilityCheck.meetsWCAGAA &&
            !doItAnyway
        ) {
            // Don't save if contrast is bad and user hasn't confirmed
            return;
        }

        // Apply the preview color to the app with text color preference and scheme
        localStorage.setItem(USER_COLOR_KEY, previewColor);
        setSavedColor(previewColor);
        applyUserColor(previewColor, useSameColorText, colorScheme, mixItUp);

        // Save to history (memento pattern) with current scheme
        saveColorToHistory(previewColor, colorScheme);

        // Save current color as last color
        localStorage.setItem(LAST_COLOR_KEY, previewColor);
        setDoItAnyway(false);

        // Navigate back to dashboard
        if (onCancel) {
            onCancel();
        }
    };

    const handleSaturationChange = (e) => {
        const newSaturation = parseInt(e.target.value);
        setSaturation(newSaturation);

        // If a color is selected, preserve its hue and lightness but update saturation
        if (previewColor !== DEFAULT_COLOR) {
            // Extract hue and lightness from current preview color
            const hsl = hexToHsl(previewColor);

            // Find closest lightness match from our predefined lightnesses
            const closestLightness = LIGHTNESSES.reduce((prev, curr) =>
                Math.abs(curr - hsl.l) < Math.abs(prev - hsl.l) ? curr : prev
            );

            // Update preview color with new saturation, preserving hue and closest lightness
            const updatedHex = hslToHex(hsl.h, newSaturation, closestLightness);
            setPreviewColor(updatedHex);
        }
    };

    const isSelected = (hex) => {
        // Only show as selected if this specific swatch was clicked
        return (
            selectedSwatchHex !== null &&
            selectedSwatchHex.toLowerCase() === hex.toLowerCase()
        );
    };

    const schemeColors = calculateColorHarmony(previewColor, colorScheme);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="card-hand-drawn p-6">
                <label className="block mb-4 text-2xl font-bold">
                    Choose your color:
                </label>

                {/* Swatch grid: 6 columns (hues) × 3 rows (lightnesses) */}
                <div className="grid grid-cols-6 gap-1 mb-4">
                    {swatches.map((swatch, index) => (
                        <button
                            key={index}
                            onClick={() => handleSwatchClick(swatch.hex)}
                            className={`w-full aspect-square border-2 transition-all ${
                                isSelected(swatch.hex)
                                    ? "border-stone-900 scale-110 shadow-lg"
                                    : "border-stone-400 hover:border-stone-600"
                            }`}
                            style={{
                                backgroundColor: swatch.hex,
                                borderRadius:
                                    "255px 15px 225px 15px/15px 225px 15px 255px",
                            }}
                            title={`Hue: ${swatch.hue}°, Lightness: ${swatch.lightness}%, Saturation: ${swatch.saturation}%`}
                        />
                    ))}
                </div>

                {/* Saturation slider */}
                <div className="mb-4">
                    <label className="block text-xs font-bold mb-1">
                        Saturation: {saturation}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={saturation}
                        onChange={handleSaturationChange}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, 
                                    hsl(0, 0%, 50%) 0%, 
                                    hsl(0, ${saturation}%, 50%) 100%)`,
                        }}
                    />
                </div>

                {/* Last Colors Section */}
                {colorHistory.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-xs font-bold mb-2">
                            Last Colors:
                        </label>
                        <div className="overflow-x-auto">
                            <div
                                className="flex gap-2 p-1 pb-2"
                                style={{
                                    minWidth: "max-content",
                                    minHeight: "max-content",
                                }}
                            >
                                {colorHistory.map((historyEntry, idx) => {
                                    // Handle both old format (string) and new format (object)
                                    const color =
                                        typeof historyEntry === "string"
                                            ? historyEntry
                                            : historyEntry.color;
                                    const scheme =
                                        typeof historyEntry === "string"
                                            ? colorScheme // Fallback to current scheme for old entries
                                            : historyEntry.scheme;

                                    // Calculate color scheme for this history color using its stored scheme
                                    const schemeColors = calculateColorHarmony(
                                        color,
                                        scheme
                                    );
                                    const isSelected =
                                        selectedHistoryIndex === idx;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() =>
                                                handleHistoryColorClick(
                                                    historyEntry,
                                                    idx
                                                )
                                            }
                                            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                                            style={{ width: "80px" }}
                                        >
                                            <div
                                                className={`w-full aspect-square border-2 transition-all overflow-hidden ${
                                                    isSelected
                                                        ? "border-stone-900 scale-110 shadow-lg"
                                                        : "border-stone-400"
                                                }`}
                                                style={{
                                                    borderRadius:
                                                        "255px 15px 225px 15px/15px 225px 15px 255px",
                                                }}
                                            >
                                                {schemeColors.length === 1 ? (
                                                    <div
                                                        className="w-full h-full"
                                                        style={{
                                                            backgroundColor:
                                                                schemeColors[0],
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col">
                                                        {schemeColors.map(
                                                            (
                                                                schemeColor,
                                                                schemeIdx
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        schemeIdx
                                                                    }
                                                                    className="flex-1"
                                                                    style={{
                                                                        backgroundColor:
                                                                            schemeColor,
                                                                    }}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleHistoryColorClick(
                                                        historyEntry,
                                                        idx
                                                    );
                                                }}
                                                className="text-xs bg-transparent border-none px-2 py-1 hover:underline"
                                            >
                                                {color}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Accessibility Section */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 mb-2">
                        <input
                            type="checkbox"
                            checked={useSameColorText}
                            onChange={(e) =>
                                handleUseSameColorTextChange(e.target.checked)
                            }
                            className="w-4 h-4"
                        />
                        <span className="text-xs font-bold">
                            Apply your theme to text
                        </span>
                    </label>
                    {accessibilityCheck && (
                        <div className="text-xs mb-2">
                            {accessibilityCheck.warning && (
                                <div className="mt-2 text-red-600 font-bold">
                                    {accessibilityCheck.warning}
                                </div>
                            )}
                        </div>
                    )}
                    {accessibilityCheck && accessibilityCheck.warning && (
                        <button
                            onClick={() => setDoItAnyway(true)}
                            className="text-xs bg-transparent border-2 border-stone-800 px-3 py-1 rounded hover:bg-stone-100 transition-all"
                        >
                            Do it anyway
                        </button>
                    )}
                </div>

                {/* Mix It Up Section */}
                {useSameColorText && (
                    <div className="mb-4">
                        <label className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                checked={mixItUp}
                                onChange={(e) =>
                                    handleMixItUpChange(e.target.checked)
                                }
                                className="w-4 h-4"
                            />
                            <span className="text-xs font-bold">
                                Mix it up!
                            </span>
                        </label>
                        <div className="text-xs text-stone-600 ml-6">
                            Use different hues for text colors
                        </div>
                    </div>
                )}

                {/* Color Scheme Section */}
                <div className="mb-4">
                    <label className="block text-xs font-bold mb-2">
                        Color Scheme:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {SCHEME_ORDER.map((scheme) => {
                            const schemeInfo = getSchemeInfo(scheme);
                            const schemePreviewColors = calculateColorHarmony(
                                previewColor,
                                scheme
                            );
                            const isSelected = colorScheme === scheme;

                            return (
                                <button
                                    key={scheme}
                                    onClick={() => handleSchemeChange(scheme)}
                                    className={`p-2 border-2 rounded transition-all ${
                                        isSelected
                                            ? "border-stone-900 bg-stone-100 scale-105 shadow-md"
                                            : "border-stone-400 hover:border-stone-600 hover:bg-stone-50"
                                    }`}
                                    style={{
                                        borderRadius:
                                            "255px 15px 225px 15px/15px 225px 15px 255px",
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex gap-0.5 flex-1">
                                            {schemePreviewColors.map(
                                                (color, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex-1 h-6 border border-stone-300"
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                            borderRadius:
                                                                idx === 0
                                                                    ? "8px 0 0 8px"
                                                                    : idx ===
                                                                      schemePreviewColors.length -
                                                                          1
                                                                    ? "0 8px 8px 0"
                                                                    : "0",
                                                        }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-left">
                                        {schemeInfo.name}
                                    </div>
                                    <div className="text-xs text-stone-600 text-left">
                                        {schemeInfo.colors}{" "}
                                        {schemeInfo.colors === 1
                                            ? "color"
                                            : "colors"}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onCancel || (() => {})}
                        className="btn-hand-drawn text-sm px-4 py-2 flex-1 transition-all border-2 border-stone-800 bg-white hover:bg-stone-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDone}
                        disabled={
                            accessibilityCheck &&
                            !accessibilityCheck.meetsWCAGAA &&
                            !doItAnyway
                        }
                        className={`btn-hand-drawn text-sm px-4 py-2 flex-1 transition-all ${
                            accessibilityCheck &&
                            !accessibilityCheck.meetsWCAGAA &&
                            !doItAnyway
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                        style={{
                            backgroundColor: previewColor,
                            color: (() => {
                                const hsl = hexToHsl(previewColor);
                                return hsl.l > 50
                                    ? "var(--color-neutral-900)"
                                    : "white";
                            })(),
                            borderColor: "var(--color-neutral-800)",
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserColorPicker;
