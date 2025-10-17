import { useState } from "react";

function PronounSelector({ value = [], onChange }) {
    // Available pronoun options
    const pronounOptions = ["he/him", "she/her", "they/them", "it/its"];

    // Handle pronoun selection
    const handlePronounToggle = (pronoun) => {
        if (value.includes(pronoun)) {
            // Remove pronoun if already selected
            onChange(value.filter((p) => p !== pronoun));
        } else {
            // Add pronoun in the order they were selected
            onChange([...value, pronoun]);
        }
    };

    // Format pronouns for display
    const formatPronounsDisplay = (pronouns) => {
        if (pronouns.length === 0) return "";
        if (pronouns.length === 1) return pronouns[0];

        const multiPronounString = pronouns
            .map((pronoun) => {
                return pronoun.split("/")[0];
            })
            .join("/");
        return multiPronounString;
    };

    return (
        <div>
            {/* Real-time display of selected pronouns */}
            <div className="mb-3 p-3 bg-stone-50 border border-stone-200 rounded-md">
                <div className="text-sm text-stone-600 mb-1">Preview:</div>
                <div className="text-lg font-medium text-stone-800">
                    {value.length > 0
                        ? formatPronounsDisplay(value)
                        : "No pronouns selected"}
                </div>
            </div>

            {/* Pronoun chip selection */}
            <div className="space-y-2">
                <div className="text-sm text-stone-600 mb-2">
                    Select pronouns (click to add/remove):
                </div>
                <div className="flex flex-wrap gap-2">
                    {pronounOptions.map((pronoun) => (
                        <button
                            key={pronoun}
                            type="button"
                            onClick={() => handlePronounToggle(pronoun)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                value.includes(pronoun)
                                    ? "bg-stone-900 text-white"
                                    : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                            }`}
                        >
                            {pronoun}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PronounSelector;
