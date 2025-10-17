import { useState, useEffect, useMemo } from "react";
import { db } from "./db";

function InterestSelector({ value = [], onChange }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [allInterests, setAllInterests] = useState([]);
    const [topInterests, setTopInterests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize database and load interests
    useEffect(() => {
        const initializeInterests = async () => {
            try {
                // Get top 12 most popular interests
                const popularInterests = await db.interests
                    .orderBy("usageCount")
                    .reverse()
                    .limit(12)
                    .toArray();
                setTopInterests(
                    popularInterests.map((interest) => interest.name)
                );

                // Get all interests for search
                const allInterestsData = await db.interests.toArray();
                const allInterestNames = allInterestsData.map(
                    (interest) => interest.name
                );
                setAllInterests(allInterestNames);

                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load interests from database:", error);
                setIsLoading(false);
            }
        };

        initializeInterests();
    }, []);

    // Filter interests based on search term
    const filteredInterests = useMemo(() => {
        if (!searchTerm.trim()) return topInterests;
        return allInterests.filter((interest) =>
            interest.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allInterests, topInterests, searchTerm]);

    // Handle interest selection
    const handleInterestToggle = (interest) => {
        if (value.includes(interest)) {
            // Remove interest if already selected
            onChange(value.filter((i) => i !== interest));
        } else {
            // Add interest in the order they were selected
            onChange([...value, interest]);
        }
    };

    // Handle adding new interest from search
    const handleAddNewInterest = async () => {
        const newInterest =
            searchTerm.trim().charAt(0).toUpperCase() +
            searchTerm.trim().slice(1);

        if (newInterest && !allInterests.includes(newInterest)) {
            try {
                // Add to database and increment usage
                const now = new Date();
                await db.interests.add({
                    name: newInterest,
                    usageCount: 1,
                    lastUsed: now,
                    createdAt: now,
                });

                // Add to current selection
                onChange([...value, newInterest]);

                // Update local state
                setAllInterests((prev) => [...prev, newInterest]);

                // Clear search
                setSearchTerm("");
            } catch (error) {
                console.error("Failed to create new interest:", error);
            }
        }
    };

    // Handle key press in search input
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (filteredInterests.length === 0 && searchTerm.trim()) {
                handleAddNewInterest();
            } else if (filteredInterests.length === 1) {
                handleInterestToggle(filteredInterests[0]);
                setSearchTerm("");
            }
        }
    };

    return (
        <div>
            {/* Search input */}
            <div className="mb-3">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search or add new interests..."
                    className="w-full px-3 py-2 border-2 border-stone-400 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                    style={{
                        borderRadius:
                            "255px 15px 225px 15px/15px 225px 15px 255px",
                        boxShadow: "2px 2px 0px #000",
                    }}
                />
            </div>

            {/* Selected interests display */}
            {value.length > 0 && (
                <div className="mb-3">
                    <div className="text-sm text-stone-600 mb-2">
                        Selected interests:
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {value.map((interest) => (
                            <span
                                key={interest}
                                className="tag-hand-drawn bg-amber-300 text-stone-900 border-stone-800"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Search results or all available interests */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="text-sm text-stone-500 italic">
                        Loading interests...
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-stone-600 mb-2">
                            {searchTerm.trim()
                                ? "Search results:"
                                : "Most popular interests:"}
                        </div>

                        {/* Show "Add new interest" option if search doesn't match existing interests */}
                        {searchTerm.trim() &&
                            filteredInterests.length === 0 && (
                                <button
                                    type="button"
                                    onClick={handleAddNewInterest}
                                    className="tag-hand-drawn bg-green-200 text-green-800 border-green-400 hover:bg-green-300 transition-colors"
                                >
                                    + Add "
                                    {searchTerm.charAt(0).toUpperCase() +
                                        searchTerm.slice(1)}
                                    "
                                </button>
                            )}

                        {/* Available interests */}
                        <div className="flex flex-wrap gap-2">
                            {filteredInterests.map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() =>
                                        handleInterestToggle(interest)
                                    }
                                    className={`tag-hand-drawn transition-all duration-200 hover:scale-105 ${
                                        value.includes(interest)
                                            ? "bg-amber-300 text-stone-900 border-stone-800"
                                            : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                                    }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>

                        {/* Show message when no results */}
                        {searchTerm.trim() &&
                            filteredInterests.length === 0 && (
                                <div className="text-sm text-stone-500 italic">
                                    No existing interests match "{searchTerm}".
                                    Press Enter or click "Add" to create a new
                                    interest.
                                </div>
                            )}

                        {/* Show hint when no search term */}
                        {!searchTerm.trim() && (
                            <div className="text-xs text-stone-500 italic">
                                Type to search all interests or create new ones
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default InterestSelector;
