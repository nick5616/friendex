// src/unlocks.js
// Things you unlock by growing your Friendex. Versions follow game release
// order; the big badges land on each region's real dex size (Kanto 151 →
// Sinnoh 493). Unlocks are permanent: they key off the most friends you've
// ever had, so deleting someone never takes anything away.

export const MILESTONES = [
    { at: 5, key: "version:Yellow", name: "Yellow Version", blurb: "A new trainer card theme" },
    { at: 10, key: "version:Crystal", name: "Crystal Version", blurb: "A new trainer card theme", ask: true },
    { at: 20, key: "version:Ruby", name: "Ruby Version", blurb: "A new trainer card theme" },
    { at: 30, key: "customizer", name: "Color Customizer", blurb: "Pick any color you want" },
    { at: 40, key: "version:Sapphire", name: "Sapphire Version", blurb: "A new trainer card theme" },
    { at: 50, key: "schemes", name: "Color Harmonies", blurb: "Complementary, triadic and more in the customizer" },
    { at: 60, key: "version:Emerald", name: "Emerald Version", blurb: "A new trainer card theme" },
    { at: 75, key: "mixItUp", name: "Mix It Up!", blurb: "Different hues for every bit of text" },
    { at: 100, key: "version:Pearl", name: "Pearl Version", blurb: "A new trainer card theme" },
    { at: 151, key: "badge:Kanto", name: "Kanto Badge", blurb: "As many friends as the original 151", badge: "Kanto" },
    { at: 251, key: "badge:Johto", name: "Johto Badge", blurb: "Your dex reaches Celebi territory", badge: "Johto" },
    { at: 386, key: "badge:Hoenn", name: "Hoenn Badge", blurb: "Three regions' worth of friends", badge: "Hoenn" },
    { at: 493, key: "badge:Sinnoh", name: "Sinnoh Badge", blurb: "A full Gen IV dex. Your trainer card goes shiny", badge: "Sinnoh" },
];

const TITLES = [
    [493, "Sinnoh Champion"],
    [386, "Hoenn Champion"],
    [251, "Johto Champion"],
    [151, "Kanto Champion"],
    [100, "Elite Four"],
    [50, "Gym Leader"],
    [30, "Ace Trainer"],
    [10, "Trainer"],
    [0, "Rookie"],
];

export const getTrainerTitle = (best) => TITLES.find(([at]) => best >= at)[1];

const bestKey = (isDemoMode) =>
    isDemoMode ? "friendex_bestCount_demo" : "friendex_bestCount";

// null when this device has never recorded a count
export const loadBest = (isDemoMode) => {
    try {
        const raw = localStorage.getItem(bestKey(isDemoMode));
        return raw === null ? null : Number(raw) || 0;
    } catch {
        return null;
    }
};

export const saveBest = (isDemoMode, count) => {
    try {
        localStorage.setItem(bestKey(isDemoMode), String(count));
    } catch {
        // Storage unavailable: unlocks just won't persist past this session
    }
};

const keyToMilestone = Object.fromEntries(MILESTONES.map((m) => [m.key, m]));

// Keys with no milestone (Red, Blue) are always available
export const isUnlocked = (key, best) => (best ?? 0) >= (keyToMilestone[key]?.at ?? 0);

export const unlockAt = (key) => keyToMilestone[key]?.at ?? 0;

export const nextMilestone = (best) => MILESTONES.find((m) => m.at > (best ?? 0)) ?? null;

export const milestonesBetween = (from, to) =>
    MILESTONES.filter((m) => m.at > from && m.at <= to);

export const earnedBadges = (best) =>
    MILESTONES.filter((m) => m.badge && (best ?? 0) >= m.at).map((m) => m.badge);
