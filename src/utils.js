export const capitalizeEachFirstLetter = (sentence) => {
    return sentence
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export const fromCommaStringToArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }
    if (value) {
        return value.split(",").map((tag) => tag.trim());
    }
    return [];
};

export const fromArrayToCommaString = (value) => {
    if (Array.isArray(value)) {
        return value.join(", ");
    }
    return value || "";
};

/**
 * Convert hex color to HSL
 * @param {string} hex - Hex color (e.g., "#ff0000" or "ff0000")
 * @returns {object} Object with h, s, l values
 */
export const hexToHsl = (hex) => {
    // Remove # if present
    hex = hex.replace("#", "");
    
    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
            default: h = 0;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
};

/**
 * Convert HSL to hex color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string
 */
export const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

// Default amber color
export const DEFAULT_COLOR = "#f59e0b"; // Amber
export const DEFAULT_COLOR_HSL = { h: 45, s: 85, l: 50 };

/**
 * Color scheme types ordered by number of colors
 */
export const COLOR_SCHEMES = {
    MONOCHROME: "monochrome", // 1 color
    COMPLEMENTARY: "complementary", // 2 colors
    TRIADIC: "triadic", // 3 colors
    SPLIT_COMPLEMENTARY: "split-complementary", // 3 colors
    SQUARE: "square", // 4 colors
    RECTANGULAR: "rectangular", // 4 colors
};

/**
 * Get scheme info (name and number of colors)
 */
export const getSchemeInfo = (schemeType) => {
    const schemes = {
        [COLOR_SCHEMES.MONOCHROME]: { name: "Monochrome", colors: 1 },
        [COLOR_SCHEMES.COMPLEMENTARY]: { name: "Complementary", colors: 2 },
        [COLOR_SCHEMES.TRIADIC]: { name: "Triadic", colors: 3 },
        [COLOR_SCHEMES.SPLIT_COMPLEMENTARY]: { name: "Split-Complementary", colors: 3 },
        [COLOR_SCHEMES.SQUARE]: { name: "Square", colors: 4 },
        [COLOR_SCHEMES.RECTANGULAR]: { name: "Rectangular", colors: 4 },
    };
    return schemes[schemeType] || schemes[COLOR_SCHEMES.MONOCHROME];
};

/**
 * Calculate complementary color (hue shifted 180 degrees, same saturation)
 * @param {object} hsl - HSL color object with h, s, l
 * @returns {object} HSL color object for complementary color
 */
export const calculateComplementaryColor = (hsl) => {
    const complementaryHue = (hsl.h + 180) % 360;
    return {
        h: complementaryHue,
        s: hsl.s,
        l: hsl.l
    };
};

/**
 * Calculate color harmony scheme colors
 * @param {string} baseColor - Base hex color
 * @param {string} schemeType - One of COLOR_SCHEMES values
 * @returns {Array} Array of hex colors for the scheme
 */
export const calculateColorHarmony = (baseColor, schemeType = COLOR_SCHEMES.MONOCHROME) => {
    const hsl = hexToHsl(baseColor);
    const colors = [baseColor]; // Always include base color as first
    
    switch (schemeType) {
        case COLOR_SCHEMES.MONOCHROME:
            // Just the base color
            return [baseColor];
            
        case COLOR_SCHEMES.COMPLEMENTARY:
            // Base + complement (180°)
            return [
                baseColor,
                hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
            ];
            
        case COLOR_SCHEMES.TRIADIC:
            // Base + two colors 120° apart
            return [
                baseColor,
                hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
                hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
            ];
            
        case COLOR_SCHEMES.SPLIT_COMPLEMENTARY:
            // Base + two colors 150° from complement (30° from complement on each side)
            return [
                baseColor,
                hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
                hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
            ];
            
        case COLOR_SCHEMES.SQUARE:
            // Four colors 90° apart
            return [
                baseColor,
                hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
                hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
                hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)
            ];
            
        case COLOR_SCHEMES.RECTANGULAR:
            // Two complementary pairs (60° offset)
            return [
                baseColor,
                hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l),
                hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
                hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
            ];
            
        default:
            return [baseColor];
    }
};

