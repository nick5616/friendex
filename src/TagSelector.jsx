import { useState, useEffect, useMemo, useRef } from "react";
import { db } from "./db";
import {
    capitalizeEachFirstLetter,
    fromCommaStringToArray,
    fromArrayToCommaString,
} from "./utils";

function TagSelector({ value = [], onChange, pronouns }) {
    const input = fromCommaStringToArray(value);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [topTags, setTopTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const tagInputRef = useRef(null);

    // Initialize database and load tags
    useEffect(() => {
        const initializeTags = async () => {
            try {
                // Get top 12 most popular tags
                const popularTags = await db.tags
                    .orderBy("usageCount")
                    .reverse()
                    .limit(12)
                    .toArray();
                setTopTags(popularTags.map((tag) => tag.name));

                // Get all tags for search
                const allTagsData = await db.tags.toArray();
                const allTagNames = allTagsData.map((tag) => tag.name);
                setAllTags(allTagNames);

                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load tags from database:", error);
                setIsLoading(false);
            }
        };

        initializeTags();
    }, []);

    // Filter tags based on search term
    const filteredTags = useMemo(() => {
        if (!searchTerm.trim()) return topTags;
        return allTags.filter((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allTags, topTags, searchTerm]);

    // Handle tag selection
    const handleTagToggle = (tag) => {
        let newTags;
        if (input.includes(tag)) {
            // Remove tag if already selected
            newTags = input.filter((t) => t !== tag);
        } else {
            // Add tag in the order they were selected
            newTags = [...input, tag];
        }

        // Always convert to comma-separated string for consistency
        onChange(fromArrayToCommaString(newTags));
    };

    // Handle adding new tag from search
    const handleAddNewTag = async () => {
        const newTag = capitalizeEachFirstLetter(searchTerm.trim());

        if (newTag && !allTags.includes(newTag)) {
            try {
                // Add to database and increment usage
                const now = new Date();
                await db.tags.add({
                    name: newTag,
                    usageCount: 1,
                    lastUsed: now,
                    createdAt: now,
                });

                // Add to current selection
                onChange(fromArrayToCommaString([...input, newTag]));

                // Update local state
                setAllTags((prev) => [...prev, newTag]);

                // Clear search
                setSearchTerm("");
            } catch (error) {
                console.error("Failed to create new tag:", error);
            } finally {
                // focus the search input
                if (tagInputRef.current) {
                    tagInputRef.current.focus();
                    setIsSearchFocused(true);
                }
            }
        }
    };

    // Handle key press in search input
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (filteredTags.length === 0 && searchTerm.trim()) {
                handleAddNewTag();
            } else if (filteredTags.length === 1) {
                handleTagToggle(filteredTags[0]);
                setSearchTerm("");
            }
        }
    };

    console.log("spronouns", pronouns);
    const possessivePronoun =
        pronouns && pronouns.length > 0 ? pronouns[0].split("/")[1] : "them";

    return (
        <div>
            {/* Search input */}
            <div className="mb-3">
                <label
                    htmlFor="tags"
                    className="block text-md font-medium text-stone-700 mb-1"
                >
                    Tags
                </label>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                    What do you associate with {possessivePronoun}?
                </label>
                <input
                    ref={tagInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search or add new tags..."
                    className="w-full px-3 py-2 border-2 border-stone-400 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                    style={{
                        borderRadius:
                            "255px 15px 225px 15px/15px 225px 15px 255px",
                    }}
                />
            </div>

            {/* Selected tags display */}
            {input.length > 0 && (
                <div className="mb-3">
                    <div className="text-sm text-stone-600 mb-2">
                        Selected tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {input.map((tag) => (
                            <span
                                key={tag}
                                className="tag-hand-drawn bg-amber-300 text-stone-900 border-stone-800"
                                onClick={() => handleTagToggle(tag)}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Search results or all available tags */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="text-sm text-stone-500 italic">
                        Loading tags...
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-stone-600 mb-2">
                            {searchTerm.trim()
                                ? "Search results"
                                : "Most popular tags"}
                        </div>

                        {/* Show "Add new tag" option if search doesn't match existing tags */}
                        {searchTerm.trim() && filteredTags.length === 0 && (
                            <button
                                type="button"
                                onClick={handleAddNewTag}
                                className="tag-hand-drawn bg-green-200 text-green-800 border-green-400 hover:bg-green-300 transition-colors"
                            >
                                + Add "{capitalizeEachFirstLetter(searchTerm)}"
                            </button>
                        )}

                        {/* Available tags */}
                        <div className="flex flex-wrap gap-2">
                            {filteredTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    className={`tag-hand-drawn transition-all duration-200 hover:scale-105 ${
                                        input.includes(tag)
                                            ? "bg-amber-300 text-stone-900 border-stone-800"
                                            : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* Show message when no results */}
                        {searchTerm.trim() && filteredTags.length === 0 && (
                            <div className="text-sm text-stone-500 italic">
                                No existing tags match "
                                {capitalizeEachFirstLetter(searchTerm)}". Press
                                Enter or click "Add" to create a new tag.
                            </div>
                        )}

                        {/* Show hint when no search term */}
                        {!searchTerm.trim() && (
                            <div className="text-xs text-stone-500 italic">
                                Type to search all tags or create new ones
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default TagSelector;
