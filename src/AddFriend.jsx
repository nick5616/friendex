import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "./db";
import { demoDb } from "./demoDb";
import PronounSelector from "./PronounSelector";

function AddFriend() {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);

    // Determine if we're in demo mode based on the URL
    const isDemoMode = location.pathname.startsWith("/demo");
    const currentDb = isDemoMode ? demoDb : db;
    const basePath = isDemoMode ? "/demo" : "";

    const [profilePicture, setProfilePicture] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        pronouns: [],
        tags: "",
        description: "",
        interests: "",
        loveLanguages: "",
        birthday: "",
        howWeMet: "",
        notes: "",
    });

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

        // Parse comma-separated values into arrays
        const tagsArray = formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t);
        const interestsArray = formData.interests
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i);
        const loveLanguagesArray = formData.loveLanguages
            .split(",")
            .map((l) => l.trim())
            .filter((l) => l);

        // Create the friend object
        const newFriend = {
            name: formData.name,
            pronouns: formData.pronouns.join("/"),
            profilePicture: profilePicture || generateAvatar(formData.name),
            tags: tagsArray,
            about: {
                description: formData.description,
                interests: interestsArray,
                loveLanguages: loveLanguagesArray,
            },
            keyInfo: {
                birthday: formData.birthday,
                howWeMet: formData.howWeMet,
            },
            notes: formData.notes,
            createdAt: new Date(),
        };

        // Add to database and get the new ID
        const newFriendId = await currentDb.friends.add(newFriend);

        // Navigate back to main page with the new friend ID
        navigate(basePath || "/", { state: { newFriendId } });
    };

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
                            className="w-32 h-32 rounded-full bg-stone-200 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-75 transition-opacity relative group"
                            onClick={handleProfilePictureClick}
                        >
                            {profilePicture ||
                            (formData.name && generateAvatar(formData.name)) ? (
                                <img
                                    src={
                                        profilePicture ||
                                        generateAvatar(formData.name)
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
                            {formData.name && !profilePicture && (
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

                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                            Pronouns
                        </label>
                        <PronounSelector
                            value={formData.pronouns}
                            onChange={handlePronounChange}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="tags"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            Tags
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g., Work, College Friend, Gaming (comma-separated)"
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                        />
                    </div>
                </div>

                {/* About Section */}
                <div className="card-hand-drawn p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        About
                    </h2>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Tell us about this friend..."
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="interests"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            Interests
                        </label>
                        <input
                            type="text"
                            id="interests"
                            name="interests"
                            value={formData.interests}
                            onChange={handleChange}
                            placeholder="e.g., Gaming, Cooking, Hiking (comma-separated)"
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="loveLanguages"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            Love Languages
                        </label>
                        <input
                            type="text"
                            id="loveLanguages"
                            name="loveLanguages"
                            value={formData.loveLanguages}
                            onChange={handleChange}
                            placeholder="e.g., Quality Time, Gift Giving (comma-separated)"
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
                        />
                    </div>
                </div>

                {/* Key Info */}
                <div className="card-hand-drawn p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-stone-800 mb-4">
                        Key Info
                    </h2>

                    <div>
                        <label
                            htmlFor="birthday"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            Birthday
                        </label>
                        <input
                            type="date"
                            id="birthday"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
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
