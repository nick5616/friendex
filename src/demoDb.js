import Dexie from "dexie";

export const demoDb = new Dexie("friendexDemoDB");

demoDb.version(1).stores({
    // '++id' is an auto-incrementing primary key
    // 'name' is an indexed field for fast lookups/sorting
    // '*tags' is a multi-entry index, allowing searches by tag
    friends: "++id, name, *tags",
});

// Add tags table in version 2
demoDb
    .version(2)
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
demoDb
    .version(3)
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

// Add relationships table in version 4
demoDb
    .version(4)
    .stores({
        friends: "++id, name, *tags",
        tags: "name, usageCount, lastUsed, createdAt",
        interests: "name, usageCount, lastUsed, createdAt",
        relationships: "name, usageCount, lastUsed, createdAt",
    })
    .upgrade(async (tx) => {
        // Add default relationships when upgrading to version 4
        const defaultRelationships = [
            // Family relationships
            {
                name: "Sister",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Brother",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Mother",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Father",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Son",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Daughter",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            // Romantic relationships
            {
                name: "Boyfriend",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Girlfriend",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Partner",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Fiance",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Husband",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Wife",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            // Friendly relationships
            {
                name: "Colleague",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Classmate",
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
                name: "Coworker",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Acquaintance",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Friend",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Good Friend",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Bestie",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
            {
                name: "Bestest Friend",
                usageCount: 0,
                lastUsed: new Date(),
                createdAt: new Date(),
            },
        ];

        await tx.relationships.bulkAdd(defaultRelationships);
    });