/**
 * Calculate high-contrast lightness variants from a base color
 * @param {string} hexColor - Base hex color
 * @returns {object} Object with light and dark HSL variants and appropriate text colors
 */
export const calculateUserColorVariants = (hexColor) => {
    const hsl = hexToHsl(hexColor);
    const complementaryHsl = calculateComplementaryColor(hsl);
    
    // High lightness variant (for tags) - around 90% lightness
    const lightL = 90;
    const lightHsl = `hsl(${hsl.h}, ${hsl.s}%, ${lightL}%)`;
    
    // Low lightness variant (for pronouns) - around 25% lightness
    const darkL = 25;
    const darkHsl = `hsl(${hsl.h}, ${hsl.s}%, ${darkL}%)`;
    
    // Calculate appropriate text colors for contrast
    // For light background, use dark text; for dark background, use light text
    const lightTextColor = `hsl(0, 0%, 15%)`; // Dark text for light background
    const darkTextColor = `hsl(0, 0%, 95%)`; // Light text for dark background
    
    // Complementary color variants
    const complementaryBase = `hsl(${complementaryHsl.h}, ${complementaryHsl.s}%, ${complementaryHsl.l}%)`;
    const complementaryLight = `hsl(${complementaryHsl.h}, ${complementaryHsl.s}%, 95%)`;
    const complementaryDark = `hsl(${complementaryHsl.h}, ${complementaryHsl.s}%, 50%)`;
    
    return {
        base: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        light: lightHsl,
        lighter: `hsl(${hsl.h}, ${hsl.s}%, 98%)`,
        dark: darkHsl,
        darker: `hsl(${hsl.h}, ${hsl.s}%, 30%)`,
        darkest: `hsl(${hsl.h}, ${hsl.s}%, 20%)`,
        lightText: lightTextColor,
        darkText: darkTextColor,
        hsl: hsl,
        complementary: {
            base: complementaryBase,
            light: complementaryLight,
            dark: complementaryDark,
            hsl: complementaryHsl
        }
    };
};

/**
 * Get user color or default to amber
 * @returns {string} Hex color string
 */
export const getUserColor = () => {
    return localStorage.getItem("userColor") || DEFAULT_COLOR;
};

/**
 * Create semantic color mapping for UI elements based on color scheme
 * @param {Array<string>} schemeColors - Array of hex colors in the scheme
 * @param {boolean} useSameColorText - Whether to use theme colors for text
 * @returns {object} Object mapping element roles to color values
 */
