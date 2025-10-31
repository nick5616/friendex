import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { db } from "./db";
import { demoDb } from "./demoDb";
import RelationshipSelector from "./RelationshipSelector";
import InterestSelector from "./InterestSelector";
import TagSelector from "./TagSelector";
import PronounSelector from "./PronounSelector";
import BirthdaySelector from "./BirthdaySelector";
import DescriptionSelector from "./DescriptionSelector";
import HowWeMetSelector from "./HowWeMetSelector";
import NotesSelector from "./NotesSelector";
import NameSelector from "./NameSelector";

function ModifyFriend() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const fileInputRef = useRef(null);

    // Determine if we're in demo mode based on the URL
    const isDemoMode = location.pathname.startsWith("/demo");
    const currentDb = isDemoMode ? demoDb : db;
    const basePath = isDemoMode ? "/demo" : "";

    const [loading, setLoading] = useState(true);
    const [profilePicture, setProfilePicture] = useState(null);
    const [originalProfilePicture, setOriginalProfilePicture] = useState(null);
    console.log("originalProfilePicture", originalProfilePicture);
    console.log("profilePicture", profilePicture);
    const [draftRestored, setDraftRestored] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        pronouns: "",
        tags: "",
        description: "",
        interests: "",
        loveLanguages: "",
        birthday: "",
        howWeMet: "",
        relationships: [],
        notes: "",
    });

    const friend = useMemo(() => {
        if (currentDb) {
            return currentDb.friends.get(parseInt(id));
        }
        return null;
    }, [id, currentDb]);
    console.log("got friend", friend);

    // Load the friend's current data
    useEffect(() => {
        const loadFriend = async () => {
            // Check for session storage draft first
            const savedData = sessionStorage.getItem(`modifyFriendDraft_${id}`);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    setFormData(parsedData.formData);
                    if (parsedData.profilePicture) {
                        setProfilePicture(parsedData.profilePicture);
                    }
                    setDraftRestored(true);
                    // Clear the notification after 3 seconds
                    setTimeout(() => setDraftRestored(false), 3000);
                } catch (error) {
                    console.warn("Failed to restore draft data:", error);
                    sessionStorage.removeItem(`modifyFriendDraft_${id}`);
                }
            }

            // Always load the original profile picture from database
            // This ensures we have the original picture even when draft is restored
            const friend = await currentDb.friends.get(parseInt(id));
            if (friend) {
                setOriginalProfilePicture(friend.profilePicture);

                // Only set form data if no draft was restored
                if (!savedData) {
                    setFormData({
                        name: friend.name || "",
                        pronouns: friend.pronouns || "",
                        tags: friend.tags ? friend.tags.join(", ") : "",
                        description: friend.about?.description || "",
                        interests: friend.about?.interests
                            ? friend.about.interests.join(", ")
                            : "",
                        loveLanguages: friend.about?.loveLanguages
                            ? friend.about.loveLanguages.join(", ")
                            : "",
                        birthday: friend.keyInfo?.birthday || "",
                        howWeMet: friend.keyInfo?.howWeMet || "",
                        relationships: friend.keyInfo?.relationships || [],
                        notes: friend.notes || "",
                    });
                }
            }
            setLoading(false);
        };
        loadFriend();
    }, [id, currentDb]);

    // Auto-save form data to session storage with debouncing
    useEffect(() => {
        const saveFormData = () => {
            const dataToSave = {
                formData,
                profilePicture,
            };
            sessionStorage.setItem(
                `modifyFriendDraft_${id}`,
                JSON.stringify(dataToSave)
            );
        };

        const timeoutId = setTimeout(saveFormData, 1000); // Debounced save
        return () => clearTimeout(timeoutId);
    }, [formData, profilePicture, id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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

    const handleInterestChange = (interests) => {
        setFormData((prev) => ({
            ...prev,
            interests,
        }));
    };

    const handlePronounChange = (pronouns) => {
        setFormData((prev) => ({
            ...prev,
            pronouns,
        }));
    };

    const handleTagChange = (tags) => {
        setFormData((prev) => ({
            ...prev,
            tags,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Update the friend in the database
        const updateData = {
            name: formData.name,
            pronouns: formData.pronouns,
            tags: formData.tags
                ? formData.tags.split(", ").filter((tag) => tag.trim())
                : [],
            about: {
                description: formData.description,
                interests: formData.interests
                    ? formData.interests
                          .split(", ")
                          .filter((interest) => interest.trim())
                    : [],
            },
            keyInfo: {
                birthday: formData.birthday,
                howWeMet: formData.howWeMet,
                relationships: formData.relationships,
            },
            notes: formData.notes,
        };

        // Only update profile picture if a new one was uploaded
        if (profilePicture) {
            updateData.profilePicture = profilePicture;
        }

        await currentDb.friends.update(parseInt(id), updateData);

        // Clear session storage draft data
        sessionStorage.removeItem(`modifyFriendDraft_${id}`);

        // Navigate back to main page with the modified friend ID
        navigate(basePath || "/", { state: { newFriendId: parseInt(id) } });
    };

    if (loading) {
        return (
            <div className="min-h-screen mx-auto p-8 max-w-3xl flex items-center justify-center">
                <p className="text-xl text-stone-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen mx-auto p-4 max-w-3xl">
            <div className="mb-8">
                <button
                    onClick={() => {
                        sessionStorage.removeItem(`modifyFriendDraft_${id}`);
                        navigate(basePath || "/");
                    }}
                    className="text-stone-600 hover:text-stone-900 mb-4 flex items-center"
                >
                    ← Back to Friendex{isDemoMode && " Demo"}
                </button>
                <h1 className="text-4xl font-bold text-stone-900 flex items-center">
                    Edit
                    <span className="text-4xl font-bold text-stone-600 ml-2">
                        {formData.name}
                    </span>
                </h1>
                {draftRestored && (
                    <div className="muted-card-hand-drawn mt-4 p-3 bg-green-200 border border-green-600 transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-top-2 delay-500">
                        <p className="text-green-800 text-sm">
                            📝 Draft restored from previous session
                        </p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="card-hand-drawn p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Profile Picture
                    </h2>
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="w-32 h-32 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-75 transition-opacity relative group"
                            onClick={handleProfilePictureClick}
                        >
                            {profilePicture || originalProfilePicture ? (
                                <img
                                    src={
                                        profilePicture || originalProfilePicture
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
                                    Change Photo
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
                            Click to upload a new photo
                        </p>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="card-hand-drawn p-6 space-y-4">
                    <NameSelector
                        value={formData.name}
                        onChange={handleChange}
                    />

                    <PronounSelector
                        value={formData.pronouns || friend.pronouns}
                        onChange={handlePronounChange}
                    />

                    <TagSelector
                        value={formData.tags || friend.tags}
                        pronouns={formData.pronouns || friend.pronouns}
                        onChange={handleTagChange}
                    />
                </div>

                {/* About Section */}
                <div className="card-hand-drawn p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        About
                    </h2>

                    <div>
                        <DescriptionSelector
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    <InterestSelector
                        value={formData.interests || friend.interests}
                        pronouns={formData.pronouns || friend.pronouns}
                        onChange={handleInterestChange}
                    />
                </div>

                {/* Key Info */}
                <div className="card-hand-drawn p-6 space-y-4">
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
                <div className="card-hand-drawn p-6 space-y-4">
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
                        className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
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
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.removeItem(
                                `modifyFriendDraft_${id}`
                            );
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
        </div>
    );
}

export default ModifyFriend;
