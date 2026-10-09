// src/TrainerCard.jsx
// Bottom sheet behind the avatar: who you are, your catch code, your theme,
// and the admin-y stuff
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Cake,
    Palette,
    Upload,
    Download,
    LogOut,
    Info,
    RotateCcw,
    X,
    QrCode,
    Pencil,
    ChevronLeft,
    Check,
    Lock,
    Medal,
} from "lucide-react";
import CatchCode from "./CatchCode";
import PronounSelector from "./PronounSelector";
import InterestSelector from "./InterestSelector";
import BirthdaySelector from "./BirthdaySelector";
import { seedTagsAndInterests } from "./seed";
import {
    loadTrainerProfile,
    saveTrainerProfile,
    buildCatchUrl,
    countCatches,
} from "./trainer";
import { THEME_PRESETS, getCurrentTheme, setTheme } from "./theme";
import { formatPronouns } from "./utils";
import {
    isUnlocked,
    unlockAt,
    nextMilestone,
    earnedBadges,
    getTrainerTitle,
} from "./unlocks";

const formatBirthday = (value) =>
    new Date(`${value}T00:00`).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
    });

function SheetButton({ icon: Icon, children, onClick, danger }) {
    return (
        <button
            onClick={onClick}
            className={`dex-btn border-2 border-stone-800 w-full flex items-center gap-3 text-base py-2.5 ${
                danger ? "bg-white text-red-700" : "btn-secondary"
            }`}
        >
            <Icon className="w-5 h-5" />
            {children}
        </button>
    );
}

