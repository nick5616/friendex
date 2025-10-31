import { forwardRef } from "react";

const NameSelector = forwardRef(({ value, onChange, required = true }, ref) => {
    return (
        <div>
            <label
                htmlFor="name"
                className="block text-sm font-medium text-stone-700 mb-1"
            >
                <span className="text-sm font-medium text-stone-700 mb-1">
                    Name{" "}
                </span>
                <span className="text-sm font-medium text-red-700 mb-1">*</span>
            </label>
            <input
                ref={ref}
                type="text"
                id="name"
                name="name"
                required={required}
                value={value}
                onChange={onChange}
                inputMode="text"
                enterKeyHint="next"
                className="w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                style={{
                    borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
                }}
            />
        </div>
    );
});

NameSelector.displayName = "NameSelector";

export default NameSelector;