const createElementColorMapping = (schemeColors, useSameColorText) => {
    const numColors = schemeColors.length;
    
    // Calculate variants for each color
    const colorVariants = schemeColors.map(color => {
        const variants = calculateColorVariants(color);
        return {
            hex: color,
            hsl: hexToHsl(color),
            ...variants
        };
    });
    
    // Helper to get text color for a background
    const getContrastTextColor = (bgColor, bgIsLight) => {
        if (!useSameColorText) {
            // Use neutral black/white
            return bgIsLight ? "#000000" : "#FFFFFF";
        }
        // Use theme color variants
        let bgHsl;
        if (typeof bgColor === 'string' && bgColor.startsWith('hsl')) {
            // Extract from HSL string
            const match = bgColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
                bgHsl = { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
            } else {
                bgHsl = null;
            }
        } else {
            // Assume it's hex
            bgHsl = hexToHsl(bgColor);
        }
        
        if (!bgHsl) {
            return bgIsLight ? "#000000" : "#FFFFFF";
        }
        
        if (bgIsLight) {
            // Dark text on light background
            return `hsl(${bgHsl.h}, ${bgHsl.s}%, 25%)`;
        } else {
            // Light text on dark background
            return `hsl(${bgHsl.h}, ${bgHsl.s}%, 90%)`;
        }
    };
    
    const mapping = {};
    
    if (numColors === 1) {
        // Monochrome: Must use light tags / dark pills
        const c1 = colorVariants[0];
        mapping.bgApp = c1.lighter;
        mapping.title = c1.dark;
        mapping.btnBg = c1.base;
        mapping.btnText = getContrastTextColor(c1.base, c1.hsl.l > 50);
        mapping.tagBg = c1.light; // Light required
        mapping.tagText = getContrastTextColor(c1.light, true);
        mapping.pillBg = c1.dark; // Dark required
        mapping.pillText = getContrastTextColor(c1.dark, false);
        mapping.infoBg = c1.light; // Same as buttons
        mapping.infoText = getContrastTextColor(c1.light, true);
    } else if (numColors === 2) {
        // Complementary: Use different colors, flexible lightness
        const c1 = colorVariants[0];
        const c2 = colorVariants[1];
        mapping.bgApp = c1.lighter;
        mapping.title = c2.dark; // Stands out
        mapping.btnBg = c1.base;
        mapping.btnText = getContrastTextColor(c1.base, c1.hsl.l > 50);
        mapping.tagBg = c2.light; // Different color, light for contrast
        mapping.tagText = getContrastTextColor(c2.light, true);
        mapping.pillBg = c2.base; // Different color, base works well
        mapping.pillText = getContrastTextColor(c2.base, c2.hsl.l > 50);
        mapping.infoBg = c1.light; // Same as buttons
        mapping.infoText = getContrastTextColor(c1.light, true);
    } else if (numColors === 3) {
        // Triadic/Split-Complementary: More differentiation
        const c1 = colorVariants[0];
        const c2 = colorVariants[1];
        const c3 = colorVariants[2];
        mapping.bgApp = c1.lighter;
        mapping.title = c3.dark; // Most distinct
        mapping.btnBg = c1.base;
        mapping.btnText = getContrastTextColor(c1.base, c1.hsl.l > 50);
        mapping.tagBg = c2.light; // Different color
        mapping.tagText = getContrastTextColor(c2.light, true);
        mapping.pillBg = c3.light; // Different color, can use light
        mapping.pillText = getContrastTextColor(c3.light, true);
        mapping.infoBg = c2.light; // Different from buttons
        mapping.infoText = getContrastTextColor(c2.light, true);
    } else if (numColors >= 4) {
        // Square/Rectangular: Maximum differentiation
        const c1 = colorVariants[0];
        const c2 = colorVariants[1];
        const c3 = colorVariants[2];
        const c4 = colorVariants[3];
        mapping.bgApp = c1.lighter;
        mapping.title = c4.dark; // Most distinct
        mapping.btnBg = c1.base;
        mapping.btnText = getContrastTextColor(c1.base, c1.hsl.l > 50);
        mapping.tagBg = c2.light; // Different color
        mapping.tagText = getContrastTextColor(c2.light, true);
        mapping.pillBg = c3.light; // Different color, can use light
        mapping.pillText = getContrastTextColor(c3.light, true);
        mapping.infoBg = c2.light; // Different from buttons
        mapping.infoText = getContrastTextColor(c2.light, true);
    }
    
    // Set text colors for general use
    mapping.textDark = useSameColorText 
        ? colorVariants[0].dark 
        : "#000000";
    mapping.textLight = useSameColorText 
        ? colorVariants[0].light 
        : "#FFFFFF";
    
    return mapping;
};

/**
 * Calculate variants for a specific color (lightness variants)
 * @param {string} hexColor - Base hex color
 * @returns {object} Object with light and dark HSL variants
 */
const calculateColorVariants = (hexColor) => {
    const hsl = hexToHsl(hexColor);
    
    // High lightness variant (for tags) - around 90% lightness
    const lightL = 90;
    const lightHsl = `hsl(${hsl.h}, ${hsl.s}%, ${lightL}%)`;
    
    // Low lightness variant (for pronouns) - around 25% lightness
    const darkL = 25;
    const darkHsl = `hsl(${hsl.h}, ${hsl.s}%, ${darkL}%)`;
    
    // Calculate appropriate text colors for contrast
    const lightTextColor = `hsl(0, 0%, 15%)`; // Dark text for light background
    const darkTextColor = `hsl(0, 0%, 95%)`; // Light text for dark background
    
    return {
        base: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        light: lightHsl,
        lighter: `hsl(${hsl.h}, ${hsl.s}%, 98%)`,
        dark: darkHsl,
        darker: `hsl(${hsl.h}, ${hsl.s}%, 30%)`,
        darkest: `hsl(${hsl.h}, ${hsl.s}%, 20%)`,
        lightText: lightTextColor,
        darkText: darkTextColor,
        hsl: hsl,
    };
};

