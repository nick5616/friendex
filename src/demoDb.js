import Dexie from "dexie";

export const demoDb = new Dexie("friendexDemoDB");

demoDb.version(1).stores({
    // '++id' is an auto-incrementing primary key
    // 'name' is an indexed field for fast lookups/sorting
    // '*tags' is a multi-entry index, allowing searches by tag
    friends: "++id, name, *tags",
});
