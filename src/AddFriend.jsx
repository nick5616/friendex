import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "./db";
import { demoDb } from "./demoDb";
import PronounSelector from "./PronounSelector";
import TagSelector from "./TagSelector";
import InterestSelector from "./InterestSelector";
import RelationshipSelector from "./RelationshipSelector";
import NameSelector from "./NameSelector";
import BirthdaySelector from "./BirthdaySelector";
import DescriptionSelector from "./DescriptionSelector";
import { seedTagsAndInterests } from "./seed";

function AddFriend() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const nameInputRef = useRef(null);

    // Determine if we're in demo mode based on the URL
    const isDemoMode = location.pathname.startsWith("/demo");
    const currentDb = isDemoMode ? demoDb : db;
    const basePath = isDemoMode ? "/demo" : "";

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
    const [debouncedName, setDebouncedName] = useState("");

    useEffect(() => {
        // Always seed tags and interests if they're empty, even in production
        seedTagsAndInterests();
    }, []);

    useEffect(() => {
        // set focus on name field immediately
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    // Debounce the name input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedName(formData.name);
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.name]);

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
        setFormData((prev) => ({
            ...prev,
            pronouns,
        }));
    };

    // Handle tag selection change
    const handleTagChange = (tags) => {
        setFormData((prev) => ({
            ...prev,
            tags,
        }));
    };

    // Handle interest selection change
    const handleInterestChange = (interests) => {
        setFormData((prev) => ({
            ...prev,
            interests,
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
            tags: formData.tags,
            about: {
                description: formData.description,
                interests: formData.interests,
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

        // Navigate back to main page with the new friend ID
        navigate(basePath || "/", { state: { newFriendId } });
    };

    return (
        <div className="min-h-screen mx-auto p-8 max-w-3xl">
            <div className="mb-8">
                {location.state && location.state.newFriendId && (
                    <button
                        onClick={() => navigate(basePath || "/")}
                        className="text-stone-600 hover:text-stone-900 mb-4 flex items-center"
                    >
                        ← Back to Friendex{isDemoMode && " Demo"}
                    </button>
                )}
                <h1 className="text-4xl font-bold text-stone-900">
                    Add New Friend
                    {isDemoMode && (
                        <span className="text-2xl text-stone-600 ml-2">
                            (Demo)
                        </span>
                    )}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="card-hand-drawn p-6 space-y-4">
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
                            {debouncedName && !profilePicture && (
                                <span className="block mt-1">
                                    (or leave blank for auto-generated avatar)
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="card-hand-drawn p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Basic Info
                    </h2>

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
                            value={formData.tags}
                            onChange={handleTagChange}
                        />
                    </div>
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

                    <div>
                        <InterestSelector
                            value={formData.interests}
                            onChange={handleInterestChange}
                        />
                    </div>
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
                        <label
                            htmlFor="howWeMet"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            How We Met
                        </label>
                        <textarea
                            id="howWeMet"
                            name="howWeMet"
                            value={formData.howWeMet}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Tell the story of how you met..."
                            className="w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                            style={{
                                borderRadius:
                                    "255px 15px 225px 15px/15px 225px 15px 255px",
                            }}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="card-hand-drawn p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Notes
                    </h2>

                    <div>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Any additional information you'd like to remember..."
                            className="w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                            style={{
                                borderRadius:
                                    "255px 15px 225px 15px/15px 225px 15px 255px",
                            }}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-stone-900 text-white px-6 py-3 rounded-md hover:bg-stone-800 transition-colors font-medium"
                    >
                        Add Friend
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(basePath || "/")}
                        className="px-6 py-3 rounded-md border border-stone-300 hover:bg-stone-100 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddFriend;