/**
 * Apply user color CSS variables to the document root
 * Uses color scheme to distribute colors across primary, secondary, accent, etc.
 * @param {string} hexColor - User's selected color in hex format (optional, will use stored or default)
 * @param {boolean} useSameColorText - If true, use the same color for text (affects contrast)
 * @param {string} colorScheme - Color scheme type (monochrome, complementary, triadic, etc.)
 * @param {boolean} mixItUp - If true, allow text colors to use different hues from backgrounds
 */
export const applyUserColor = (hexColor, useSameColorText = false, colorScheme = COLOR_SCHEMES.MONOCHROME, mixItUp = false) => {
    // Use provided color, or get from storage, or use default
    const colorToUse = hexColor || getUserColor();
    
    // Calculate color harmony based on scheme
    const schemeColors = calculateColorHarmony(colorToUse, colorScheme);
    
    // Get variants for the base color (first color in scheme)
    const baseVariants = calculateUserColorVariants(colorToUse);
    const root = document.documentElement;
    
    // Create semantic element color mapping
    const elementMapping = createElementColorMapping(schemeColors, useSameColorText);
    
    // Set semantic CSS variables from mapping
    root.style.setProperty("--color-bg-app", elementMapping.bgApp);
    root.style.setProperty("--color-title", elementMapping.title);
    root.style.setProperty("--color-btn-bg", elementMapping.btnBg);
    root.style.setProperty("--color-btn-text", elementMapping.btnText);
    root.style.setProperty("--color-tag-bg", elementMapping.tagBg);
    root.style.setProperty("--color-tag-text", elementMapping.tagText);
    root.style.setProperty("--color-pill-bg", elementMapping.pillBg);
    root.style.setProperty("--color-pill-text", elementMapping.pillText);
    root.style.setProperty("--color-info-bg", elementMapping.infoBg);
    root.style.setProperty("--color-info-text", elementMapping.infoText);
    root.style.setProperty("--color-text-dark", elementMapping.textDark);
    root.style.setProperty("--color-text-light", elementMapping.textLight);
    
    // Calculate variants for each color in the scheme
    const schemeVariants = schemeColors.map(color => calculateColorVariants(color));
    
    // Determine which colors to use for primary, secondary, accent, etc.
    // Distribute scheme colors across different CSS variables
    const primaryColor = schemeColors[0] || colorToUse;
    const secondaryColor = schemeColors[1] || schemeColors[0] || colorToUse;
    const accentColor = schemeColors[2] || schemeColors[1] || schemeColors[0] || colorToUse;
    const successColor = schemeColors[1] || schemeColors[0] || colorToUse;
    const infoColor = schemeColors[2] || schemeColors[1] || schemeColors[0] || colorToUse;
    const warningColor = schemeColors[schemeColors.length - 1] || schemeColors[0] || colorToUse;
    
    // Get variants for each assigned color
    const primaryVariants = calculateColorVariants(primaryColor);
    const secondaryVariants = calculateColorVariants(secondaryColor);
    const accentVariants = calculateColorVariants(accentColor);
    const successVariants = calculateColorVariants(successColor);
    const infoVariants = calculateColorVariants(infoColor);
    const warningVariants = calculateColorVariants(warningColor);
    
    // Determine text colors based on useSameColorText and mixItUp preferences
    let lightTextColor, darkTextColor;
    if (useSameColorText) {
        if (mixItUp && schemeColors.length > 1) {
            // Use different hue for text - use the second color in the scheme for text
            const textColor = schemeColors[1] || schemeColors[0];
            const textHsl = hexToHsl(textColor);
            // For light backgrounds, use dark variant of text color
            lightTextColor = `hsl(${textHsl.h}, ${textHsl.s}%, 25%)`;
            // For dark backgrounds, use light variant of text color
            darkTextColor = `hsl(${textHsl.h}, ${textHsl.s}%, 90%)`;
        } else {
            // Apply theme: Use opposite lightness variants from theme for contrast
            // Light backgrounds get dark text variant, dark backgrounds get light text variant
            lightTextColor = baseVariants.dark; // Dark variant for light backgrounds
            darkTextColor = baseVariants.light; // Light variant for dark backgrounds
        }
    } else {
        // Don't apply theme: Use pure black/white for maximum contrast
        const accessibilityCheck = checkContrastAccessibility(colorToUse, false);
        const recommendedText = accessibilityCheck.recommendedTextColor === "white" ? "#FFFFFF" : "#000000";
        lightTextColor = recommendedText; // Pure black or white for light backgrounds
        darkTextColor = recommendedText; // Pure black or white for dark backgrounds
    }
    
    // Set user color variables (always use base color)
    root.style.setProperty("--color-user", baseVariants.base);
    root.style.setProperty("--color-user-light", baseVariants.light);
    root.style.setProperty("--color-user-lighter", baseVariants.lighter);
    root.style.setProperty("--color-user-dark", baseVariants.dark);
    root.style.setProperty("--color-user-darker", baseVariants.darker);
    root.style.setProperty("--color-user-darkest", baseVariants.darkest);
    root.style.setProperty("--color-user-text-light", lightTextColor);
    root.style.setProperty("--color-user-text-dark", darkTextColor);
    
    // Set primary colors (first color in scheme)
    root.style.setProperty("--color-primary", primaryVariants.base);
    root.style.setProperty("--color-primary-light", primaryVariants.light);
    root.style.setProperty("--color-primary-lighter", primaryVariants.lighter);
    root.style.setProperty("--color-primary-dark", primaryVariants.dark);
    root.style.setProperty("--color-primary-darker", primaryVariants.darker);
    root.style.setProperty("--color-primary-darkest", primaryVariants.darkest);
    
    // Set secondary colors (second color in scheme, or first if only one)
    root.style.setProperty("--color-secondary", secondaryVariants.base);
    root.style.setProperty("--color-secondary-light", secondaryVariants.light);
    root.style.setProperty("--color-secondary-lighter", secondaryVariants.lighter);
    root.style.setProperty("--color-secondary-dark", secondaryVariants.dark);
    root.style.setProperty("--color-secondary-darker", secondaryVariants.darker);
    root.style.setProperty("--color-secondary-darkest", secondaryVariants.darkest);
    
    // Set accent colors (third color in scheme, or second, or first)
    root.style.setProperty("--color-accent", accentVariants.base);
    root.style.setProperty("--color-accent-light", accentVariants.light);
    root.style.setProperty("--color-accent-dark", accentVariants.dark);
    
    // Set semantic colors using different scheme colors
    root.style.setProperty("--color-success", successVariants.base);
    root.style.setProperty("--color-success-light", successVariants.light);
    root.style.setProperty("--color-success-dark", successVariants.dark);
    
    root.style.setProperty("--color-info", infoVariants.base);
    root.style.setProperty("--color-info-light", infoVariants.light);
    root.style.setProperty("--color-info-dark", infoVariants.dark);
    
    root.style.setProperty("--color-warning", warningVariants.base);
    root.style.setProperty("--color-warning-light", warningVariants.light);
    root.style.setProperty("--color-warning-dark", warningVariants.dark);
    
    root.style.setProperty("--color-action-verb", primaryVariants.base);
    
    // Set complementary color for delete button (use last color in scheme, or complementary)
    const complementaryColor = schemeColors[schemeColors.length - 1] || calculateComplementaryColor(hexToHsl(colorToUse));
    const complementaryHex = typeof complementaryColor === 'string' 
        ? complementaryColor 
        : hslToHex(complementaryColor.h, complementaryColor.s, complementaryColor.l);
    const complementaryVariants = calculateColorVariants(complementaryHex);
    root.style.setProperty("--color-complementary", complementaryVariants.base);
    root.style.setProperty("--color-complementary-light", complementaryVariants.light);
    root.style.setProperty("--color-complementary-dark", complementaryVariants.dark);
    
    // Set theme colors for reference
    schemeColors.forEach((color, index) => {
        root.style.setProperty(`--color-theme-${index + 1}`, color);
    });
};

