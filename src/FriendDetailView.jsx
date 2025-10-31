// src/FriendDetailView.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function FriendDetailView({
    friend,
    basePath = "",
    onDeleteFriend,
    currentDb,
}) {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddNoteTextField, setShowAddNoteTextField] = useState(false);
    const [newNote, setNewNote] = useState("");

    useEffect(() => {
        if (showAddNoteTextField) {
            document.getElementById("newNoteTextField").focus();
        }
    }, [showAddNoteTextField, setNewNote]);

    async function handleAddNote() {
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
            <div className="card-hand-drawn text-center p-8">
                <p className="text-2xl text-stone-500">
                    Select a friend from the list above!
                </p>
            </div>
        );
    }

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Helper function to format creation date
    const formatCreatedDate = (dateString) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
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
        <div className="card-hand-drawn space-y-6 p-6 relative">
            <div className="absolute top-0 right-0 flex gap-2 mr-5 mt-4">
                {/* New note button */}
                <button
                    onClick={() => setShowAddNoteTextField(true)}
                    className="bg-amber-200 pill-tag-hand-drawn text-sm flex items-center gap-2"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Note
                </button>
                <button
                    onClick={() => navigate(`${basePath}/modify/${friend.id}`)}
                    className="bg-amber-200 pill-tag-hand-drawn text-sm flex items-center gap-2"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    Modify
                </button>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-200 pill-tag-hand-drawn text-sm flex items-center gap-2"
                    title="Delete friend"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                    Delete
                </button>
            </div>
            {/* Header with Profile Picture and Name */}
            <div className="flex items-start gap-6">
                {/* Name and Modify Button */}
                <div className="flex-1 flex items-start justify-between">
                    <div>
                        <h2 className="text-5xl font-bold text-amber-600 my-2">
                            {friend.name}
                        </h2>
                        <div className="flex items-center gap-2">
                            {friend.pronouns && (
                                <div className="pill-tag-hand-drawn w-[fit-content] mb-2 bg-amber-100">
                                    {friend.pronouns}
                                </div>
                            )}
                        </div>

                        {friend.keyInfo?.relationships &&
                            friend.keyInfo.relationships.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {friend.keyInfo.relationships.map(
                                        (relationship, index) => (
                                            <span
                                                key={index}
                                                className="tag-hand-drawn text-sm"
                                            >
                                                {relationship}
                                            </span>
                                        )
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Tags Section */}
            {friend.tags && friend.tags.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                        Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {friend.tags.map((tag) => (
                            <span key={tag} className="tag-hand-drawn">
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* About Section */}
            {friend.about?.description && (
                <section>
                    <h3 className="text-2xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                        About
                    </h3>
                    <p className="text-lg text-stone-700 leading-relaxed">
                        {friend.about.description}
                    </p>
                </section>
            )}

            {/* Interests Section */}
            {friend.about?.interests && friend.about.interests.length > 0 && (
                <section>
                    <h3 className="text-2xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                        Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {friend.about.interests.map((interest) => (
                            <span key={interest} className="tag-hand-drawn">
                                {interest}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Key Info Section */}
            <section>
                <h3 className="text-2xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                    Key Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friend.keyInfo?.birthday && (
                        <div
                            className="bg-amber-50 p-3"
                            style={{ borderRadius: "15px" }}
                        >
                            <strong className="text-stone-800">
                                Birthday:
                            </strong>
                            <p className="text-stone-700">
                                {formatDate(friend.keyInfo.birthday)}
                            </p>
                        </div>
                    )}

                    {friend.keyInfo?.howWeMet && (
                        <div
                            className="bg-amber-50 p-3"
                            style={{ borderRadius: "15px" }}
                        >
                            <strong className="text-stone-800">
                                How We Met:
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
                <section>
                    <div className="flex items-center justify-between border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                        <h3 className="text-2xl font-bold">Notes</h3>
                        <button
                            onClick={() => {
                                setShowAddNoteTextField(!showAddNoteTextField);
                            }}
                            className="btn-hand-drawn btn-primary text-sm px-4 py-2"
                        >
                            {showAddNoteTextField ? "-" : "+"}
                        </button>
                    </div>
                    {showAddNoteTextField && (
                        <div className="flex flex-col justify-between pb-2 mb-3">
                            <textarea
                                id="newNoteTextField"
                                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                                placeholder="Enter your note here..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setShowAddNoteTextField(false);
                                        setNewNote("");
                                    }}
                                    className="btn-hand-drawn btn-secondary text-sm px-4 py-2 w-fit mt-2 flex items-center gap-2"
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
                                    className="btn-hand-drawn btn-primary text-sm px-4 py-2 w-fit mt-2 flex items-center gap-2"
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
                        className="text-lg text-stone-700 bg-amber-100 p-4 leading-relaxed"
                        style={{ borderRadius: "15px" }}
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
                                    "255px 15px 225px 15px/15px 225px 15px 255px",
                            }}
                            placeholder="Enter your note here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddNote}
                            className="btn-hand-drawn btn-primary text-sm px-4 py-2 w-fit mt-2 flex items-center gap-2"
                        >
                            Save
                        </button>
                    </div>
                </section>
            )}

            {/* Metadata Section */}
            <section className="border-t-2 border-dashed border-stone-300 pt-4">
                <div className="text-sm text-stone-500">
                    <p>Added on {formatCreatedDate(friend.createdAt)}</p>
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="card-hand-drawn p-6 max-w-md mx-4">
                        <h3 className="text-2xl font-bold text-amber-600 mb-4">
                            Confirm Delete
                        </h3>
                        <p className="text-lg text-stone-700 mb-6">
                            Are you sure you want to delete{" "}
                            <strong>{friend.name}</strong>?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
                                className="btn-hand-drawn btn-secondary px-4 py-2"
                            >
                                No
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="btn-hand-drawn bg-red-500 hover:bg-red-600 text-white px-4 py-2"
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
