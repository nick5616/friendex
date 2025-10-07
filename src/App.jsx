import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import { seedDatabase } from "./seed";
import FriendList from "./FriendList";
import RolodexList from "./RolodexList.tsx";
import FriendDetailView from "./FriendDetailView";

function App() {
    const friends = useLiveQuery(() => db.friends.toArray());
    const [selectedFriendId, setSelectedFriendId] = useState(null);

    // Run the seeder on initial component mount
    useEffect(() => {
        seedDatabase();
    }, []);

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
        <div className="min-h-screen mx-auto pl-4 md:p-8 flex flex-col">
            <header className="text-center mb-6">
                <h1 className="text-7xl font-bold text-stone-900">Friendex</h1>
            </header>

            <section className="flex flex-row md:flex-row items-center gap-4 mb-6">
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto md:mx-0 flex-shrink-0 card-hand-drawn flex items-center justify-center">
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
            <section className="flex-grow">
                <FriendDetailView friend={selectedFriend} />
            </section>
        </div>
    );
}

export default App;
