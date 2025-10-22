import { forwardRef } from "react";

const BirthdaySelector = forwardRef(
    ({ value, onChange, required = false }, ref) => {
        const handleChange = (e) => {
            onChange(e);
        };

        const handleClear = () => {
            const syntheticEvent = {
                target: {
                    name: "birthday",
                    value: "",
                },
            };
            onChange(syntheticEvent);
        };

        return (
            <div>
                <label
                    htmlFor="birthday"
                    className="block text-sm font-medium text-stone-700 mb-1"
                >
                    Birthday
                </label>
                <div className="relative">
                    <input
                        ref={ref}
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={value}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600 appearance-none"
                        style={{
                            borderRadius:
                                "255px 15px 225px 15px/15px 225px 15px 255px",
                            paddingRight: value ? "2.5rem" : "0.75rem", // Add space for clear button when there's a value
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                        }}
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                            aria-label="Clear birthday"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        );
    }
);

BirthdaySelector.displayName = "BirthdaySelector";

export default BirthdaySelector;
