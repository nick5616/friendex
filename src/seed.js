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
    {
        name: "Maxwell",
        pronouns: "he/him",
        profilePicture: generateAvatar("Maxwell"),
        tags: ["Work", "Board Games", "Music"],
        about: {
            description:
                "The one who always brings the best snacks to game night. Has an encyclopedic knowledge of grapefruit-flavored beverages.",
        },
    },
    {
        name: "Bobby Hill",
        pronouns: "he/him",
        profilePicture: generateAvatar("Bobby Hill"),
        tags: ["Work", "Board Games"],
        about: {
            description:
                "The one who always brings the best snacks to game night. Has an encyclopedic knowledge of grapefruit-flavored beverages.",
        },
    },
    {
        name: "Link",
        pronouns: "he/him",
        profilePicture: generateAvatar("Link"),
        tags: ["Adventure", "Gaming", "Hero"],
        about: {
            description:
                "The legendary hero of Hyrule. Quiet but incredibly brave, always ready to help those in need. Has a mysterious connection to the Triforce and an uncanny ability to find rupees in the most unexpected places.",
            interests: [
                "Sword Fighting",
                "Puzzle Solving",
                "Collecting",
                "Cooking",
            ],
            loveLanguages: ["Acts of Service", "Quality Time"],
        },
        keyInfo: {
            birthday: "Unknown (appears to be around 17-25)",
            howWeMet: "Met during a quest to save Hyrule from Ganon's evil.",
        },
        notes: "Speaks mostly in 'HYAH!' and 'HUT!' but is surprisingly eloquent when he does talk. Always carries a sword and shield.",
        createdAt: new Date("2023-01-01"),
    },
    {
        name: "Courage the Cowardly Dog",
        pronouns: "he/him",
        profilePicture: generateAvatar("Courage"),
        tags: ["Pet", "Adventure", "Animated"],
        about: {
            description:
                "A pink dog with a heart of gold but nerves of jelly. Despite being terrified of everything, he always finds the courage to protect his family from supernatural threats. Has a unique ability to communicate through subtitles.",
            interests: [
                "Protecting Family",
                "Hiding Under Beds",
                "Watching TV",
                "Avoiding Scary Things",
            ],
            loveLanguages: ["Acts of Service", "Physical Touch"],
        },
        keyInfo: {
            birthday: "Unknown (dog years)",
            howWeMet:
                "Found him wandering around Nowhere, Kansas. He adopted us!",
        },
        notes: "Gets scared by his own shadow but will face down demons for Muriel and Eustace. Makes the cutest 'Ooooh!' sounds.",
        createdAt: new Date("2023-01-02"),
    },
    {
        name: "Boosk",
        pronouns: "they/them",
        profilePicture: generateAvatar("Boosk"),
        tags: ["Gaming", "Tech", "Creative"],
        about: {
            description:
                "A digital artist and game developer with an obsession for retro aesthetics. Creates the most mesmerizing pixel art and has an encyclopedic knowledge of 8-bit sound design. Always has the coolest custom keycaps.",
            interests: [
                "Pixel Art",
                "Chiptune Music",
                "Retro Gaming",
                "Mechanical Keyboards",
            ],
            loveLanguages: ["Words of Affirmation", "Gift Giving"],
        },
        keyInfo: {
            birthday: "1995-03-14",
            howWeMet:
                "Met at a local game jam where they were demoing their latest pixel art game.",
        },
        notes: "Their Discord status is always 'Making bleeps and bloops'. Ask them about their latest keyboard build.",
        createdAt: new Date("2023-01-03"),
    },
    {
        name: "Dighead",
        pronouns: "he/him",
        profilePicture: generateAvatar("Dighead"),
        tags: ["Archaeology", "Adventure", "Academic"],
        about: {
            description:
                "A passionate archaeologist who spends more time in the field than in the classroom. Has discovered three lost civilizations and always has dirt under his fingernails. Surprisingly good at identifying pottery shards.",
            interests: [
                "Ancient History",
                "Field Work",
                "Mystery Solving",
                "Indiana Jones Movies",
            ],
            loveLanguages: ["Quality Time", "Acts of Service"],
        },
        keyInfo: {
            birthday: "1988-09-12",
            howWeMet:
                "Met during an archaeological dig in Peru. He was the one who found the hidden chamber.",
        },
        notes: "Always carries a trowel and a notebook. His idea of a fun weekend is cataloging artifacts.",
        createdAt: new Date("2023-01-04"),
    },
    {
        name: "Swampass",
        pronouns: "they/them",
        profilePicture: generateAvatar("Swampass"),
        tags: ["Nature", "Environmental", "Adventure"],
        about: {
            description:
                "An environmental activist with a deep connection to wetlands and swamps. Can identify any plant or animal by sound alone. Has the most calming presence and always smells like fresh earth and rain.",
            interests: [
                "Wetland Conservation",
                "Bird Watching",
                "Kayaking",
                "Photography",
            ],
            loveLanguages: ["Quality Time", "Physical Touch"],
        },
        keyInfo: {
            birthday: "1991-06-08",
            howWeMet:
                "Met during a volunteer cleanup at the local wetland preserve.",
        },
        notes: "Their car is always full of mud and field guides. They know every secret spot in the local swamps.",
        createdAt: new Date("2023-01-05"),
    },
    {
        name: "Dunko",
        pronouns: "he/him",
        profilePicture: generateAvatar("Dunko"),
        tags: ["Gaming", "Streaming", "Entertainment"],
        about: {
            description:
                "A professional gamer and streamer with an infectious laugh and terrible puns. Despite the name, he's actually quite intelligent and has a PhD in Computer Science. His streams are always chaotic but entertaining.",
            interests: [
                "Speedrunning",
                "Programming",
                "Stand-up Comedy",
                "Collecting Gaming Memorabilia",
            ],
            loveLanguages: ["Words of Affirmation", "Quality Time"],
        },
        keyInfo: {
            birthday: "1993-12-25",
            howWeMet:
                "Met through a mutual friend who introduced us at a gaming convention.",
        },
        notes: "His catchphrase is 'That's a dunko move!' Always has the latest gaming setup and knows every cheat code.",
        createdAt: new Date("2023-01-06"),
    },
    {
        name: "Clunk",
        pronouns: "they/them",
        profilePicture: generateAvatar("Clunk"),
        tags: ["Mechanical", "Engineering", "Creative"],
        about: {
            description:
                "A mechanical engineer who builds the most incredible contraptions out of scrap metal and spare parts. Their workshop is a wonderland of gears, springs, and mysterious devices that actually work. Has a pet robot named Sprocket.",
            interests: [
                "Robotics",
                "Steampunk",
                "Junk Sculpting",
                "Clockwork Mechanisms",
            ],
            loveLanguages: ["Acts of Service", "Gift Giving"],
        },
        keyInfo: {
            birthday: "1987-11-30",
            howWeMet:
                "Met at a maker fair where they were demonstrating their latest invention.",
        },
        notes: "Always has grease stains on their clothes and tools in their pockets. Their inventions are surprisingly practical.",
        createdAt: new Date("2023-01-07"),
    },
    {
        name: "EggyWeggyBfast",
        pronouns: "she/her",
        profilePicture: generateAvatar("EggyWeggyBfast"),
        tags: ["Food", "Cooking", "Morning Person"],
        about: {
            description:
                "A breakfast enthusiast and professional chef who believes the most important meal of the day deserves the most attention. Creates the most Instagram-worthy breakfast spreads and has a collection of vintage egg cups.",
            interests: [
                "Breakfast Recipes",
                "Food Photography",
                "Vintage Kitchenware",
                "Farmers Markets",
            ],
            loveLanguages: ["Acts of Service", "Gift Giving"],
        },
        keyInfo: {
            birthday: "1990-04-01",
            howWeMet:
                "Met at a farmers market where she was selling homemade granola and giving out free samples.",
        },
        notes: "Her Instagram is 90% breakfast photos. She can make the perfect poached egg every time.",
        createdAt: new Date("2023-01-08"),
    },
    {
        name: "Dolby][",
        pronouns: "they/them",
        profilePicture: generateAvatar("Dolby]["),
        tags: ["Music", "Audio", "Tech"],
        about: {
            description:
                "An audio engineer and music producer with an obsession for perfect sound quality. Has a home studio that would make professional musicians jealous and can identify any audio format by ear alone.",
            interests: [
                "Music Production",
                "Audio Equipment",
                "Vinyl Collecting",
                "Sound Design",
            ],
            loveLanguages: ["Quality Time", "Words of Affirmation"],
        },
        keyInfo: {
            birthday: "1989-07-22",
            howWeMet:
                "Met at a local music venue where they were doing sound for a friend's band.",
        },
        notes: "Their car has a custom sound system that costs more than the car itself. Always has the latest audio gear.",
        createdAt: new Date("2023-01-09"),
    },
    {
        name: "Strawberry",
        pronouns: "she/her",
        profilePicture: generateAvatar("Strawberry"),
        tags: ["Nature", "Gardening", "Sweet"],
        about: {
            description:
                "A master gardener with a particular love for berries and sweet fruits. Her garden is a paradise of strawberries, blueberries, and other delicious treats. Has the greenest thumb and the sweetest disposition.",
            interests: [
                "Organic Gardening",
                "Berry Picking",
                "Jam Making",
                "Bee Keeping",
            ],
            loveLanguages: ["Gift Giving", "Acts of Service"],
        },
        keyInfo: {
            birthday: "1992-05-15",
            howWeMet:
                "Met at a community garden where she was teaching a workshop on berry cultivation.",
        },
        notes: "Her homemade strawberry jam is legendary. She always has fresh berries to share and gardening tips to give.",
        createdAt: new Date("2023-01-10"),
    },
    {
        name: "Wunko",
        pronouns: "he/him",
        profilePicture: generateAvatar("Wunko"),
        tags: ["Gaming", "Collecting", "Nostalgic"],
        about: {
            description:
                "A retro gaming collector with an impressive collection of vintage consoles and games. Has a room dedicated to his collection and can tell you the history of any game from the 80s and 90s. Always has a new find to show off.",
            interests: [
                "Retro Gaming",
                "Game Collecting",
                "Console Modding",
                "Gaming History",
            ],
            loveLanguages: ["Quality Time", "Gift Giving"],
        },
        keyInfo: {
            birthday: "1985-08-18",
            howWeMet:
                "Met at a retro gaming convention where he was selling rare cartridges.",
        },
        notes: "His collection includes every console from Atari to modern systems. He can fix any broken controller.",
        createdAt: new Date("2023-01-11"),
    },
    {
        name: "Schteve",
        pronouns: "he/him",
        profilePicture: generateAvatar("Schteve"),
        tags: ["Tech", "Programming", "Quirky"],
        about: {
            description:
                "A software developer with a unique coding style and an even more unique personality. Writes the most efficient code but with the most creative variable names. Has a pet rock named 'Rocky' that he talks to during debugging sessions.",
            interests: [
                "Programming",
                "Algorithm Design",
                "Pet Rocks",
                "Dad Jokes",
            ],
            loveLanguages: ["Words of Affirmation", "Quality Time"],
        },
        keyInfo: {
            birthday: "1986-02-29",
            howWeMet:
                "Met at a coding bootcamp where he was the TA and I was struggling with recursion.",
        },
        notes: "His code comments are works of art. He can debug any problem by talking to Rocky. Always has a terrible pun ready.",
        createdAt: new Date("2023-01-12"),
    },
    {
        name: "Fuckass",
        pronouns: "they/them",
        profilePicture: generateAvatar("Fuckass"),
        tags: ["Neighborhood", "Skate Crew", "Pranks"],
        about: {
            description:
                "Local skatepark legend with a heart of gold and a chaotic streak. Jumps stairs by day, helps neighbors carry groceries by night.",
            interests: [
                "Skateboarding",
                "DIY Ramps",
                "Thrift Stores",
                "Street Art",
            ],
            loveLanguages: ["Acts of Service", "Quality Time"],
        },
        keyInfo: {
            birthday: "1999-06-13",
            howWeMet:
                "You spotted their kickflip over the park bench and applauded.",
        },
        notes: "Despite the name, incredibly polite to baristas. Carries band-aids for everyone.",
        createdAt: new Date("2023-02-01"),
    },
    {
        name: "Dickhead",
        pronouns: "he/him",
        profilePicture: generateAvatar("Dickhead"),
        tags: ["Gym", "Rival-turned-friend", "Competitive"],
        about: {
            description:
                "Blunt, loud, and surprisingly dependable. Talks trash during pickup games but buys smoothies for the whole team afterwards.",
            interests: [
                "Basketball",
                "Powerlifting",
                "Meal Prep",
                "Trash Talk (Friendly)",
            ],
            loveLanguages: ["Gift Giving", "Words of Affirmation"],
        },
        keyInfo: {
            birthday: "1991-10-05",
            howWeMet:
                "Argued over a foul call, then became weekly court buddies.",
        },
        notes: "Has a soft spot for puppies and motivational quotes.",
        createdAt: new Date("2023-02-02"),
    },
    {
        name: "Wemby",
        pronouns: "he/him",
        profilePicture: generateAvatar("Wemby"),
        tags: ["Sports", "Mentor", "Community"],
        about: {
            description:
                "Towering gentle giant who coaches youth hoops on weekends. Reads poetry to center himself before games.",
            interests: [
                "Basketball Fundamentals",
                "Yoga",
                "Poetry",
                "Smoothies",
            ],
            loveLanguages: ["Quality Time", "Acts of Service"],
        },
        keyInfo: {
            birthday: "2004-01-04",
            howWeMet: "Volunteering at the community center skills clinic.",
        },
        notes: "Keeps a tiny notebook of kind things kids say.",
        createdAt: new Date("2023-02-03"),
    },
    {
        name: "Subaru Forrester",
        pronouns: "she/her",
        profilePicture: generateAvatar("Subaru Forrester"),
        tags: ["Outdoors", "Road Trips", "Rescue Dogs"],
        about: {
            description:
                "Trail guide who knows every fire road and hidden overlook. Car smells faintly of pine and wet dog, in a good way.",
            interests: [
                "Trail Mapping",
                "Campfire Cooking",
                "Geocaching",
                "Dog Rescue",
            ],
            loveLanguages: ["Acts of Service", "Physical Touch"],
        },
        keyInfo: {
            birthday: "1989-03-09",
            howWeMet: "Gave you a lift when your tire blew on a dirt road.",
        },
        notes: "Carries a trunk kit that can fix anything: duct tape, snacks, headlamp.",
        createdAt: new Date("2023-02-04"),
    },
    {
        name: "Digby",
        pronouns: "they/them",
        profilePicture: generateAvatar("Digby"),
        tags: ["Library", "Quiet", "Cozy"],
        about: {
            description:
                "Zine librarian who curates the comfiest reading nooks. Communicates in whispers and perfect tea blends.",
            interests: ["Zines", "Herbal Tea", "Bookbinding", "Cat Naps"],
            loveLanguages: ["Quality Time", "Words of Affirmation"],
        },
        keyInfo: {
            birthday: "1993-12-01",
            howWeMet:
                "You asked for a recommendation and left with a stack of zines.",
        },
        notes: "Has a stamp that says ‘returned with love’.",
        createdAt: new Date("2023-02-05"),
    },
    {
        name: "Loser",
        pronouns: "she/her",
        profilePicture: generateAvatar("Loser"),
        tags: ["Punk Band", "Tour Van", "DIY"],
        about: {
            description:
                "Frontwoman of a scrappy punk trio. Calls herself the name before anyone else can—owns it with a grin.",
            interests: [
                "Songwriting",
                "Screen Printing",
                "House Shows",
                "Crowd Surfing",
            ],
            loveLanguages: ["Gift Giving", "Quality Time"],
        },
        keyInfo: {
            birthday: "1997-07-07",
            howWeMet:
                "Met at a basement show; you helped coil cables after the set.",
        },
        notes: "Signs setlists for kids after every show.",
        createdAt: new Date("2023-02-06"),
    },
    {
        name: "Big Nerd",
        pronouns: "he/him",
        profilePicture: generateAvatar("Big Nerd"),
        tags: ["Board Games", "History Buff", "Gentle Giant"],
        about: {
            description:
                "Trivia night ringer who brings homemade pretzels for the table. Knows way too much about ancient Rome and snack pairings.",
            interests: [
                "Eurogames",
                "Public Transit Maps",
                "Baking Pretzels",
                "Antiquity",
            ],
            loveLanguages: ["Acts of Service", "Words of Affirmation"],
        },
        keyInfo: {
            birthday: "1990-09-21",
            howWeMet: "Joined your board game meetup and never left.",
        },
        notes: "Carries extra sleeves for everyone’s cards.",
        createdAt: new Date("2023-02-07"),
    },
    {
        name: "Don Cheedle",
        pronouns: "he/him",
        profilePicture: generateAvatar("Don Cheedle"),
        tags: ["Jazz", "Local Legend", "Late Night"],
        about: {
            description:
                "Trumpeter who closes the Tuesday jam session with a ballad that makes the bar go silent. Tells stories like solos—patient and warm.",
            interests: [
                "Hard Bop",
                "Vinyl Hunting",
                "Night Drives",
                "Black Coffee",
            ],
            loveLanguages: ["Quality Time", "Words of Affirmation"],
        },
        keyInfo: {
            birthday: "1982-05-02",
            howWeMet:
                "You lent him a spare mute when his went missing mid-set.",
        },
        notes: "Keeps a lucky subway token in his case.",
        createdAt: new Date("2023-02-08"),
    },
    {
        name: "Space Alien",
        pronouns: "they/them",
        profilePicture: generateAvatar("Space Alien"),
        tags: ["Weird", "Cosmic", "Neighbor"],
        about: {
            description:
                "Mysterious tenant from Apartment 4B who waters plants at precisely 03:33. Claims to be ‘between galaxies’ and makes excellent salsa.",
            interests: [
                "Star Charts",
                "Houseplants",
                "Unexplainable Phenomena",
                "Salsas",
            ],
            loveLanguages: ["Gift Giving", "Quality Time"],
        },
        keyInfo: {
            birthday: "Unknown (cycles)",
            howWeMet:
                "Left a note: ‘Exchange: basil for comet dust?’ on your door.",
        },
        notes: "Speaks in plural sometimes. Always returns Tupperware.",
        createdAt: new Date("2023-02-09"),
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
