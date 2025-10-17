import Dexie from "dexie";

export const db = new Dexie("friendexDB");

db.version(1).stores({
    // '++id' is an auto-incrementing primary key
    // 'name' is an indexed field for fast lookups/sorting
    // '*tags' is a multi-entry index, allowing searches by tag
    friends: "++id, name, *tags",
});

// Add tags table in version 2
db.version(2)
    .stores({
        friends: "++id, name, *tags",
        tags: "name, usageCount, lastUsed, createdAt",
    })
    .upgrade(async (tx) => {
        // Add default tags when upgrading to version 2
        const defaultTags = [
            {
                name: "Work",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "College",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "High School",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Family",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Neighbor",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Gaming",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Sports",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Music",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Art",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Travel",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Childhood",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Online",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
        ];

        await tx.tags.bulkAdd(defaultTags);
    });

// Add interests table in version 3
db.version(3)
    .stores({
        friends: "++id, name, *tags",
        tags: "name, usageCount, lastUsed, createdAt",
        interests: "name, usageCount, lastUsed, createdAt",
    })
    .upgrade(async (tx) => {
        // Add default interests when upgrading to version 3
        const defaultInterests = [
            {
                name: "Gaming",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Sports",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Music",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Art",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Travel",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Reading",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Cooking",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Photography",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Movies",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Fitness",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Technology",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Dancing",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
        ];

        await tx.interests.bulkAdd(defaultInterests);
    });