/**
 * Convert hex color to RGB values (0-255)
 * @param {string} hex - Hex color (e.g., "#ff0000" or "ff0000")
 * @returns {object} Object with r, g, b values (0-255)
 */
export const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
    };
};

/**
 * Apply gamma correction and calculate relative luminance (WCAG 2.x formula)
 * @param {number} value - RGB component value (0-255)
 * @returns {number} Relative luminance component
 */
const getLuminanceComponent = (value) => {
    const normalized = value / 255;
    if (normalized <= 0.03928) {
        return normalized / 12.92;
    }
    return Math.pow((normalized + 0.055) / 1.055, 2.4);
};

/**
 * Calculate relative luminance for a color (WCAG 2.x formula)
 * @param {string} hex - Hex color string
 * @returns {number} Relative luminance (0-1)
 */
export const calculateRelativeLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    const r = getLuminanceComponent(rgb.r);
    const g = getLuminanceComponent(rgb.g);
    const b = getLuminanceComponent(rgb.b);
    
    // WCAG 2.x relative luminance formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculate contrast ratio between two colors (WCAG 2.x formula)
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @returns {number} Contrast ratio (1-21)
 */
export const calculateContrastRatio = (color1, color2) => {
    const l1 = calculateRelativeLuminance(color1);
    const l2 = calculateRelativeLuminance(color2);
    
    // Ensure lighter color is L1
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    // WCAG contrast ratio formula
    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check contrast accessibility for a color
 * @param {string} color - Hex color to check
 * @param {boolean} useSameColorText - If true, check contrast between theme lightness variants (light bg vs dark text, dark bg vs light text)
 * @returns {object} Accessibility check results
 */
export const checkContrastAccessibility = (color, useSameColorText = false) => {
    if (useSameColorText) {
        // When applying theme: Check contrast between opposite lightness variants
        // Light backgrounds (90% lightness) vs dark text (25% lightness)
        // Dark backgrounds (25% lightness) vs light text (90% lightness)
        const hsl = hexToHsl(color);
        const lightBg = hslToHex(hsl.h, hsl.s, 90); // Light background variant
        const darkBg = hslToHex(hsl.h, hsl.s, 25); // Dark background variant
        const lightText = hslToHex(hsl.h, hsl.s, 90); // Light text variant
        const darkText = hslToHex(hsl.h, hsl.s, 25); // Dark text variant
        
        // Check both combinations: light bg with dark text, and dark bg with light text
        const contrastLightBg = calculateContrastRatio(lightBg, darkText);
        const contrastDarkBg = calculateContrastRatio(darkBg, lightText);
        
        // Use the worst case (minimum contrast) for accessibility check
        const worstContrast = Math.min(contrastLightBg, contrastDarkBg);
        
        const meetsWCAGAA = worstContrast >= 4.5;
        const meetsWCAGAAA = worstContrast >= 7;
        
        let warning = null;
        if (!meetsWCAGAA) {
            warning = "Contrast ratio not high enough. The stuff's going to be hard to read.";
        }
        
        return {
            meetsWCAGAA,
            meetsWCAGAAA,
            recommendedTextColor: null, // Not applicable when using theme
            contrastRatio: worstContrast,
            warning,
            contrastWithBlack: contrastLightBg, // Light bg contrast
            contrastWithWhite: contrastDarkBg, // Dark bg contrast
        };
    }
    
    // When not applying theme: Check base color against black/white
    const BLACK = "#000000";
    const WHITE = "#FFFFFF";
    
    const contrastWithBlack = calculateContrastRatio(color, BLACK);
    const contrastWithWhite = calculateContrastRatio(color, WHITE);
    
    // Determine recommended text color (use the one with better contrast)
    const recommendedTextColor = contrastWithWhite > contrastWithBlack ? "white" : "black";
    const bestContrast = Math.max(contrastWithBlack, contrastWithWhite);
    
    // WCAG AA: 4.5:1 for normal text, 3:1 for large text
    // WCAG AAA: 7:1 for normal text, 4.5:1 for large text
    // We'll use 4.5:1 as the standard (normal text)
    const meetsWCAGAA = bestContrast >= 4.5;
    const meetsWCAGAAA = bestContrast >= 7;
    
    let warning = null;
    if (!meetsWCAGAA) {
        warning = "Contrast ratio not high enough. The stuff's going to be hard to read.";
    }
    
    return {
        meetsWCAGAA,
        meetsWCAGAAA,
        recommendedTextColor,
        contrastRatio: bestContrast,
        warning,
        contrastWithBlack,
        contrastWithWhite,
    };
};
