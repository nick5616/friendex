import { getRelationshipType } from "./dex";

// Ordered from casual to closest so the friendship ladder reads left to right
const RELATIONSHIP_GROUPS = [
    {
        label: "Friendly Relationships",
        options: [
            "Acquaintance",
            "Colleague",
            "Coworker",
            "Classmate",
            "Neighbor",
            "Friend",
            "Good Friend",
            "Bestie",
            "Bestest Friend",
        ],
    },
    {
        label: "Romantic Relationships",
        options: ["Boyfriend", "Girlfriend", "Partner", "Fiance", "Husband", "Wife"],
    },
    {
        label: "Family Relationships",
        options: ["Sister", "Brother", "Mother", "Father", "Son", "Daughter"],
    },
];

function RelationshipSelector({ value = [], onChange }) {
    const currentRelationships = Array.isArray(value)
        ? value
        : value
        ? [value]
        : [];

    // Handle relationship selection - toggle selection
    const handleRelationshipChange = (relationship) => {
        if (currentRelationships.includes(relationship)) {
            onChange(currentRelationships.filter((rel) => rel !== relationship));
        } else {
            onChange([...currentRelationships, relationship]);
        }
    };

    return (
        <div>
            {/* Relationship chip selection */}
            <label className="block text-md font-medium text-stone-700 mb-1">
                Relationship
            </label>
            <div className="flex flex-col gap-2">
                {RELATIONSHIP_GROUPS.map((group) => (
                    <div key={group.label} className="flex flex-col mb-1">
                        <label className="text-sm text-stone-600 mb-1">
                            {group.label}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {group.options.map((relationship) => {
                                const selected =
                                    currentRelationships.includes(relationship);
                                const { color, gradient, icon: Icon } =
                                    getRelationshipType(relationship);
                                return (
                                    <button
                                        key={relationship}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() =>
                                            handleRelationshipChange(relationship)
                                        }
                                        className={`dex-tag !rounded-full inline-flex items-center gap-1.5 transition-all duration-200 hover:scale-105 ${
                                            selected
                                                ? `text-white border-stone-800 ${gradient ? "shimmer" : ""}`
                                                : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                                        }`}
                                        style={
                                            selected
                                                ? {
                                                      background: gradient || color,
                                                      textShadow: "0 1px 0 rgba(0,0,0,0.35)",
                                                  }
                                                : { background: undefined }
                                        }
                                    >
                                        <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                                        {relationship}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RelationshipSelector;
