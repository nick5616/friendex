import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "./db";

function ModifyFriend() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        pronouns: "",
        tags: "",
        description: "",
        interests: "",
        loveLanguages: "",
        birthday: "",
        howWeMet: "",
        notes: "",
    });

    // Load the friend's current data
    useEffect(() => {
        const loadFriend = async () => {
            const friend = await db.friends.get(parseInt(id));
            if (friend) {
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
                    notes: friend.notes || "",
                });
            }
            setLoading(false);
        };
        loadFriend();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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

        // Update the friend in the database
        await db.friends.update(parseInt(id), {
            name: formData.name,
            pronouns: formData.pronouns,
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
        });

        // Navigate back to main page
        navigate("/");
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
                    onClick={() => navigate("/")}
                    className="text-stone-600 hover:text-stone-900 mb-4 flex items-center"
                >
                    ← Back to Friendex
                </button>
                <h1 className="text-5xl font-bold text-stone-900">
                    Modify Friend
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        <label
                            htmlFor="pronouns"
                            className="block text-sm font-medium text-stone-700 mb-1"
                        >
                            Pronouns
                        </label>
                        <input
                            type="text"
                            id="pronouns"
                            name="pronouns"
                            value={formData.pronouns}
                            onChange={handleChange}
                            placeholder="e.g., she/her, he/him, they/them"
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500"
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
                        className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 transition-colors font-medium"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
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
