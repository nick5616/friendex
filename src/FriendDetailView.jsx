// src/FriendDetailView.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Ellipsis, Pencil, Trash2, MessageCircle } from "lucide-react";
import { TypeBadges } from "./TypeBadge";
import {
    formatDexNumber,
    parseBirthday,
    toDate,
    getLastHangout,
    formatHangoutAgo,
} from "./dex";
import { formatPronouns } from "./utils";

function FriendDetailView({
    friend,
    dexNumber,
    basePath = "",
    onDeleteFriend,
    currentDb,
}) {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showAddNoteTextField, setShowAddNoteTextField] = useState(false);
    const [newNote, setNewNote] = useState("");

    useEffect(() => {
        if (showAddNoteTextField) {
            document.getElementById("newNoteTextField").focus();
        }
    }, [showAddNoteTextField, setNewNote]);

    // Close the actions menu when switching friends
    useEffect(() => {
        setShowMenu(false);
    }, [friend?.id]);

    async function handleAddNote() {
        if (!newNote.trim()) return;
        try {
            // Handle both string and array formats for notes
            let existingNotes = [];
            if (friend.notes) {
                if (Array.isArray(friend.notes)) {
                    // Check if this is an array of characters (corrupted data)
                    if (
                        friend.notes.length > 0 &&
                        typeof friend.notes[0] === "string" &&
                        friend.notes[0].length === 1
                    ) {
                        // This is corrupted data - reconstruct the original string
                        const reconstructedString = friend.notes
                            .join("")
                            .trim();
                        existingNotes = reconstructedString
                            ? [reconstructedString]
                            : [];
                    } else {
                        // This is proper array of note strings
                        existingNotes = friend.notes;
                    }
                } else {
                    // If it's a string, convert to array
                    existingNotes = [friend.notes];
                }
            }

            const newNotes = [...existingNotes, newNote];

            // Use direct object update instead of callback
            await currentDb.friends.update(friend.id, {
                notes: newNotes,
            });
        } catch (error) {
            console.error("Error updating friend:", error);
        }

        setShowAddNoteTextField(false);
        setNewNote("");
    }

    if (!friend) {
        return (
            <div className="dex-card text-center p-8">
                <p className="text-2xl text-stone-500">
                    Select a friend from the list above!
                </p>
            </div>
        );
    }

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        const date = parseBirthday(dateString);
        if (!date) return "Not specified";
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Helper function to format creation date
    const formatCreatedDate = (dateString) => {
        const date = toDate(dateString);
        if (!date) return "Unknown";
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Handle delete confirmation
    const handleDeleteConfirm = () => {
        if (onDeleteFriend) {
            onDeleteFriend(friend.id);
        }
        setShowDeleteModal(false);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    return (
        <div className="dex-card p-5 relative">
            {/* Top row: dex number + actions */}
            <div className="flex items-center justify-between gap-2">
                <span className="font-pixel text-sm text-stone-500">
                    FRIENDEX {formatDexNumber(dexNumber)}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddNoteTextField(true)}
                        className="dex-pill text-sm flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Note
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu((v) => !v)}
                            className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-stone-800 bg-white"
                            aria-label="More actions"
                            aria-expanded={showMenu}
                        >
                            <Ellipsis className="w-5 h-5" />
                        </button>
                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-20"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div
                                    className="absolute right-0 top-11 z-30 w-40 bg-white border-2 border-stone-800 py-1 flex flex-col"
                                    style={{
                                        borderRadius: "var(--radius-dex)",
                                        boxShadow: "3px 3px 0 #1c1917",
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `${basePath}/modify/${friend.id}`
                                            )
                                        }
                                        className="flex items-center gap-2 px-4 py-2 text-left hover:bg-stone-100"
                                    >
                                        <Pencil className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            setShowDeleteModal(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-left text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" /> Release
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Name, pronouns and relationship types */}
            <div className="mt-2">
                <h2
                    className="text-5xl font-bold leading-none break-words"
                    style={{
                        color: "var(--color-title, var(--color-primary-dark))",
                    }}
                >
                    {friend.name}
                </h2>
                {/* Pronouns share the type-badge capsule so the row reads as one set */}
                {(formatPronouns(friend.pronouns) ||
                    friend.keyInfo?.relationships?.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {formatPronouns(friend.pronouns) && (
                            <span className="dex-pill !pl-1">
                                <span className="type-badge-icon">
                                    <MessageCircle
                                        className="w-3.5 h-3.5"
                                        style={{ color: "var(--color-pill-bg)" }}
                                        strokeWidth={2.75}
                                    />
                                </span>
                                {formatPronouns(friend.pronouns)}
                            </span>
                        )}
                        <TypeBadges
                            relationships={friend.keyInfo?.relationships}
                        />
                    </div>
                )}
            </div>

            {/* Tags Section */}
            {friend.tags && friend.tags.length > 0 && (
                <section className="mb-8 mt-4">
                    <h3 className="text-2xl font-bold pb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {friend.tags.map((tag) => (
                            <span key={tag} className="dex-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* About Section */}
            {friend.about?.description && (
                <section className="mb-8 mt-4">
                    <h3 className="text-2xl font-bold pb-1">About</h3>
                    <p className="text-lg text-stone-700 leading-relaxed">
                        {friend.about.description}
                    </p>
                </section>
            )}

            {/* Interests Section */}
            {friend.about?.interests && friend.about.interests.length > 0 && (
                <section className="mb-8 mt-4">
                    <h3 className="text-2xl font-bold pb-1">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {friend.about.interests.map((interest) => (
                            <span key={interest} className="dex-tag">
                                {interest}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Key Info Section */}
            <section className="mb-8 mt-4">
                <h3 className="text-2xl font-bold pb-1">Key Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friend.keyInfo?.birthday && (
                        <div
                            className="p-3"
                            style={{
                                borderRadius: "var(--radius-dex)",
                                backgroundColor:
                                    "var(--color-info-bg, var(--color-primary-light))",
                            }}
                        >
                            <strong className="text-stone-800">Birthday</strong>
                            <p className="text-stone-700">
                                {formatDate(friend.keyInfo.birthday)}
                            </p>
                        </div>
                    )}

                    {friend.hangouts?.length > 0 && (
                        <div
                            className="p-3"
                            style={{
                                borderRadius: "var(--radius-dex)",
                                backgroundColor:
                                    "var(--color-info-bg, var(--color-primary-light))",
                            }}
                        >
                            <strong className="text-stone-800">Hangouts</strong>
                            <p className="text-stone-700">
                                {friend.hangouts.length} logged · last{" "}
                                {formatHangoutAgo(getLastHangout(friend))}
                            </p>
                        </div>
                    )}

                    {friend.keyInfo?.howWeMet && (
                        <div
                            className="p-3"
                            style={{
                                borderRadius: "var(--radius-dex)",
                                backgroundColor:
                                    "var(--color-info-bg, var(--color-primary-light))",
                            }}
                        >
                            <strong className="text-stone-800">
                                How We Met
                            </strong>
                            <p className="text-stone-700">
                                {friend.keyInfo.howWeMet}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Notes Section */}
            {friend.notes && friend.notes.length > 0 ? (
                <section className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold border-stone-400">
                            Notes
                        </h3>
                        <button
                            onClick={() => {
                                setShowAddNoteTextField(!showAddNoteTextField);
                            }}
                            className="dex-btn btn-primary text-sm px-4 py-2"
                        >
                            {showAddNoteTextField ? "-" : "+"}
                        </button>
                    </div>
                    {showAddNoteTextField && (
                        <div className="flex flex-col justify-between mb-2">
                            <textarea
                                id="newNoteTextField"
                                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                                placeholder="Enter your note here..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                            />
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={() => {
                                        setShowAddNoteTextField(false);
                                        setNewNote("");
                                    }}
                                    className="dex-btn btn-secondary text-sm px-4 py-2 w-fit mt-2 flex items-center gap-2"
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
                                <button
                                    onClick={handleAddNote}
                                    className="dex-btn btn-primary text-sm px-4 py-2 w-fit flex items-center gap-2"
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
                                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                        />
                                    </svg>
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                    <div
                        className="text-lg text-stone-700 p-4 leading-relaxed"
                        style={{
                            borderRadius: "var(--radius-dex)",
                            backgroundColor:
                                "var(--color-info-bg, var(--color-primary-light))",
                        }}
                    >
                        {(() => {
                            if (Array.isArray(friend.notes)) {
                                // Check if this is corrupted data (array of individual characters)
                                if (
                                    friend.notes.length > 0 &&
                                    typeof friend.notes[0] === "string" &&
                                    friend.notes[0].length === 1
                                ) {
                                    // Reconstruct the original string
                                    const reconstructedString = friend.notes
                                        .join("")
                                        .trim();
                                    return reconstructedString || "No notes";
                                } else {
                                    // Display as proper array of note strings
                                    return friend.notes.map((note, index) => (
                                        <div
                                            key={index}
                                            className="mb-2 last:mb-0"
                                        >
                                            {note}
                                        </div>
                                    ));
                                }
                            } else {
                                return friend.notes;
                            }
                        })()}
                    </div>
                </section>
            ) : (
                <section>
                    <h3 className="text-2xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                        Notes
                    </h3>

                    <div className="flex flex-col justify-between pb-2">
                        <textarea
                            id="newNoteTextField"
                            className="w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                            style={{
                                borderRadius:
                                    "var(--radius-dex)",
                            }}
                            placeholder="Enter your note here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={handleAddNote}
                            className="dex-btn btn-primary text-sm px-4 py-2 w-fit flex items-center gap-2"
                        >
                            Save
                        </button>
                    </div>
                </section>
            )}

            {/* Metadata Section */}
            <section className="pt-4">
                <div className="text-sm text-stone-500">
                    <p>Added on {formatCreatedDate(friend.createdAt)}</p>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="dex-card p-6 max-w-md mx-4">
                        <h3
                            className="text-2xl font-bold mb-4"
                            style={{
                                color: "var(--color-title, var(--color-primary-dark))",
                            }}
                        >
                            Release {friend.name}?
                        </h3>
                        <p className="text-lg text-stone-700 mb-6">
                            This deletes <strong>{friend.name}</strong> and
                            all their notes from your Friendex.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
                                className="dex-btn btn-secondary px-4 py-2"
                            >
                                No
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="dex-btn btn-danger px-4 py-2"
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FriendDetailView;
