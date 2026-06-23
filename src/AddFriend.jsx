import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import { db } from "./db";
import { demoDb } from "./demoDb";
import PronounSelector from "./PronounSelector";
import TagSelector from "./TagSelector";
import InterestSelector from "./InterestSelector";
import RelationshipSelector from "./RelationshipSelector";
import NameSelector from "./NameSelector";
import BirthdaySelector from "./BirthdaySelector";
import DescriptionSelector from "./DescriptionSelector";
import HowWeMetSelector from "./HowWeMetSelector";
import NotesSelector from "./NotesSelector";
import { seedTagsAndInterests } from "./seed";
import useIsDemoMode from "./hooks/useIsDemoMode";

function AddFriend(friend) {
    const navigate = useNavigate();
    const isDemoMode = useIsDemoMode();
    const fileInputRef = useRef(null);
    const nameInputRef = useRef(null);

    // Determine if we're in demo mode based on the URL
    const currentDb = isDemoMode ? demoDb : db;
    const basePath = isDemoMode ? "/demo" : "";

    const importFileInputRef = useRef(null);
    const [toast, setToast] = useState(null);

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const importedFriends = JSON.parse(text);
            if (!Array.isArray(importedFriends)) {
                setToast({ message: "Invalid format — expected an array of friends", type: "error" });
                e.target.value = "";
                return;
            }
            const friendsToImport = importedFriends.map(({ id, ...f }) => f);
            await currentDb.friends.bulkAdd(friendsToImport);
            sessionStorage.removeItem("addFriendDraft");
            navigate(basePath || "/");
        } catch (err) {
            console.error("Import error:", err);
            setToast({ message: "Import failed — check the JSON file format", type: "error" });
        }
        e.target.value = "";
    };

    const [profilePicture, setProfilePicture] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        pronouns: [],
        tags: [],
        description: "",
        interests: [],
        loveLanguages: [],
        birthday: "",
        howWeMet: "",
        relationships: [],
        notes: "",
    });
    console.log("formData", formData);
    console.log("friend", friend);
    const [debouncedName, setDebouncedName] = useState("");
    const [draftRestored, setDraftRestored] = useState(false);

    useEffect(() => {
        // Always seed tags and interests if they're empty, even in production
        seedTagsAndInterests();
        nameInputRef.current?.focus();
    }, []);

    // Restore form data from session storage on component mount
    useEffect(() => {
        const savedData = sessionStorage.getItem("addFriendDraft");
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setFormData(parsedData);
                setDraftRestored(true);
                // Clear the notification after 3 seconds
                setTimeout(() => setDraftRestored(false), 3000);
            } catch (error) {
                console.warn("Failed to restore draft data:", error);
                sessionStorage.removeItem("addFriendDraft");
            }
        }
    }, []);

    // Debounce the name input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedName(formData.name);
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.name]);

    // Auto-save form data to session storage with debouncing
    useEffect(() => {
        const saveFormData = () => {
            sessionStorage.setItem("addFriendDraft", JSON.stringify(formData));
        };

        const timeoutId = setTimeout(saveFormData, 1000); // Debounced save
        return () => clearTimeout(timeoutId);
    }, [formData]);

    // Generate a simple avatar based on name
    const generateAvatar = (name) => {
        const hash = name
            .split("")
            .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        const colors = [
            "#f59e0b",
            "#ef4444",
            "#10b981",
            "#3b82f6",
            "#8b5cf6",
            "#ec4899",
        ];
        const color = colors[Math.abs(hash) % colors.length];
        const initial = name.charAt(0).toUpperCase();

        const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color}" />
      <text x="50" y="50" font-family="Arial" font-size="50" fill="#fff" text-anchor="middle" dy=".3em">${initial}</text>
    </svg>
  `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle pronoun selection change
    const handlePronounChange = (pronouns) => {
        console.log("changed pronouns", pronouns);
        setFormData((prev) => ({
            ...prev,
            pronouns,
        }));
    };

    // Handle tag selection change
    const handleTagChange = (tags) => {
        // Convert comma-separated string back to array
        const tagsArray = tags
            ? tags.split(", ").filter((tag) => tag.trim())
            : [];
        setFormData((prev) => ({
            ...prev,
            tags: tagsArray,
        }));
    };

    // Handle interest selection change
    const handleInterestChange = (interests) => {
        // Convert comma-separated string back to array
        const interestsArray = interests
            ? interests.split(", ").filter((interest) => interest.trim())
            : [];
        setFormData((prev) => ({
            ...prev,
            interests: interestsArray,
        }));
    };

    // Handle relationship selection change
    const handleRelationshipChange = (relationships) => {
        setFormData((prev) => ({
            ...prev,
            relationships,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setProfilePicture(event.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create the friend object
        const newFriend = {
            name: formData.name,
            pronouns: formData.pronouns.join("/"),
            profilePicture: profilePicture || generateAvatar(formData.name),
            tags: formData.tags, // Already an array from handleTagChange
            about: {
                description: formData.description,
                interests: formData.interests, // Already an array from handleInterestChange
                loveLanguages: formData.loveLanguages,
            },
            keyInfo: {
                birthday: formData.birthday,
                howWeMet: formData.howWeMet,
                relationships: formData.relationships,
            },
            notes: formData.notes,
            createdAt: new Date(),
        };

        // Add to database and get the new ID
        const newFriendId = await currentDb.friends.add(newFriend);

        // Increment usage count for all selected tags
        if (formData.tags.length > 0) {
            try {
                for (const tag of formData.tags) {
                    await db.tags
                        .where("name")
                        .equals(tag)
                        .modify((tagRecord) => {
                            tagRecord.usageCount =
                                (tagRecord.usageCount || 0) + 1;
                            tagRecord.lastUsed = new Date();
                        });
                }
            } catch (error) {
                console.warn("Failed to update tag usage counts:", error);
            }
        }

        // Increment usage count for all selected interests
        if (formData.interests.length > 0) {
            try {
                for (const interest of formData.interests) {
                    await db.interests
                        .where("name")
                        .equals(interest)
                        .modify((interestRecord) => {
                            interestRecord.usageCount =
                                (interestRecord.usageCount || 0) + 1;
                            interestRecord.lastUsed = new Date();
                        });
                }
            } catch (error) {
                console.warn("Failed to update interest usage counts:", error);
            }
        }

        // Increment usage count for all selected relationships
        if (formData.relationships.length > 0) {
            try {
                for (const relationship of formData.relationships) {
                    await db.relationships
                        .where("name")
                        .equals(relationship)
                        .modify((relationshipRecord) => {
                            relationshipRecord.usageCount =
                                (relationshipRecord.usageCount || 0) + 1;
                            relationshipRecord.lastUsed = new Date();
                        });
                }
            } catch (error) {
                console.warn(
                    "Failed to update relationship usage counts:",
                    error
                );
            }
        }

        // Clear session storage draft data
        sessionStorage.removeItem("addFriendDraft");

        // Navigate back to main page with the new friend ID
        navigate(basePath || "/", { state: { newFriendId } });
    };

    return (
        <div className="min-h-screen mx-auto px-4 py-6 max-w-3xl">
            <div className="mb-8">
                <button
                    onClick={() => navigate(basePath || "/")}
                    className="text-stone-600 hover:text-stone-900 mb-4 flex items-center"
                >
                    ← Back to Friendex{isDemoMode && " Demo"}
                </button>

                <h1 className="text-4xl font-bold text-stone-900">
                    Add New Friend
                    {isDemoMode && (
                        <span className="text-2xl text-stone-600 ml-2">
                            (Demo)
                        </span>
                    )}
                </h1>
                {draftRestored && (
                    <div className="muted-card-hand-drawn mt-4 p-3 bg-green-200 border border-green-600 transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-top-2 delay-500">
                        <p className="text-green-800 text-sm">
                            📝 Draft restored from previous session
                        </p>
                    </div>
                )}
            </div>

            {/* Import option */}
            {!isDemoMode && (
                <div className="card-hand-drawn border-2 border-stone-800 px-6 py-5 flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div className="flex-1">
                        <p className="font-semibold text-stone-800">Import friends list</p>
                        <p className="text-sm text-stone-500 mt-0.5">Load a previously exported JSON file to add multiple friends at once.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => importFileInputRef.current?.click()}
                        className="btn-hand-drawn border-2 border-stone-700 text-black text-sm px-5 py-2.5 font-medium flex items-center gap-2 whitespace-nowrap"
                        style={{ backgroundColor: "var(--color-primary-light)" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Choose file
                    </button>
                    <input ref={importFileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
                </div>
            )}

            <div className="flex items-center gap-3 text-stone-400 text-sm my-6">
                <div className="flex-1 h-px bg-stone-200" />
                <span>or add one friend</span>
                <div className="flex-1 h-px bg-stone-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="card-hand-drawn px-4 py-6 space-y-4">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Profile Picture
                    </h2>
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="w-32 h-32 bg-stone-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-75 transition-opacity relative group"
                            onClick={handleProfilePictureClick}
                            style={{
                                borderRadius:
                                    profilePicture ||
                                    (debouncedName &&
                                        generateAvatar(debouncedName))
                                        ? "255px 15px 225px 15px/15px 225px 15px 255px"
                                        : "60% 40% 30% 70% / 60% 30% 70% 40%",
                                transform:
                                    profilePicture ||
                                    (debouncedName &&
                                        generateAvatar(debouncedName))
                                        ? "rotate(0deg)"
                                        : "rotate(-2deg)",
                            }}
                        >
                            {profilePicture ||
                            (debouncedName && generateAvatar(debouncedName)) ? (
                                <img
                                    src={
                                        profilePicture ||
                                        generateAvatar(debouncedName)
                                    }
                                    alt="Profile preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-stone-400 text-4xl">
                                    +
                                </span>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                                <span className="text-white text-sm font-medium">
                                    {profilePicture ? "Change" : "Upload"}
                                </span>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="text-sm text-stone-600 text-center">
                            Click to upload a photo
                        </p>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="card-hand-drawn px-4 py-6 space-y-6">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Basic Info
                    </h2>
                    <hr className="border-stone-200 w-full" />
                    <div className="space-y-6">
                        <div>
                            <NameSelector
                                ref={nameInputRef}
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <PronounSelector
                                value={formData.pronouns}
                                onChange={handlePronounChange}
                            />
                        </div>

                        <div>
                            <TagSelector
                                value={formData.tags.join(", ")}
                                onChange={handleTagChange}
                                pronouns={formData.pronouns}
                            />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="card-hand-drawn px-4 py-6 space-y-6">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        About
                    </h2>

                    <div>
                        <DescriptionSelector
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <InterestSelector
                            value={formData.interests.join(", ")}
                            onChange={handleInterestChange}
                            pronouns={formData.pronouns}
                        />
                    </div>
                </div>

                {/* Key Info */}
                <div className="card-hand-drawn px-4 py-6 space-y-6">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Key Info
                    </h2>

                    <div>
                        <BirthdaySelector
                            value={formData.birthday}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <RelationshipSelector
                            value={formData.relationships}
                            onChange={handleRelationshipChange}
                        />
                    </div>

                    <div>
                        <HowWeMetSelector
                            value={formData.howWeMet}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="card-hand-drawn px-4 py-6 space-y-6">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Notes
                    </h2>

                    <div>
                        <NotesSelector
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-stone-900 text-white px-4 py-3 rounded-md hover:bg-stone-800 transition-colors font-medium flex items-center justify-center gap-2"
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
                        Add Friend
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.removeItem("addFriendDraft");
                            navigate(basePath || "/");
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
                <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
            )}
        </div>
    );
}

export default AddFriend;
