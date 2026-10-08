// src/dex.js
// Shared helpers for the Pokédex-style UI: dex numbers, relationship "types",
// friendship tiers, hangouts, birthdays and photo handling.
import {
    Hand,
    Briefcase,
    GraduationCap,
    House,
    Smile,
    Star,
    Sparkles,
    Crown,
    Heart,
    Gem,
    Users,
    Tag,
} from "lucide-react";

// ---------- Dates ----------

// createdAt may be a Date, an ISO string, or a Firestore Timestamp-like {seconds}
export const toDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "object" && typeof value.seconds === "number") {
        return new Date(value.seconds * 1000);
    }
    const d = new Date(value);
    return isNaN(d) ? null : d;
};

// Birthdays come from <input type="date"> as "YYYY-MM-DD". new Date() would parse
// that as UTC midnight, which shows the previous day in US timezones.
export const parseBirthday = (value) => {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) return new Date(+match[1], +match[2] - 1, +match[3]);
    return toDate(value);
};

export const isBirthdayToday = (value) => {
    const bday = parseBirthday(value);
    if (!bday) return false;
    const now = new Date();
    return (
        bday.getMonth() === now.getMonth() && bday.getDate() === now.getDate()
    );
};

// ---------- Dex numbers ----------

// Friends are numbered in the order they were registered (createdAt, then id)
export const getDexNumbers = (friends) => {
    const sorted = [...(friends || [])].sort((a, b) => {
        const da = toDate(a.createdAt)?.getTime() ?? 0;
        const dbt = toDate(b.createdAt)?.getTime() ?? 0;
        return da - dbt || (a.id ?? 0) - (b.id ?? 0);
    });
    const numbers = new Map();
    sorted.forEach((f, i) => numbers.set(f.id, i + 1));
    return numbers;
};

export const formatDexNumber = (n) =>
    n ? `#${String(n).padStart(3, "0")}` : "#???";

// ---------- Relationship types & friendship tiers ----------

// Fixed colors (like Pokémon types) so they read the same in every theme.
// `tier` only applies to the friendship ladder; higher = closer.
const TYPE_DEFS = {
    Acquaintance: { color: "#94a3b8", icon: Hand, tier: 1 },
    Colleague: { color: "#3b82f6", icon: Briefcase },
    Coworker: { color: "#3b82f6", icon: Briefcase },
    Classmate: { color: "#6366f1", icon: GraduationCap },
    Neighbor: { color: "#65a30d", icon: House },
    Friend: { color: "#22c55e", icon: Smile, tier: 2 },
    "Good Friend": { color: "#f59e0b", icon: Star, tier: 3 },
    Bestie: { color: "#ec4899", icon: Sparkles, tier: 4 },
    "Bestest Friend": {
        color: "#eab308",
        icon: Crown,
        tier: 5,
        gradient: "linear-gradient(135deg, #fde047, #f59e0b 45%, #fbbf24 70%, #fef08a)",
    },
    Boyfriend: { color: "#e11d48", icon: Heart },
    Girlfriend: { color: "#e11d48", icon: Heart },
    Partner: { color: "#e11d48", icon: Heart },
    Fiance: { color: "#be123c", icon: Gem },
    Husband: { color: "#be123c", icon: Gem },
    Wife: { color: "#be123c", icon: Gem },
    Sister: { color: "#8b5cf6", icon: Users },
    Brother: { color: "#8b5cf6", icon: Users },
    Mother: { color: "#8b5cf6", icon: Users },
    Father: { color: "#8b5cf6", icon: Users },
    Son: { color: "#8b5cf6", icon: Users },
    Daughter: { color: "#8b5cf6", icon: Users },
};

export const getRelationshipType = (name) =>
    TYPE_DEFS[name] || { color: null, icon: Tag };

// Visual treatment for the closest friendship level a friend has
export const FRIENDSHIP_TIERS = {
    1: { label: "Acquaintance", stars: 0, ring: "#94a3b8", icon: Hand },
    2: { label: "Friend", stars: 1, ring: "#22c55e", icon: Smile },
    3: { label: "Good Friend", stars: 2, ring: "#f59e0b", icon: Star },
    4: { label: "Bestie", stars: 3, ring: "#ec4899", icon: Sparkles, sparkle: true },
    5: { label: "Bestest Friend", stars: 4, ring: "#eab308", icon: Crown, sparkle: true, crown: true },
};

const ROMANTIC = ["Boyfriend", "Girlfriend", "Partner", "Fiance", "Husband", "Wife"];
const FAMILY = ["Sister", "Brother", "Mother", "Father", "Son", "Daughter"];

// Returns the most "special" bond: romantic and family get their own look,
// otherwise the highest rung on the friendship ladder.
export const getFriendshipTier = (friend) => {
    const rels = friend?.keyInfo?.relationships || [];
    let best = 0;
    for (const r of rels) best = Math.max(best, TYPE_DEFS[r]?.tier || 0);
    if (best >= 4) return { level: best, ...FRIENDSHIP_TIERS[best] };
    if (rels.some((r) => ROMANTIC.includes(r)))
        return { level: 4, label: "Sweetheart", stars: 0, ring: "#e11d48", icon: Heart, hearts: true };
    if (rels.some((r) => FAMILY.includes(r)))
        return { level: 3, label: "Family", stars: 0, ring: "#8b5cf6", icon: Users };
    if (best) return { level: best, ...FRIENDSHIP_TIERS[best] };
    return null;
};

// ---------- Hangouts ----------

const dayKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayKey = () => dayKey(new Date());

// hangouts is an array of "YYYY-MM-DD" day keys
export const getLastHangout = (friend) => {
    const list = friend?.hangouts || [];
    if (!list.length) return null;
    return [...list].sort().at(-1);
};

export const formatHangoutAgo = (key) => {
    if (!key) return null;
    const then = parseBirthday(key);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.round((today - then) / 86400000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 14) return "last week";
    if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
    return then.toLocaleDateString("en-US", {
        month: "short",
        year: then.getFullYear() === now.getFullYear() ? undefined : "numeric",
        day: then.getFullYear() === now.getFullYear() ? "numeric" : undefined,
    });
};

// ---------- Photos ----------

// Generated initial avatars are SVG data URLs; anything else is a real photo
export const hasRealPhoto = (friend) =>
    typeof friend?.profilePicture === "string" &&
    friend.profilePicture.startsWith("data:image/") &&
    !friend.profilePicture.startsWith("data:image/svg");

export const isGeneratedAvatar = (dataUrl) =>
    typeof dataUrl === "string" && dataUrl.startsWith("data:image/svg");

// Downscale an image (File, Blob or data URL) to a JPEG data URL. Keeps photos
// small enough for IndexedDB and for a single Firestore document (1MB limit).
export const compressImage = (source, maxDim = 512, quality = 0.82) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        const url =
            typeof source === "string" ? source : URL.createObjectURL(source);
        img.onload = () => {
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            if (typeof source !== "string") URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = (e) => {
            if (typeof source !== "string") URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });

export const newPhotoId = () =>
    crypto.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
