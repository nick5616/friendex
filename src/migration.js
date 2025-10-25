// Migration script to convert comma-separated strings to arrays
// This runs once on first page load to fix data format inconsistencies

const MIGRATION_KEY = "friendex_migration_v1_completed";

export async function runMigration() {
    // Check if migration has already been completed
    if (localStorage.getItem(MIGRATION_KEY)) {
        console.log("Migration already completed, skipping...");
        return;
    }

    console.log("Running data migration...");

    try {
        // Import the database instances
        const { db } = await import("./db");
        const { demoDb } = await import("./demoDb");

        // Run migration on both databases
        await migrateDatabase(db, "main");
        await migrateDatabase(demoDb, "demo");

        // Mark migration as completed
        localStorage.setItem(MIGRATION_KEY, "true");
        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
        // Don't mark as completed if it failed
    }
}

async function migrateDatabase(database, dbName) {
    if (!database) {
        console.log(`No ${dbName} database found, skipping...`);
        return;
    }

    try {
        // Get all friends from the database
        const friends = await database.friends.toArray();
        console.log(`Found ${friends.length} friends in ${dbName} database`);

        let migratedCount = 0;

        for (const friend of friends) {
            let needsUpdate = false;
            const updates = {};

            // Check and migrate tags
            if (friend.tags && typeof friend.tags === "string") {
                console.log(
                    `Migrating tags for ${friend.name}: "${friend.tags}"`
                );
                updates.tags = friend.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag);
                needsUpdate = true;
            }

            // Check and migrate interests
            if (
                friend.about?.interests &&
                typeof friend.about.interests === "string"
            ) {
                console.log(
                    `Migrating interests for ${friend.name}: "${friend.about.interests}"`
                );
                updates.about = {
                    ...friend.about,
                    interests: friend.about.interests
                        .split(",")
                        .map((interest) => interest.trim())
                        .filter((interest) => interest),
                };
                needsUpdate = true;
            }

            // Update the friend if migration is needed
            if (needsUpdate) {
                await database.friends.update(friend.id, updates);
                migratedCount++;
                console.log(`Updated ${friend.name} in ${dbName} database`);
            }
        }

        console.log(
            `Migration completed for ${dbName} database: ${migratedCount} friends updated`
        );
    } catch (error) {
        console.error(`Error migrating ${dbName} database:`, error);
    }
}
