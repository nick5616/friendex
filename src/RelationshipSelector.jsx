import { useState } from "react";

function RelationshipSelector({ value = "", onChange }) {
    // Available relationship options
    const relationshipOptions = [
        "Acquaintance",
        "Friend",
        "Good Friend",
        "Bestie",
        "Boyfriend",
        "Girlfriend",
        "Partner",
        "Fiancé",
        "Husband",
        "Wife",
    ];

    // Handle relationship selection
    const handleRelationshipChange = (relationship) => {
        onChange(relationship);
    };

    return (
        <div>
            {/* Relationship chip selection */}
            <div className="space-y-2">
                <div className="text-sm text-stone-600 mb-2">
                    Select relationship (click to choose):
                </div>
                <div className="flex flex-wrap gap-2">
                    {relationshipOptions.map((relationship) => (
                        <button
                            key={relationship}
                            type="button"
                            onClick={() =>
                                handleRelationshipChange(relationship)
                            }
                            className={`tag-hand-drawn transition-all duration-200 hover:scale-105 ${
                                value === relationship
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
    );
}

export default RelationshipSelector;
