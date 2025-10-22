import { forwardRef } from "react";

const DescriptionSelector = forwardRef(
    (
        {
            value,
            onChange,
            required = false,
            placeholder = "About your friend...",
        },
        ref
    ) => {
        return (
            <div>
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-stone-700 mb-1"
                >
                    Description
                </label>
                <textarea
                    ref={ref}
                    id="description"
                    name="description"
                    value={value}
                    onChange={onChange}
                    rows={3}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                    style={{
                        borderRadius:
                            "255px 15px 225px 15px/15px 225px 15px 255px",
                        letterSpacing: "0.5px",
                    }}
                />
            </div>
        );
    }
);

DescriptionSelector.displayName = "DescriptionSelector";

export default DescriptionSelector;
