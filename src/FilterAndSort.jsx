import { useState } from "react";

function FilterAndSort({
    sortBy,
    setSortBy,
    filterText,
    setFilterText,
    filterField,
    setFilterField,
    filteredCount,
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="p-4 mx-2 mb-4 bg-amber-100 card-hand-drawn">
            {/* Header - always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-stone-900 hover:text-stone-700 transition-colors"
            >
                <h2 className="text-lg font-semibold">Filter and Sort</h2>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className={`w-5 h-5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                    }`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                </svg>
            </button>

            {/* Collapsible Content */}
            {isExpanded && (
                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-row justify-between">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-stone-700">
                                Sort:
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm"
                            >
                                <option value="none">None</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="age">Age (Oldest First)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-row gap-2">
                        <div className="flex items-center gap-2">
                            <select
                                value={filterField}
                                onChange={(e) => setFilterField(e.target.value)}
                                className="px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm"
                            >
                                <option value="name">Name</option>
                                <option value="tags">Tags</option>
                                <option value="pronouns">Pronouns</option>
                                <option value="notes">Notes</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder={`Search ${filterField}...`}
                                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-500 text-sm"
                            />
                        </div>

                        {filterText && (
                            <button
                                onClick={() => setFilterText("")}
                                className="px-3 py-2 bg-stone-700 text-white rounded-md hover:bg-stone-600 transition-colors text-sm font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="text-sm text-stone-600">
                        {filteredCount} friend{filteredCount !== 1 ? "s" : ""}
                    </div>
                </div>
            )}
        </section>
    );
}

export default FilterAndSort;
