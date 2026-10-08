// src/TrainerCard.jsx
// Bottom sheet behind the avatar: who you are, your catch code, your theme,
// and the admin-y stuff
import { useState } from "react";
import { motion } from "framer-motion";
import {
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
} from "lucide-react";
import CatchCode from "./CatchCode";
import { loadTrainerProfile, saveTrainerProfile, buildCatchUrl } from "./trainer";
import { THEME_PRESETS, getCurrentTheme, setTheme } from "./theme";

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

function ThemeVersions({ onCustomize }) {
    const [current, setCurrent] = useState(getCurrentTheme);

    const pick = (preset) => {
        setTheme(preset);
        setCurrent(getCurrentTheme());
    };

    return (
        <section>
            <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-pixel text-xs text-stone-500">VERSION</h3>
                <button
                    onClick={onCustomize}
                    className="text-sm font-bold text-stone-600 flex items-center gap-1 underline underline-offset-2"
                >
                    <Palette className="w-4 h-4" /> Customize
                </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {THEME_PRESETS.map((preset) => {
                    const selected =
                        current.color === preset.color && current.scheme === preset.scheme;
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

function ProfileEditor({ profile, onSave, onCancel }) {
    const [draft, setDraft] = useState(profile);
    const field =
        "w-full px-3 py-2 border-2 border-stone-800 bg-white text-lg focus:outline-none focus:ring-2 focus:ring-stone-500";

    return (
        <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
                e.preventDefault();
                if (!draft.name.trim()) return;
                onSave(draft);
            }}
        >
            <p className="text-stone-600 leading-snug">
                This is what friends get when they catch you.
            </p>
            <label className="flex flex-col gap-1">
                <span className="font-pixel text-xs text-stone-500">NAME</span>
                <input
                    className={field}
                    style={{ borderRadius: "var(--radius-dex)" }}
                    value={draft.name}
                    maxLength={80}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    required
                />
            </label>
            <label className="flex flex-col gap-1">
                <span className="font-pixel text-xs text-stone-500">PRONOUNS</span>
                <input
                    className={field}
                    style={{ borderRadius: "var(--radius-dex)" }}
                    value={draft.pronouns}
                    maxLength={40}
                    placeholder="she/her, they/them…"
                    onChange={(e) => setDraft({ ...draft, pronouns: e.target.value })}
                />
            </label>
            <label className="flex flex-col gap-1">
                <span className="font-pixel text-xs text-stone-500">ABOUT YOU</span>
                <textarea
                    className={field}
                    style={{ borderRadius: "var(--radius-dex)" }}
                    rows={2}
                    value={draft.about}
                    maxLength={140}
                    placeholder="Plays bass, loves a long walk, always down for tacos"
                    onChange={(e) => setDraft({ ...draft, about: e.target.value })}
                />
            </label>
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

    const photo = !isDemoMode && user?.photoURL;
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
                            <div className="dex-card !p-4 flex items-center gap-4">
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
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-2xl font-bold leading-tight truncate">
                                            {profile.name}
                                        </div>
                                        <button
                                            onClick={() => setPage("edit")}
                                            aria-label="Edit your profile"
                                            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-stone-800 bg-white"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {profile.pronouns && (
                                        <span className="dex-pill !text-xs mt-1">
                                            {profile.pronouns}
                                        </span>
                                    )}
                                    {profile.about && (
                                        <p className="text-base text-stone-600 leading-snug mt-1 line-clamp-2">
                                            {profile.about}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    ["Friends", stats.friends],
                                    ["Hangouts", stats.hangouts],
                                    ["Besties", stats.besties],
                                ].map(([label, value]) => (
                                    <div key={label} className="dex-card-muted !p-2">
                                        <div className="font-pixel text-lg">{value}</div>
                                        <div className="text-sm text-stone-600">{label}</div>
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

                            <ThemeVersions onCustomize={onChangeTheme} />

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
