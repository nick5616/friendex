import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "./db";
import { demoDb } from "./demoDb";
import { seedDatabase } from "./seed";
import { seedDemoDatabase } from "./demoSeed";
import FriendList from "./FriendList";
import RolodexList from "./RolodexList.tsx";
import FriendDetailView from "./FriendDetailView";
import FilterAndSort from "./FilterAndSort";

function App() {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if we're in demo mode based on the URL
    const isDemoMode = location.pathname.startsWith("/demo");
    const currentDb = isDemoMode ? demoDb : db;
    const basePath = isDemoMode ? "/demo" : "";

    const friends = useLiveQuery(() => currentDb.friends.toArray());
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const fileInputRef = useRef(null);
    const importFileInputRef = useRef(null);
    const [sortBy, setSortBy] = useState("name");
    const [filterText, setFilterText] = useState("");
    const [filterField, setFilterField] = useState("name");

    // Seed the appropriate database on initial mount
    useEffect(() => {
        if (isDemoMode) {
            seedDemoDatabase();
        }
        // Note: seedDatabase is commented out for production, but could be called here if needed
        // else {
        //     seedDatabase();
        // }
    }, [isDemoMode]);

    // Check if we're returning from adding a new friend
    useEffect(() => {
        if (location.state?.newFriendId) {
            setSelectedFriendId(location.state.newFriendId);
            // Clear the location state
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    // Apply filtering and sorting
    const getFilteredAndSortedFriends = () => {
        if (!friends) return [];

        let filtered = [...friends];

        // Apply filter
        if (filterText.trim()) {
            filtered = filtered.filter((friend) => {
                const searchText = filterText.toLowerCase();

                switch (filterField) {
                    case "name":
                        return friend.name?.toLowerCase().includes(searchText);
                    case "tags":
                        return friend.tags?.some((tag) =>
                            tag.toLowerCase().includes(searchText)
                        );
                    case "pronouns":
                        return friend.pronouns
                            ?.toLowerCase()
                            .includes(searchText);
                    case "notes":
                        return friend.notes?.toLowerCase().includes(searchText);
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        switch (sortBy) {
            case "name":
                filtered.sort(
                    (a, b) => a.name?.localeCompare(b.name || "") || 0
                );
                break;
            case "age":
                filtered.sort((a, b) => {
                    const dateA = a.keyInfo?.birthday
                        ? new Date(a.keyInfo.birthday)
                        : new Date();
                    const dateB = b.keyInfo?.birthday
                        ? new Date(b.keyInfo.birthday)
                        : new Date();
                    return dateA - dateB; // Oldest first
                });
                break;
            default:
                // No sorting, keep original order
                break;
        }

        return filtered;
    };

    const filteredAndSortedFriends = getFilteredAndSortedFriends();
    const selectedFriend = filteredAndSortedFriends?.find(
        (f) => f.id === selectedFriendId
    );

    // Effect to select the first friend when the list loads or changes
    useEffect(() => {
        const currentList = filteredAndSortedFriends;
        if (currentList && currentList.length > 0 && !selectedFriendId) {
            setSelectedFriendId(currentList[0].id);
        }
        // If the currently selected friend is deleted or filtered out, select the first one
        if (
            currentList &&
            selectedFriendId &&
            !currentList.some((f) => f.id === selectedFriendId)
        ) {
            setSelectedFriendId(
                currentList.length > 0 ? currentList[0].id : null
            );
        }
    }, [filteredAndSortedFriends, selectedFriendId]);

    const handleProfilePictureClick = () => {
        if (selectedFriend && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedFriend) return;

        // Convert file to base64 data URL
        const reader = new FileReader();
        reader.onload = async (event) => {
            const dataUrl = event.target.result;
            // Update the friend's profile picture in the database
            await currentDb.friends.update(selectedFriend.id, {
                profilePicture: dataUrl,
            });
        };
        reader.readAsDataURL(file);

        // Reset the input so the same file can be selected again
        e.target.value = "";
    };

    const handleExportFriends = async () => {
        // Get all friends from the database
        const allFriends = await currentDb.friends.toArray();

        // Convert to JSON with pretty formatting
        const jsonString = JSON.stringify(allFriends, null, 2);

        // Create a blob from the JSON string
        const blob = new Blob([jsonString], { type: "application/json" });

        // Create a download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        // Generate filename with current date
        const date = new Date().toISOString().split("T")[0];
        const prefix = isDemoMode ? "friendex-demo-export" : "friendex-export";
        link.download = `${prefix}-${date}.json`;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        importFileInputRef.current?.click();
    };

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedFriends = JSON.parse(text);

            if (!Array.isArray(importedFriends)) {
                alert("Invalid JSON format. Expected an array of friends.");
                return;
            }

            // Remove the id field from imported friends to let Dexie generate new ones
            const friendsToImport = importedFriends.map((friend) => {
                const { id, ...friendWithoutId } = friend;
                return friendWithoutId;
            });

            // Add all friends to the database
            await currentDb.friends.bulkAdd(friendsToImport);

            alert(`Successfully imported ${friendsToImport.length} friend(s)!`);

            // Reset the input
            e.target.value = "";
        } catch (error) {
            console.error("Import error:", error);
            alert(
                "Error importing friends. Please check the JSON file format."
            );
        }
    };

    const handleResetDemo = async () => {
        if (
            confirm(
                "Are you sure you want to reset the demo database to its original state?"
            )
        ) {
            await seedDemoDatabase();
            alert("Demo database has been reset!");
        }
    };

    return (
        <div className="min-h-screen mx-auto md:p-8 flex flex-col">
            <header className="text-center mb-6 relative">
                <div className="flex items-center justify-center gap-6">
                    <h1 className="text-7xl font-bold text-stone-900">
                        Friendex
                    </h1>
                    <button
                        onClick={() => navigate(`${basePath}/add`)}
                        className="bg-stone-900 text-white px-3 py-3 rounded-md hover:bg-stone-800 transition-colors font-medium text-sm"
                    >
                        New Friend
                    </button>
                </div>
            </header>
            {/* Filter and Sort Controls */}
            <FilterAndSort
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterText={filterText}
                setFilterText={setFilterText}
                filterField={filterField}
                setFilterField={setFilterField}
                filteredCount={filteredAndSortedFriends.length}
            />

            <section className="flex flex-row md:flex-row items-center gap-4 mb-6">
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto md:mx-0 flex-shrink-0 card-hand-drawn flex items-center justify-center ml-4 relative group">
                    {selectedFriend?.profilePicture ? (
                        <>
                            <img
                                src={selectedFriend.profilePicture}
                                alt={`Avatar for ${selectedFriend.name}`}
                                className="w-full h-full object-cover cursor-pointer transition-opacity group-hover:opacity-75"
                                style={{
                                    borderRadius:
                                        "255px 15px 225px 15px/15px 225px 15px 255px",
                                }}
                                onClick={handleProfilePictureClick}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="bg-stone-900 text-white px-4 py-2 rounded-md text-sm font-medium">
                                    Change Photo
                                </span>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </>
                    ) : (
                        <div className="text-stone-400 text-center">
                            No Friend Selected
                        </div>
                    )}
                </div>
                <RolodexList
                    friends={filteredAndSortedFriends || []}
                    selectedId={selectedFriendId}
                    onSelect={setSelectedFriendId}
                />
            </section>

            {/* --- Selected Friend Detail View --- */}
            <section className="flex-grow px-2 pb-2">
                <FriendDetailView friend={selectedFriend} basePath={basePath} />
            </section>

            {/* Export/Import/Reset Buttons */}
            {!isDemoMode && (
                <section className="px-2 pb-4 mt-6 flex justify-center gap-4">
                    <button
                        onClick={handleImportClick}
                        className="bg-stone-700 text-white px-6 py-3 rounded-md hover:bg-stone-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                            />
                        </svg>
                        Import Friends
                    </button>
                    <input
                        ref={importFileInputRef}
                        type="file"
                        accept="application/json"
                        onChange={handleImportFile}
                        className="hidden"
                    />
                    <button
                        onClick={handleExportFriends}
                        className="bg-stone-700 text-white px-6 py-3 rounded-md hover:bg-stone-600 transition-colors font-medium flex items-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                        </svg>
                        Export Friends
                    </button>
                </section>
            )}
        </div>
    );
}

export default App;
