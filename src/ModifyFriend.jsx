import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { db } from "./db";
import { demoDb } from "./demoDb";
import RelationshipSelector from "./RelationshipSelector";
import InterestSelector from "./InterestSelector";
import TagSelector from "./TagSelector";
import PronounSelector from "./PronounSelector";
import BirthdaySelector from "./BirthdaySelector";
import DescriptionSelector from "./DescriptionSelector";

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
    const [formData, setFormData] = useState({
        name: "",
        pronouns: "",
        tags: "",
        description: "",
        interests: "",
        loveLanguages: "",
        birthday: "",
        howWeMet: "",
        relationship: "",
        notes: "",
    });

    // Load the friend's current data
    useEffect(() => {
        const loadFriend = async () => {
            const friend = await currentDb.friends.get(parseInt(id));
            if (friend) {
                setOriginalProfilePicture(friend.profilePicture);
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
                    relationship: friend.keyInfo?.relationship || "",
                    notes: friend.notes || "",
                });
            }
            setLoading(false);
        };
        loadFriend();
    }, [id, currentDb]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle relationship selection change
    const handleRelationshipChange = (relationship) => {
        setFormData((prev) => ({
            ...prev,
            relationship,
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
            tags: formData.tags,
            about: {
                description: formData.description,
                interests: formData.interests,
            },
            keyInfo: {
                birthday: formData.birthday,
                howWeMet: formData.howWeMet,
                relationship: formData.relationship,
            },
            notes: formData.notes,
        };

        // Only update profile picture if a new one was uploaded
        if (profilePicture) {
            updateData.profilePicture = profilePicture;
        }

        await currentDb.friends.update(parseInt(id), updateData);

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
        <div className="min-h-screen mx-auto p-8 max-w-3xl">
            <div className="mb-8">
                <button
                    onClick={() => navigate(basePath || "/")}
                    className="text-stone-600 hover:text-stone-900 mb-4 flex items-center"
                >
                    ← Back to Friendex{isDemoMode && " Demo"}
                </button>
                <h1 className="text-5xl font-bold text-stone-900">
                    Modify Friend
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
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Basic Info
                    </h2>

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                        />
                    </div>

                    <PronounSelector
                        value={formData.pronouns}
                        onChange={handlePronounChange}
                    />

                    <TagSelector
                        value={formData.tags}
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
                        value={formData.interests}
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
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                            Relationship
                        </label>
                        <RelationshipSelector
                            value={formData.relationship}
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
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="card-hand-drawn p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Notes
                    </h2>

                    <div>
                        <label
                            htmlFor="notes"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            Additional Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Any additional information you'd like to remember..."
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 transition-colors font-medium"
                    >
                        Save Changes
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

export default ModifyFriend;
