import { useState } from "react";

function RelationshipSelector({ value = [], onChange }) {
    // Available relationship options
    const familyRelationshipOptions = [
        "Sister",
        "Brother",
        "Mother",
        "Father",
        "Son",
        "Daughter",
    ];

    const romanticRelationshipOptions = [
        "Boyfriend",
        "Girlfriend",
        "Partner",
        "Fiance",
        "Husband",
        "Wife",
    ];

    const friendlyRelationshipOptions = [
        "Colleague",
        "Classmate",
        "Neighbor",
        "Coworker",
        "Acquaintance",
        "Friend",
        "Good Friend",
        "Bestie",
        "Bestest Friend",
    ];

    // Handle relationship selection - toggle selection
    const handleRelationshipChange = (relationship) => {
        const currentRelationships = Array.isArray(value)
            ? value
            : value
            ? [value]
            : [];

        if (currentRelationships.includes(relationship)) {
            // Remove relationship if already selected
            const updatedRelationships = currentRelationships.filter(
                (rel) => rel !== relationship
            );
            onChange(updatedRelationships);
        } else {
            // Add relationship if not selected
            const updatedRelationships = [
                ...currentRelationships,
                relationship,
            ];
            onChange(updatedRelationships);
        }
    };

    return (
        <div>
            {/* Relationship chip selection */}
            <label className="block text-md font-medium text-stone-700 mb-1">
                Relationship
            </label>
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col mb-1">
                        <label className="text-sm text-stone-600 mb-1">
                            Friendly Relationships
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {friendlyRelationshipOptions.map((relationship) => (
                                <button
                                    key={relationship}
                                    type="button"
                                    onClick={() =>
                                        handleRelationshipChange(relationship)
                                    }
                                    className={`tag-hand-drawn transition-all duration-200 hover:scale-105 ${
                                        (Array.isArray(value)
                                            ? value
                                            : value
                                            ? [value]
                                            : []
                                        ).includes(relationship)
                                            ? "bg-amber-300 text-stone-900 border-stone-800"
                                            : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                                    }`}
                                >
                                    {relationship}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col mb-1">
                        <label className="text-sm text-stone-600 mb-1">
                            Romantic Relationships
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {romanticRelationshipOptions.map((relationship) => (
                                <button
                                    key={relationship}
                                    type="button"
                                    onClick={() =>
                                        handleRelationshipChange(relationship)
                                    }
                                    className={`tag-hand-drawn transition-all duration-200 hover:scale-105 ${
                                        (Array.isArray(value)
                                            ? value
                                            : value
                                            ? [value]
                                            : []
                                        ).includes(relationship)
                                            ? "bg-amber-300 text-stone-900 border-stone-800"
                                            : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                                    }`}
                                >
                                    {relationship}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm text-stone-600 mb-1">
                            Family Relationships
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {familyRelationshipOptions.map((relationship) => (
                                <button
                                    key={relationship}
                                    type="button"
                                    onClick={() =>
                                        handleRelationshipChange(relationship)
                                    }
                                    className={`tag-hand-drawn transition-all duration-200 hover:scale-105 ${
                                        (Array.isArray(value)
                                            ? value
                                            : value
                                            ? [value]
                                            : []
                                        ).includes(relationship)
                                            ? "bg-amber-300 text-stone-900 border-stone-800"
                                            : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                                    }`}
                                >
                                    {relationship}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RelationshipSelector;
