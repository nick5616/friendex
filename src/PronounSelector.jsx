import { useRef } from "react";
import { fromCommaStringToArray } from "./utils";
function PronounSelector({ value = [], onChange }) {
    console.log("PronounSelector got value", value);
    console.log(" API got pronouns", value);
    // Available pronoun options
    const pronounOptions = ["he/him", "she/her", "they/them", "it/its"];
    const input = fromCommaStringToArray(value);
    // Handle pronoun selection
    const handlePronounToggle = (pronoun) => {
        if (input.includes(pronoun)) {
            // Remove pronoun if already selected
            onChange(input.filter((p) => p !== pronoun));
        } else {
            // Add pronoun in the order they were selected
            onChange([...input, pronoun]);
        }
    };

    // Format pronouns for display
    const formatPronounsDisplay = (pronouns) => {
        if (pronouns.length === 0) return "";
        if (pronouns.length === 1) return pronouns[0];
        console.log("got pronouns in formatPronounsDisplay", pronouns);
        const multiPronounString = pronouns
            .map((pronoun) => {
                return pronoun.split("/")[0];
            })
            .join("/");
        return multiPronounString;
    };

    const containerRef = useRef(null);

    return (
        <div ref={containerRef}>
            {/* Focus anchor so mobile keyboard Next lands here; shifts focus to first button */}
            <input
                type="text"
                className="sr-only"
                tabIndex={0}
                enterKeyHint="next"
                aria-label="Pronoun selector focus anchor"
                onFocus={() => {
                    const container = containerRef.current;
                    if (!container) return;
                    const firstButton = container.querySelector("button");
                    if (firstButton) firstButton.focus();
                }}
            />
            <label
                htmlFor="pronouns"
                className="block text-md font-medium text-stone-700 mb-1"
            >
                Pronouns
            </label>
            {/* Real-time display of selected pronouns */}
            <div className="mb-3 p-3 bg-stone-50 border border-stone-200 muted-card-hand-drawn">
                <div className="text-lg font-medium text-stone-800">
                    {input.length > 0
                        ? formatPronounsDisplay(input)
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
                            className={`tag-hand-drawn transition-all duration-200 hover:scale-105 ${
                                input.includes(pronoun)
                                    ? "bg-amber-300 text-stone-900 border-stone-800"
                                    : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
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
