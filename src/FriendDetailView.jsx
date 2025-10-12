// src/FriendDetailView.jsx
import { useNavigate } from "react-router-dom";

function FriendDetailView({ friend }) {
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

    return (
        <div className="card-hand-drawn space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-5xl font-bold text-amber-600">
                    {friend.name}
                </h2>
                <button
                    onClick={() => navigate(`/modify/${friend.id}`)}
                    className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors font-medium text-sm"
                >
                    Modify
                </button>
            </div>

            {/* About Section */}
            <section>
                <h3 className="text-3xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                    About
                </h3>
                <p className="text-lg text-stone-700">
                    {friend.about?.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {friend.about?.interests?.map((interest) => (
                        <span key={interest} className="tag-hand-drawn">
                            {interest}
                        </span>
                    ))}
                </div>
            </section>

            {/* Key Info Section */}
            <section>
                <h3 className="text-3xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                    Key Info
                </h3>
                <ul className="text-lg space-y-2">
                    <li>
                        <strong>Birthday:</strong> {friend.keyInfo?.birthday}
                    </li>
                    <li>
                        <strong>How We Met:</strong> {friend.keyInfo?.howWeMet}
                    </li>
                    <li>
                        <strong>Pronouns:</strong> {friend.pronouns}
                    </li>
                </ul>
            </section>

            {/* Notes Section */}
            <section>
                <h3 className="text-3xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-3">
                    Notes
                </h3>
                <p
                    className="text-lg text-stone-700 bg-amber-100 p-3"
                    style={{ borderRadius: "15px" }}
                >
                    {friend.notes}
                </p>
            </section>
        </div>
    );
}

export default FriendDetailView;
