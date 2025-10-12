import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "./db";
import { seedDatabase } from "./seed";
import FriendList from "./FriendList";
import RolodexList from "./RolodexList.tsx";
import FriendDetailView from "./FriendDetailView";

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const friends = useLiveQuery(() => db.friends.toArray());
    const [selectedFriendId, setSelectedFriendId] = useState(null);

    // Run the seeder on initial component mount
    useEffect(() => {
        seedDatabase();
    }, []);

    // Check if we're returning from adding a new friend
    useEffect(() => {
        if (location.state?.newFriendId) {
            setSelectedFriendId(location.state.newFriendId);
            // Clear the location state
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    // Effect to select the first friend when the list loads or changes
    useEffect(() => {
        if (friends && friends.length > 0 && !selectedFriendId) {
            setSelectedFriendId(friends[0].id);
        }
        // If the currently selected friend is deleted, select the first one
        if (
            friends &&
            selectedFriendId &&
            !friends.some((f) => f.id === selectedFriendId)
        ) {
            setSelectedFriendId(friends.length > 0 ? friends[0].id : null);
        }
    }, [friends, selectedFriendId]);

    const selectedFriend = friends?.find((f) => f.id === selectedFriendId);

    return (
        <div className="min-h-screen mx-auto md:p-8 flex flex-col">
            <header className="text-center mb-6 relative">
                <div className="flex items-center justify-center gap-6">
                    <h1 className="text-7xl font-bold text-stone-900">
                        Friendex
                    </h1>
                    <button
                        onClick={() => navigate("/add")}
                        className="bg-stone-900 text-white px-3 py-3 rounded-md hover:bg-stone-800 transition-colors font-medium text-sm"
                    >
                        New Friend
                    </button>
                </div>
            </header>

            <section className="flex flex-row md:flex-row items-center gap-4 mb-6">
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto md:mx-0 flex-shrink-0 card-hand-drawn flex items-center justify-center ml-4">
                    {selectedFriend?.profilePicture ? (
                        <img
                            src={selectedFriend.profilePicture}
                            alt={`Avatar for ${selectedFriend.name}`}
                            className="w-full h-full object-cover"
                            style={{
                                borderRadius:
                                    "255px 15px 225px 15px/15px 225px 15px 255px",
                            }}
                        />
                    ) : (
                        <div className="text-stone-400 text-center">
                            No Friend Selected
                        </div>
                    )}
                </div>

                {/* Friend List */}
                {/* <FriendList
                    friends={friends || []}
                    selectedId={selectedFriendId}
                    onSelect={setSelectedFriendId}
                /> */}
                <RolodexList
                    friends={friends || []}
                    selectedId={selectedFriendId}
                    onSelect={setSelectedFriendId}
                />
            </section>

            {/* --- Selected Friend Detail View --- */}
            <section className="flex-grow px-2 pb-2">
                <FriendDetailView friend={selectedFriend} />
            </section>
        </div>
    );
}

export default App;
