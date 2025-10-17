import { useState } from "react";

function LoveLanguageSelector({ value = [], onChange }) {
    // The 5 love languages
    const loveLanguageOptions = [
        "Words of Affirmation",
        "Acts of Service",
        "Receiving Gifts",
        "Quality Time",
        "Physical Touch",
    ];

    // Handle love language selection
    const handleLoveLanguageToggle = (loveLanguage) => {
        if (value.includes(loveLanguage)) {
            // Remove love language if already selected
            onChange(value.filter((l) => l !== loveLanguage));
        } else {
            // Add love language in the order they were selected
            onChange([...value, loveLanguage]);
        }
    };

    return (
        <div>
            {/* Love language chip selection */}
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    {loveLanguageOptions.map((loveLanguage) => (
                        <button
                            key={loveLanguage}
                            type="button"
                            onClick={() =>
                                handleLoveLanguageToggle(loveLanguage)
                            }
                            className={`tag-hand-drawn transition-all duration-200 hover:scale-105 ${
                                value.includes(loveLanguage)
                                    ? "bg-amber-300 text-stone-900 border-stone-800"
                                    : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                            }`}
                        >
                            {loveLanguage}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LoveLanguageSelector;
