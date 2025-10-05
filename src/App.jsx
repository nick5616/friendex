import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

// A mock friend for easy testing
const createMockFriend = () => ({
    name: `Egg Bert ${Math.floor(Math.random() * 100)}`,
    pronouns: "they/them",
    tags: ["House Partier", "DnD Group"],
    contact: { phone: "555-123-4567", email: "egg.bert@example.com" },
    socials: [{ platform: "Instagram", handle: "eggbert_adventures" }],
    about: {
        description:
            "Met them at the apple orchard. We bonded over our love for golden retrievers.",
        interests: ["Cooking", "Dogs", "Board Games"],
        loveLanguages: ["Quality Time", "Acts of Service"],
    },
    keyInfo: {
        birthday: "1995-10-26",
        howWeMet: "At John Pork's house party, Fall 2022.",
        giftIdeas: ["Loves scented candles (lavender)", "Cookbooks"],
    },
    notes: `Added on ${new Date().toLocaleDateString()}`,
    createdAt: new Date(),
});

function App() {
    const friends = useLiveQuery(() => db.friends.toArray());

    const addFriend = async () => {
        try {
            await db.friends.add(createMockFriend());
        } catch (error) {
            console.error("Failed to add friend:", error);
        }
    };

    const clearAllFriends = async () => {
        if (
            window.confirm(
                "Are you sure you want to delete all friends? This can't be undone!"
            )
        ) {
            try {
                await db.friends.clear();
            } catch (error) {
                console.error("Failed to clear friends:", error);
            }
        }
    };

    return (
        <div className="min-h-screen container mx-auto p-4 md:p-8">
            <header className="text-center mb-10">
                <h1 className="text-7xl font-bold text-stone-900">Friendex</h1>
                <p className="text-stone-600 text-xl mt-2">
                    Your personal relationship rolodex.
                </p>
            </header>

            <div className="flex justify-center gap-4 mb-10">
                <button
                    onClick={addFriend}
                    className="btn-hand-drawn btn-primary"
                >
                    Add Mock Friend
                </button>
                <button
                    onClick={clearAllFriends}
                    className="btn-hand-drawn btn-danger"
                >
                    Clear All
                </button>
            </div>

            <main className="max-w-2xl mx-auto">
                <h2 className="text-4xl font-bold border-b-2 border-dashed border-stone-400 pb-2 mb-6">
                    Friend Index ({friends?.length || 0})
                </h2>

                {(!friends || friends.length === 0) && (
                    <div className="text-center text-stone-500 py-8 text-lg">
                        <p>Your Friend Index is empty.</p>
                        <p>Add a friend to get started!</p>
                    </div>
                )}

                <ul className="space-y-6">
                    {friends?.map((friend) => (
                        <li key={friend.id} className="card-hand-drawn">
                            <h3 className="font-bold text-3xl text-amber-600">
                                {friend.name}
                            </h3>
                            <p className="text-stone-700 text-lg my-2">
                                {friend.about?.description}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {friend.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-stone-200 text-stone-800 text-sm font-bold px-3 py-1 border border-stone-400"
                                        style={{
                                            borderRadius:
                                                "255px 15px 225px 15px/15px 225px 15px 255px",
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}

export default App;
