// src/FriendDetailView.jsx
import { useNavigate } from "react-router-dom";

function FriendDetailView({ friend, basePath = "" }) {
    const navigate = useNavigate();
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

    return (
        <div className="card-hand-drawn space-y-6 p-6">
            {/* Header with Profile Picture and Name */}
            <div className="flex items-start gap-6">
                {/* Name and Modify Button */}
                <div className="flex-1 flex items-start justify-between">
                    <div>
                        <h2 className="text-4xl font-bold text-amber-600 mb-2">
                            {friend.name}
                        </h2>
                        {friend.pronouns && (
                            <p className="text-lg text-stone-600 mb-2">
                                {friend.pronouns}
                            </p>
                        )}
                        {friend.keyInfo?.relationship && (
                            <span className="tag-hand-drawn text-sm">
                                {friend.keyInfo.relationship}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() =>
                            navigate(`${basePath}/modify/${friend.id}`)
                        }
                        className="btn-hand-drawn btn-primary text-sm px-4 py-2"
                    >
                        Modify
                    </button>
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

            {/* Love Languages Section */}
            {friend.about?.loveLanguages &&
                friend.about.loveLanguages.length > 0 && (
                    <section>
                        <h3 className="text-2xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                            Love Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {friend.about.loveLanguages.map((loveLanguage) => (
                                <span
                                    key={loveLanguage}
                                    className="tag-hand-drawn bg-pink-200 text-pink-800 border-pink-400"
                                >
                                    {loveLanguage}
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
            {friend.notes && (
                <section>
                    <h3 className="text-2xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                        Notes
                    </h3>
                    <div
                        className="text-lg text-stone-700 bg-amber-100 p-4 leading-relaxed"
                        style={{ borderRadius: "15px" }}
                    >
                        {friend.notes}
                    </div>
                </section>
            )}

            {/* Metadata Section */}
            <section className="border-t-2 border-dashed border-stone-300 pt-4">
                <div className="text-sm text-stone-500">
                    <p>Added on {formatCreatedDate(friend.createdAt)}</p>
                </div>
            </section>
        </div>
    );
}

export default FriendDetailView;