function ThemeVersions({ best, onCustomize }) {
    const [current, setCurrent] = useState(getCurrentTheme);
    const canCustomize = isUnlocked("customizer", best);

    const pick = (preset) => {
        setTheme(preset);
        setCurrent(getCurrentTheme());
    };

    return (
        <section>
            <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-pixel text-xs text-stone-500">VERSION</h3>
                {canCustomize ? (
                    <button
                        onClick={onCustomize}
                        className="text-sm font-bold text-stone-600 flex items-center gap-1 underline underline-offset-2"
                    >
                        <Palette className="w-4 h-4" /> Customize
                    </button>
                ) : (
                    <span className="text-sm font-bold text-stone-400 flex items-center gap-1">
                        <Lock className="w-4 h-4" /> Customize at {unlockAt("customizer")}
                    </span>
                )}
            </div>
            <div className="grid grid-cols-4 gap-2">
                {THEME_PRESETS.map((preset) => {
                    const selected =
                        current.color === preset.color && current.scheme === preset.scheme;
                    const key = `version:${preset.name}`;
                    if (!isUnlocked(key, best)) {
                        return (
                            <div
                                key={preset.name}
                                className="flex flex-col items-center gap-1"
                                aria-label={`Locked until ${unlockAt(key)} friends`}
                            >
                                <span
                                    className="w-full h-10 border-2 border-dashed border-stone-400 bg-stone-100 flex items-center justify-center text-stone-400"
                                    style={{ borderRadius: "var(--radius-dex)" }}
                                >
                                    <Lock className="w-4 h-4" />
                                </span>
                                <span className="text-sm font-bold leading-none text-stone-400">
                                    {unlockAt(key)}
                                </span>
                            </div>
                        );
                    }
                    return (
                        <button
                            key={preset.name}
                            onClick={() => pick(preset)}
                            aria-pressed={selected}
                            className="flex flex-col items-center gap-1"
                        >
                            <span
                                className="relative w-full h-10 border-2 border-stone-800 flex items-center justify-center transition-transform active:scale-95"
                                style={{
                                    background: preset.color,
                                    borderRadius: "var(--radius-dex)",
                                    boxShadow: selected
                                        ? "0 0 0 2px #fff, 0 0 0 4px #1c1917"
                                        : "2px 2px 0 #1c1917",
                                }}
                            >
                                {selected && (
                                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                )}
                            </span>
                            <span className="text-sm font-bold leading-none">
                                {preset.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

// Progress toward the next unlock; past the last one, nothing to chase
function NextUnlock({ best }) {
    const next = nextMilestone(best);
    if (!next) return null;
    const left = next.at - best;
    return (
        <section>
            <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-pixel text-xs text-stone-500">NEXT UNLOCK</h3>
                <span className="font-pixel text-xs text-stone-500">
                    {best}/{next.at}
                </span>
            </div>
            <div className="h-3 border-2 border-stone-800 rounded-full overflow-hidden bg-stone-100">
                <div
                    className="h-full"
                    style={{
                        width: `${Math.min(100, (best / next.at) * 100)}%`,
                        background: "var(--color-shell)",
                    }}
                />
            </div>
            <p className="text-base text-stone-600 mt-1">
                {left} more friend{left === 1 ? "" : "s"} for <b>{next.name}</b>
            </p>
        </section>
    );
}

// Same building blocks as Add Friend, minus the relationship-y fields (tags,
// relationships, how we met) since those describe a friendship, not you
function ProfileEditor({ profile, onSave, onCancel }) {
    const [draft, setDraft] = useState(profile);
    const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
    const field =
        "w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600";
    const label = "block text-md font-medium text-stone-700 mb-1";

    return (
        <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
                e.preventDefault();
                if (!draft.name.trim()) return;
                onSave(draft);
            }}
        >
            <p className="text-stone-600 leading-snug">
                This is what friends get when they catch you.
            </p>
            <div>
                <label htmlFor="trainer-name" className={label}>
                    Name <span className="text-red-700">*</span>
                </label>
                <input
                    id="trainer-name"
                    className={field}
                    style={{ borderRadius: "var(--radius-dex)" }}
                    value={draft.name}
                    maxLength={80}
                    onChange={(e) => set("name", e.target.value)}
                    required
                />
            </div>
            <PronounSelector
                value={draft.pronouns}
                onChange={(pronouns) => set("pronouns", pronouns.join("/"))}
            />
            <div>
                <label htmlFor="trainer-about" className={label}>
                    About you
                </label>
                <textarea
                    id="trainer-about"
                    className={field}
                    style={{ borderRadius: "var(--radius-dex)" }}
                    rows={2}
                    value={draft.about}
                    maxLength={140}
                    placeholder="Plays bass, loves a long walk, always down for tacos"
                    onChange={(e) => set("about", e.target.value)}
                />
            </div>
            <InterestSelector
                value={draft.interests.join(", ")}
                onChange={(interests) =>
                    set("interests", interests ? interests.split(", ").filter(Boolean) : [])
                }
                prompt="What do you like to do? Your first 8 go in your catch code."
            />
            <BirthdaySelector
                value={draft.birthday}
                onChange={(e) => set("birthday", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="dex-btn border-2 border-stone-800 bg-white text-base"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="dex-btn btn-primary border-2 border-stone-800 text-base"
                >
                    Save
                </button>
            </div>
        </form>
    );
}

export default function TrainerCard({
    user,
    isDemoMode,
    stats,
    best = 0,
    onClose,
    onChangeTheme,
    onImport,
    onExport,
    onResetDemo,
    onAbout,
    onSignOut,
}) {
    const [profile, setProfile] = useState(() => loadTrainerProfile(user, isDemoMode));
    // "home" | "catch" | "edit"
    const [page, setPage] = useState("home");
    // How many people have caught you; null until loaded (or when there's no account)
    const [caughtBy, setCaughtBy] = useState(null);
    const canCount = !isDemoMode && !!user;

    useEffect(() => {
        if (!canCount) return;
        let cancelled = false;
        countCatches(user.uid)
            .then((count) => !cancelled && setCaughtBy(count))
            .catch((err) => console.warn("Couldn't count catches:", err));
        return () => {
            cancelled = true;
        };
    }, [canCount, user?.uid]);

    const openEditor = () => {
        // The interest chips read from the local list, which starts empty on a fresh device
        seedTagsAndInterests()
            .catch(() => {})
            .finally(() => setPage("edit"));
    };

    const photo = !isDemoMode && user?.photoURL;
    const badges = earnedBadges(best);
    const shiny = isUnlocked("badge:Sinnoh", best);
    const title = { home: "TRAINER CARD", catch: "CATCH ME", edit: "EDIT PROFILE" }[page];

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                role="dialog"
                aria-label="Trainer card"
                className="w-full max-w-md bg-white border-[2.5px] border-stone-900 border-b-0 safe-bottom max-h-[92vh] flex flex-col"
                style={{ borderRadius: "20px 20px 0 0" }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="dex-shell !pt-3 !pb-3 px-4 flex items-center gap-2 flex-shrink-0"
                    style={{ boxShadow: "none", borderRadius: "18px 18px 0 0" }}
                >
                    {page !== "home" && (
                        <button
                            onClick={() => setPage("home")}
                            aria-label="Back"
                            className="relative text-white -ml-1"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <span className="relative font-pixel text-white text-sm flex-1">
                        {title}
                    </span>
                    <button onClick={onClose} aria-label="Close" className="relative text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5 overflow-y-auto">
                    {page === "catch" && (
                        <CatchCode url={buildCatchUrl(profile, user)} name={profile.name} />
                    )}

                    {page === "edit" && (
                        <ProfileEditor
                            profile={profile}
                            onCancel={() => setPage("home")}
                            onSave={(next) => {
                                saveTrainerProfile(next);
                                setProfile(next);
                                setPage("home");
                            }}
                        />
                    )}

                    {page === "home" && (
                        <>
                            {/* ID panel */}
                            <div
                                className={`dex-card !p-4 flex items-center gap-4 ${shiny ? "trainer-shiny" : ""}`}
                            >
                                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-stone-800 bg-stone-200 flex items-center justify-center text-3xl font-bold text-stone-600 flex-shrink-0">
                                    {photo ? (
                                        <img
                                            src={user.photoURL}
                                            alt=""
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        profile.name[0]
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-2xl font-bold leading-tight line-clamp-2 break-words min-w-0">
                                            {profile.name}
                                        </div>
                                        <button
                                            onClick={openEditor}
                                            aria-label="Edit your profile"
                                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-stone-800 bg-white"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="font-pixel text-[10px] text-stone-500 mt-0.5">
                                        {getTrainerTitle(best).toUpperCase()}
                                    </div>
                                    {(profile.pronouns || profile.birthday) && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                            {profile.pronouns && (
                                                <span className="dex-pill !text-xs">
                                                    {formatPronouns(profile.pronouns) ||
                                                        profile.pronouns}
                                                </span>
                                            )}
                                            {profile.birthday && (
                                                <span className="dex-pill !text-xs flex items-center gap-1">
                                                    <Cake className="w-3.5 h-3.5" />
                                                    {formatBirthday(profile.birthday)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {profile.about && (
                                        <p className="text-base text-stone-600 leading-snug mt-1 line-clamp-2">
                                            {profile.about}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {profile.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 -mt-2">
                                    {profile.interests.map((interest) => (
                                        <span
                                            key={interest}
                                            className="dex-tag bg-amber-300 text-stone-900 border-stone-800"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div
                                className={`grid ${canCount ? "grid-cols-4" : "grid-cols-3"} gap-2 text-center`}
                            >
                                {[
                                    ["Friends", stats.friends],
                                    ["Hangouts", stats.hangouts],
                                    ["Besties", stats.besties],
                                    ...(canCount ? [["Caught you", caughtBy ?? "–"]] : []),
                                ].map(([label, value]) => (
                                    <div key={label} className="dex-card-muted !p-2">
                                        <div className="font-pixel text-lg">{value}</div>
                                        <div className="text-sm text-stone-600 leading-tight">
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage("catch")}
                                className="dex-btn border-2 border-stone-800 w-full flex items-center justify-center gap-2 text-xl py-3 text-white shadow-[3px_3px_0_#1c1917]"
                                style={{
                                    background: "var(--color-shell)",
                                    textShadow: "1px 1px 0 rgba(0,0,0,0.35)",
                                }}
                            >
                                <QrCode className="w-6 h-6" />
                                Let a friend catch you
                            </button>

                            {badges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 -mt-2">
                                    {badges.map((region) => (
                                        <span
                                            key={region}
                                            className="dex-tag bg-yellow-300 text-stone-900 border-stone-800 flex items-center gap-1"
                                        >
                                            <Medal className="w-3.5 h-3.5" />
                                            {region}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <NextUnlock best={best} />

                            <ThemeVersions best={best} onCustomize={onChangeTheme} />

                            <div className="flex flex-col gap-2">
                                {!isDemoMode && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <SheetButton icon={Upload} onClick={onImport}>
                                            Import
                                        </SheetButton>
                                        <SheetButton icon={Download} onClick={onExport}>
                                            Export
                                        </SheetButton>
                                    </div>
                                )}
                                {isDemoMode && (
                                    <SheetButton icon={RotateCcw} onClick={onResetDemo}>
                                        Reset demo friends
                                    </SheetButton>
                                )}
                                <SheetButton icon={Info} onClick={onAbout}>
                                    About Friendex
                                </SheetButton>
                                {!isDemoMode && user && (
                                    <SheetButton icon={LogOut} onClick={onSignOut} danger>
                                        Sign out
                                    </SheetButton>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
