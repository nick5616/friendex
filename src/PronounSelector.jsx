import { useRef } from "react";
import { PRONOUN_OPTIONS, parsePronouns, formatPronouns } from "./utils";

function PronounSelector({ value = [], onChange }) {
    const input = parsePronouns(value);
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
            <div className="mb-3 p-3 bg-stone-50 border border-stone-200 dex-card-muted">
                <div className="text-lg font-medium text-stone-800">
                    {input.length > 0
                        ? formatPronouns(input)
                        : "No pronouns selected"}
                </div>
            </div>

            {/* Pronoun chip selection */}
            <div className="space-y-2">
                <div className="text-sm text-stone-600 mb-2">
                    Select pronouns (click to add/remove):
                </div>
                <div className="flex flex-wrap gap-2">
                    {PRONOUN_OPTIONS.map((pronoun) => {
                        const selected = input.includes(pronoun);
                        return (
                            <button
                                key={pronoun}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => handlePronounToggle(pronoun)}
                                className={`dex-tag transition-all duration-200 hover:scale-105 ${
                                    selected
                                        ? "border-stone-800"
                                        : "bg-stone-200 text-stone-800 border-stone-400 hover:bg-stone-300"
                                }`}
                                style={
                                    selected
                                        ? {
                                              backgroundColor: "var(--color-btn-bg)",
                                              color: "var(--color-btn-text)",
                                          }
                                        : undefined
                                }
                            >
                                {pronoun}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default PronounSelector;
