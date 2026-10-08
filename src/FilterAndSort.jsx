import { Search, X } from "lucide-react";

function FilterAndSort({
    sortBy,
    setSortBy,
    filterText,
    setFilterText,
    filterField,
    setFilterField,
    filteredCount,
    onClose,
}) {
    const selectClass =
        "px-2 py-1.5 border-2 border-stone-800 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 text-base";

    return (
        <section className="mx-3 mt-4 p-3 dex-card !p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                        type="search"
                        autoFocus
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        placeholder={`Search ${filterField}...`}
                        className="w-full pl-8 pr-3 py-1.5 border-2 border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 text-base"
                    />
                </div>
                <button
                    onClick={() => {
                        setFilterText("");
                        onClose();
                    }}
                    aria-label="Close search"
                    className="p-1.5"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
                <label className="flex items-center gap-1">
                    in
                    <select
                        value={filterField}
                        onChange={(e) => setFilterField(e.target.value)}
                        className={selectClass}
                    >
                        <option value="name">Name</option>
                        <option value="tags">Tags</option>
                        <option value="pronouns">Pronouns</option>
                        <option value="notes">Notes</option>
                    </select>
                </label>
                <label className="flex items-center gap-1">
                    sort
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={selectClass}
                    >
                        <option value="name">Name (A-Z)</option>
                        <option value="dex">Dex number</option>
                        <option value="hangout">Recently hung out</option>
                        <option value="age">Age (oldest first)</option>
                    </select>
                </label>
                <span className="ml-auto font-pixel text-[10px] text-stone-500">
                    {filteredCount} FOUND
                </span>
            </div>
        </section>
    );
}

export default FilterAndSort;
