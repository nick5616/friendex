import React from "react";

function NotesSelector({ value, onChange }) {
    return (
        <div>
            <label
                htmlFor="notes"
                className="block text-md font-medium text-stone-700 mb-1"
            >
                Additional Notes
            </label>
            <textarea
                id="notes"
                name="notes"
                value={value}
                onChange={onChange}
                rows={3}
                placeholder="Any additional information you'd like to remember..."
                className="w-full px-3 py-2 border-2 border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-600"
                style={{
                    borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
                }}
            />
        </div>
    );
}

export default NotesSelector;
