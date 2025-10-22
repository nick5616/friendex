import React from "react";

function HowWeMetSelector({ value, onChange }) {
    return (
        <div>
            <label
                htmlFor="howWeMet"
                className="block text-md font-medium text-stone-700 mb-1"
            >
                How We Met
            </label>
            <textarea
                id="howWeMet"
                name="howWeMet"
                value={value}
                onChange={onChange}
                rows={2}
                placeholder="Tell the story of how you met..."
                className="w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                style={{
                    borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
                }}
            />
        </div>
    );
}

export default HowWeMetSelector;
