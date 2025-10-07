// src/seed.js
import { db } from "./db";

// A utility to generate a simple, colorful SVG avatar as a Base64 data URL
const generateAvatar = (name) => {
    const hash = name
        .split("")
        .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const colors = [
        "#f59e0b",
        "#ef4444",
        "#10b981",
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
    ];
    const color = colors[Math.abs(hash) % colors.length];
    const initial = name.charAt(0).toUpperCase();

    const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color}" />
      <text x="50" y="50" font-family="Arial" font-size="50" fill="#fff" text-anchor="middle" dy=".3em">${initial}</text>
    </svg>
  `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const mockFriends = [
    {
        name: "Pamplemousse",
        pronouns: "they/them",
        profilePicture: generateAvatar("Pamplemousse"),
        tags: ["Work", "Board Games"],
        about: {
            description:
                "The one who always brings the best snacks to game night. Has an encyclopedic knowledge of grapefruit-flavored beverages.",
            interests: ["Indie Comics", "Baking Sourdough", "Vintage Synths"],
            loveLanguages: ["Quality Time", "Gift Giving"],
        },
        keyInfo: {
            birthday: "1994-07-15",
            howWeMet: "Through a mutual friend at a board game cafe.",
        },
        notes: "Loves citrus-themed everything. Great person to ask for music recommendations.",
        createdAt: new Date("2022-01-10"),
    },
    {
        name: "Chef Big Dog",
        pronouns: "he/him",
        profilePicture: generateAvatar("Chef Big Dog"),
        tags: ["College Friend", "Cooking"],
        about: {
            description:
                "An absolute wizard in the kitchen. Can make a gourmet meal out of instant noodles and a prayer. Surprisingly good at karaoke.",
            interests: ["Grilling", "80s Action Movies", "Fishing"],
            loveLanguages: ["Acts of Service", "Words of Affirmation"],
        },
        keyInfo: {
            birthday: "1992-11-02",
            howWeMet: "Lived on the same floor in the dorms freshman year.",
        },
        notes: "His secret ingredient is always more butter. Ask him about his trip to Thailand.",
        createdAt: new Date("2018-09-01"),
    },
    {
        name: "Apple Bee",
        pronouns: "she/her",
        profilePicture: generateAvatar("Apple Bee"),
        tags: ["Hiking Group", "Tech"],
        about: {
            description:
                "The most organized person I know. Her hiking backpack has a pocket for everything. Writes incredibly clean code.",
            interests: ["Mountaineering", "Mechanical Keyboards", "Origami"],
            loveLanguages: ["Quality Time"],
        },
        keyInfo: {
            birthday: "1996-04-22",
            howWeMet: "At a local tech meetup.",
        },
        notes: "Allergic to cashews. Remind me to ask her about the new keyboard build.",
        createdAt: new Date("2023-03-20"),
    },
];

// This function checks if the DB is empty and, if so, adds the mock data.
export const seedDatabase = async () => {
    const friendCount = await db.friends.count();
    if (friendCount === 0) {
        console.log("Database is empty, seeding with mock friends...");
        await db.friends.bulkAdd(mockFriends);
        console.log("Seeding complete!");
    } else {
        console.log("Database already contains data, skipping seed.");
    }
};
