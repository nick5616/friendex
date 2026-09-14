import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import { db } from "./db";
import { demoDb } from "./demoDb";
import useIsDemoMode from "./hooks/useIsDemoMode";
import { generateAvatar } from "./utils";

const PRONOUN_OPTIONS = ["he/him", "she/her", "they/them", "it/its"];
const DRAFT_KEY = "bulkAddFriendsDraft";

const createRow = () => ({
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "",
    pronouns: [],
});

const loadDraftRows = () => {
    try {
        const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY));
        if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (error) {
        console.warn("Failed to restore bulk add draft:", error);
    }
    return [createRow(), createRow(), createRow()];
};

function BulkAddFriends() {
    const navigate = useNavigate();
    const isDemoMode = useIsDemoMode();

    const currentDb = isDemoMode ? demoDb : db;
    const basePath = isDemoMode ? "/demo" : "";

    const [rows, setRows] = useState(loadDraftRows);
    const [toast, setToast] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const nameInputRefs = useRef(new Map());
    const focusKeyRef = useRef(rows[0]?.key);

    const filledCount = rows.filter((row) => row.name.trim()).length;

    // Focus a row's name input after it renders (initial load, added row, Enter to advance)
    useEffect(() => {
        if (!focusKeyRef.current) return;
        nameInputRefs.current.get(focusKeyRef.current)?.focus();
        focusKeyRef.current = null;
    }, [rows]);

    // Auto-save rows to session storage with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            sessionStorage.setItem(DRAFT_KEY, JSON.stringify(rows));
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [rows]);

    const updateRow = (key, changes) => {
        setRows((prev) =>
            prev.map((row) => (row.key === key ? { ...row, ...changes } : row))
        );
    };

    const togglePronoun = (row, pronoun) => {
        // Keep pronouns in the order they were selected, like the single add form
        const pronouns = row.pronouns.includes(pronoun)
            ? row.pronouns.filter((p) => p !== pronoun)
            : [...row.pronouns, pronoun];
        updateRow(row.key, { pronouns });
    };

    const addRow = () => {
        const row = createRow();
        focusKeyRef.current = row.key;
        setRows((prev) => [...prev, row]);
    };

    const removeRow = (key) => {
        setRows((prev) => {
            const remaining = prev.filter((row) => row.key !== key);
            return remaining.length > 0 ? remaining : [createRow()];
        });
    };

    // Enter moves to the next name, adding a new row from the last one
    const handleNameKeyDown = (e, index) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const nextRow = rows[index + 1];
        if (nextRow) {
            nameInputRefs.current.get(nextRow.key)?.focus();
        } else if (rows[index].name.trim()) {
            addRow();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rowsToAdd = rows.filter((row) => row.name.trim());
        if (rowsToAdd.length === 0) {
            setToast({ message: "Add at least one name first", type: "error" });
            return;
        }

        setIsSaving(true);
        try {
            const newFriends = rowsToAdd.map((row) => {
                const name = row.name.trim();
                return {
                    name,
                    pronouns: row.pronouns.join("/"),
                    profilePicture: generateAvatar(name),
                    tags: [],
                    about: {
                        description: "",
                        interests: [],
                        loveLanguages: [],
                    },
                    keyInfo: {
                        birthday: "",
                        howWeMet: "",
                        relationships: [],
                    },
                    notes: "",
                    createdAt: new Date(),
                };
            });

            const newIds = await currentDb.friends.bulkAdd(newFriends, {
                allKeys: true,
            });
            sessionStorage.removeItem(DRAFT_KEY);
            navigate(basePath || "/", {
                state: {
                    newFriendId: newIds[0],
                    toast: {
                        message: `Added ${newFriends.length} friend${newFriends.length !== 1 ? "s" : ""}`,
                        type: "success",
                    },
                },
            });
        } catch (error) {
            console.error("Bulk add error:", error);
            setToast({ message: "Couldn't add friends — try again", type: "error" });
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen mx-auto px-4 py-6 max-w-3xl">
            <div className="mb-4 sm:mb-8">
                <button
                    onClick={() => navigate(`${basePath}/add`)}
                    className="text-stone-600 hover:text-stone-900 mb-2 sm:mb-4 flex items-center"
                >
                    ← Back to Add Friend
                </button>

                <h1 className="text-4xl font-bold text-stone-900">
                    Bulk Add Friends
                    {isDemoMode && (
                        <span className="text-2xl text-stone-600 ml-2">
                            (Demo)
                        </span>
                    )}
                </h1>
                <p className="text-sm text-stone-500 mt-1">
                    Just names and pronouns for now. You can fill in the
                    details later. Press Enter to jump to the next friend.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {rows.map((row, index) => (
                    <div
                        key={row.key}
                        className="card-hand-drawn px-3 py-3 sm:px-4 space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <input
                                ref={(el) => {
                                    if (el) nameInputRefs.current.set(row.key, el);
                                    else nameInputRefs.current.delete(row.key);
                                }}
                                type="text"
                                value={row.name}
                                onChange={(e) =>
                                    updateRow(row.key, { name: e.target.value })
                                }
                                onKeyDown={(e) => handleNameKeyDown(e, index)}
                                placeholder={`Friend ${index + 1} name`}
                                aria-label={`Friend ${index + 1} name`}
                                inputMode="text"
                                enterKeyHint="next"
                                autoComplete="off"
                                className="flex-1 min-w-0 px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                                style={{
                                    borderRadius:
                                        "255px 15px 225px 15px/15px 225px 15px 255px",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => removeRow(row.key)}
                                aria-label={`Remove friend ${index + 1}`}
                                className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div
                            className="flex flex-wrap gap-1.5 sm:gap-2"
                            role="group"
                            aria-label={`Friend ${index + 1} pronouns`}
                        >
                            {PRONOUN_OPTIONS.map((pronoun) => {
                                const selected = row.pronouns.includes(pronoun);
                                return (
                                    <button
                                        key={pronoun}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => togglePronoun(row, pronoun)}
                                        className={`tag-hand-drawn px-2.5 sm:px-3 transition-all duration-200 hover:scale-105 ${
                                            selected
                                                ? "bg-amber-300 text-stone-900 border-stone-800"
                                                : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                                        }`}
                                    >
                                        {pronoun}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addRow}
                    className="w-full py-3 border-2 border-dashed border-stone-400 text-stone-600 hover:border-stone-700 hover:text-stone-900 transition-colors font-medium flex items-center justify-center gap-2"
                    style={{
                        borderRadius:
                            "255px 15px 225px 15px/15px 225px 15px 255px",
                    }}
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Add another
                </button>

                <div className="flex gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 bg-stone-900 text-white px-4 py-3 rounded-md hover:bg-stone-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        {filledCount > 1
                            ? `Add ${filledCount} Friends`
                            : "Add Friend"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.removeItem(DRAFT_KEY);
                            navigate(`${basePath}/add`);
                        }}
                        className="px-6 py-3 rounded-md border border-stone-300 hover:bg-stone-100 transition-colors font-medium flex items-center gap-2"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        Cancel
                    </button>
                </div>
            </form>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDone={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default BulkAddFriends;
