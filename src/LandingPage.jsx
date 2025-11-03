import React, { useState, useEffect } from "react";
import mainFriendexInterfaceImage from "./assets/images/screenshots/mainFriendexInterface.png";
import friendDetailsTop from "./assets/images/screenshots/friendDetailsTop.png";
import friendDetailsBottom from "./assets/images/screenshots/friedDetailsBottom.png";
import useIsMobile from "./hooks/useIsMobile";

function LandingPage({ onLaunchApp }) {
    const isMobile = useIsMobile();
    const [scrollY, setScrollY] = useState(0);
    const [currentWord, setCurrentWord] = useState(0);
    const [particles, setParticles] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [wordWidth, setWordWidth] = useState(0);

    const words = [
        "Remember",
        "Know",
        "Love",
        "Cherish",
        "Appreciate",
        "Value",
        "Catch",
    ];

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Measure word width and animate
    useEffect(() => {
        const measureWord = () => {
            const tempElement = document.createElement("span");
            tempElement.style.visibility = "hidden";
            tempElement.style.position = "absolute";
            tempElement.style.fontSize = isMobile ? "2rem" : "4rem";
            tempElement.style.fontWeight = "bold";
            tempElement.style.whiteSpace = "nowrap";
            tempElement.style.fontFamily = "inherit";
            tempElement.textContent = words[currentWord];
            document.body.appendChild(tempElement);

            const width = tempElement.offsetWidth;
            document.body.removeChild(tempElement);

            // Use exact width to prevent wrapping
            setWordWidth(width);
            setIsAnimating(false);
        };

        measureWord();
    }, [currentWord, isMobile]);

    // Generate subtle floating particles
    useEffect(() => {
        const particleCount = isMobile ? 15 : 25;
        const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 5,
            color: Math.random() > 0.5 ? "bg-amber-300" : "bg-amber-600",
            className: "absolute rounded-full opacity-20",
        }));
        setParticles(newParticles);
    }, []);

    // Calculate Pokéball transformation based on scroll
    const pokeballScale = 1 + scrollY / 300;
    const pokeballOpacity = Math.max(0.2, 0.2 + scrollY / 400 - 0.2);
    const pokeballTransform = `scale(${pokeballScale}) translateY(${
        scrollY * 0.3
    }px)`;

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Subtle floating particles */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full bg-amber-300 opacity-20"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animation: `float ${particle.duration}s ease-in-out infinite`,
                            animationDelay: `${particle.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Animated Pokéball */}
            <div
                className="fixed pointer-events-none z-0 transition-all duration-100"
                style={{
                    top: isMobile ? "60vh" : "50vh",
                    left: "50%",
                    transform: `translate(-50%, -50%) ${pokeballTransform}`,
                    opacity: pokeballOpacity,
                }}
            >
                <img
                    src="/icons/android-chrome512x512.png?v=2"
                    alt=""
                    className={
                        isMobile
                            ? "w-[90vw] h-[90vw]"
                            : "w-[60vw] h-[60vw] max-w-[600px] max-h-[600px]"
                    }
                    style={{ objectFit: "contain" }}
                />
            </div>

            <div className="relative z-10 px-4 md:px-8 py-8 flex flex-col items-center">
                <main className="max-w-6xl w-full">
                    {/* Hero Section */}
                    <section className="text-center min-h-screen flex flex-col justify-center items-center -mt-16">
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-8xl font-bold text-stone-900 leading-tight">
                                A Pokedex for
                                <br />
                                your friends.
                            </h1>

                            <div className="text-2xl md:text-4xl font-bold h-12 flex items-center justify-center cursor-default card-hand-drawn">
                                <span className="inline-block">Gotta</span>
                                <div
                                    className="inline-block text-red-500 overflow-hidden"
                                    style={{
                                        width: `${wordWidth}px`,
                                        transition:
                                            "width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                        opacity: isAnimating ? 0.7 : 1,
                                    }}
                                >
                                    <span
                                        key={currentWord}
                                        className="inline-block animate-[fadeIn_0.5s_ease-in-out] whitespace-nowrap"
                                    >
                                        {words[currentWord]}
                                    </span>
                                </div>
                                <span className="inline-block">'em all!</span>
                            </div>

                            <p className="text-xl md:text-2xl text-stone-900 max-w-2xl mx-auto mt-6">
                                Your private, tactile space to remember the
                                details that matter and strengthen your
                                connections.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <div className="card-hand-drawn bg-green-50 px-4 py-2 border-2 border-green-300">
                                    <p className="text-sm md:text-base font-bold text-green-800">
                                        ✓ No account required
                                    </p>
                                </div>
                                <div className="card-hand-drawn bg-blue-50 px-4 py-2 border-2 border-blue-300">
                                    <p className="text-sm md:text-base font-bold text-blue-800">
                                        🔒 100% private
                                    </p>
                                </div>
                                <div className="card-hand-drawn bg-amber-50 px-4 py-2 border-2 border-amber-300">
                                    <p className="text-sm md:text-base font-bold text-amber-800">
                                        📱 Works offline
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onLaunchApp}
                                className="btn-hand-drawn btn-primary text-2xl md:text-3xl px-10 py-4 mt-8 border-2"
                            >
                                Open Your Friendex
                            </button>

                            <p className="text-stone-500 mt-3 text-lg">
                                Free to start, private by default.
                            </p>
                        </div>
                    </section>

                    {/* Social Proof - Prominent ADHD Testimonial */}
                    <section className="text-center py-8 mb-12">
                        <div className="card-hand-drawn bg-amber-50 p-6 md:p-8 max-w-3xl mx-auto border-2 border-amber-300">
                            <p className="text-xl md:text-2xl text-stone-800 font-medium italic mb-4">
                                "Finally, a way to remember my friends exist! My
                                ADHD brain loves this. I can actually see who I
                                can reach out to instead of forgetting they
                                exist."
                            </p>
                            <p className="text-stone-600 font-bold text-lg">
                                — Beta User with ADHD
                            </p>
                        </div>
                    </section>

                    {/* How It Works Section */}
                    <section className="mt-16 mb-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-stone-900">
                            How It Works
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <div className="card-hand-drawn overflow-hidden relative bg-amber-100">
                                <div className="flex flex-col justify-center text-8xl opacity-30 absolute right-[-20px] top-[35px]">
                                    📇
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-stone-900">
                                    Create Entries
                                </h3>
                                <p className="text-black text-lg">
                                    Add people to your Friendex with their name,
                                    photo, and any details you want to remember
                                    about them.
                                </p>
                            </div>

                            <div className="card-hand-drawn overflow-hidden relative bg-amber-100">
                                <div
                                    className="flex flex-col justify-center text-8xl opacity-40 absolute right-[-20px] top-[35px]"
                                    style={{ transform: "scaleX(-1)" }}
                                >
                                    ✏️
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-stone-900">
                                    Track Details
                                </h3>
                                <p className="text-stone-900 text-lg">
                                    Log conversations, interests, important
                                    dates, and anything else that helps you stay
                                    connected.
                                </p>
                            </div>
                            {/* TODO: Add share profiles feature */}
                            {/* <div className="card-hand-drawn overflow-hidden relative">
                                <div className="flex flex-col justify-center text-8xl opacity-40 absolute right-[-20px] top-[35px]">
                                    📱
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-stone-900">
                                    Share Profiles
                                </h3>
                                <p className="text-stone-800">
                                    Generate a QR code to easily exchange
                                    contact info and add new friends to your
                                    index.
                                </p>
                            </div> */}

                            <div className="card-hand-drawn overflow-hidden relative bg-amber-100">
                                <div className="flex flex-col justify-center text-8xl opacity-30 absolute right-[-20px] top-[35px]">
                                    💝
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-stone-900">
                                    Stay Connected
                                </h3>
                                <p className="text-stone-900 text-lg ">
                                    Browse your Friendex regularly to remind
                                    yourself who to reach out to and strengthen
                                    your bonds.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Perfect For Section */}
                    <section className="py-12 mb-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-stone-900">
                            Perfect For
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            <div className="card-hand-drawn overflow-hidden relative bg-amber-100 p-6">
                                <h3 className="text-2xl font-bold mb-3 text-stone-900">
                                    🧠 People with ADHD
                                </h3>
                                <p className="text-stone-700 text-lg">
                                    Beat object permanence issues. Friendex acts
                                    as your external memory, so you never forget
                                    your friends exist or lose track of who you
                                    can reach out to.
                                </p>
                            </div>

                            <div className="card-hand-drawn overflow-hidden relative bg-amber-100 p-6">
                                <h3 className="text-2xl font-bold mb-3 text-stone-900">
                                    😌 Socially Anxious & Introverted
                                </h3>
                                <p className="text-stone-700 text-lg">
                                    Reduce overwhelm and build intentional
                                    connections. Keep track of conversation
                                    topics, interests, and meaningful details
                                    that help you feel more confident reaching
                                    out.
                                </p>
                            </div>

                            <div className="card-hand-drawn overflow-hidden relative bg-amber-100 p-6">
                                <h3 className="text-2xl font-bold mb-3 text-stone-900">
                                    💼 Busy Professionals
                                </h3>
                                <p className="text-stone-700 text-lg">
                                    Maintain relationships without guilt. Store
                                    birthdays, gift ideas, and important dates
                                    so you can be thoughtful even when life gets
                                    hectic.
                                </p>
                            </div>

                            <div className="card-hand-drawn overflow-hidden relative bg-amber-100 p-6">
                                <h3 className="text-2xl font-bold mb-3 text-stone-900">
                                    💝 Anyone Wanting to Be a Better Friend
                                </h3>
                                <p className="text-stone-700 text-lg">
                                    Remember allergies, pet peeves, inside
                                    jokes, and what you last talked about. Show
                                    your friends you care by remembering the
                                    details that matter to them.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Pain Points Section */}
                    <section className="py-12 mb-8">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-stone-900">
                                Tired of These Problems?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="card-hand-drawn bg-red-50 p-6 border-2 border-red-200">
                                    <p className="text-lg text-stone-800 font-medium">
                                        Forgot someone's birthday again?
                                    </p>
                                </div>
                                <div className="card-hand-drawn bg-red-50 p-6 border-2 border-red-200">
                                    <p className="text-lg text-stone-800 font-medium">
                                        Struggling to remember who you can reach
                                        out to?
                                    </p>
                                </div>
                                <div className="card-hand-drawn bg-red-50 p-6 border-2 border-red-200">
                                    <p className="text-lg text-stone-800 font-medium">
                                        Want to be more thoughtful but don't
                                        know where to start?
                                    </p>
                                </div>
                            </div>
                            <p className="text-center text-xl text-stone-700 mt-8 font-medium">
                                Friendex helps you solve all of these.
                            </p>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="py-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-stone-900">
                            Why Friendex?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-12">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-full aspect-square max-w-xs card-hand-drawn flex items-center justify-center bg-stone-100 mb-4">
                                    <img
                                        src="/graphics/undraw_ideas-flow_lwpa.svg"
                                        alt="Problem Solving"
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-stone-900">
                                    Beat Object Permanence
                                </h3>
                                <p className="text-lg text-stone-700">
                                    Friendex acts as your external memory. See
                                    all your people in one place and never
                                    forget who you can reach out to.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-full aspect-square max-w-xs card-hand-drawn flex items-center justify-center bg-stone-100 mb-4">
                                    <img
                                        src="/graphics/undraw_images_v4j9.svg"
                                        alt="Ideas Flow"
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-stone-900">
                                    Remember the Details
                                </h3>
                                <p className="text-lg text-stone-700">
                                    Keep track of birthdays, gift ideas,
                                    conversation starters, inside jokes, and
                                    what you last talked about. Show them you
                                    care.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-full aspect-square max-w-xs card-hand-drawn flex items-center justify-center bg-stone-100 mb-4">
                                    <img
                                        src="/graphics/undraw_young-and-happy_ihtu.svg"
                                        alt="Joyride"
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-stone-900">
                                    A Joy to Use
                                </h3>
                                <p className="text-lg text-stone-700">
                                    A fun, tactile rolodex interface that makes
                                    browsing your connections feel delightful,
                                    not like a chore.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* App Preview Section */}
                    <section className="py-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-stone-900">
                            See It In Action
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            <div className="aspect-[9/16] md:aspect-video flex items-center justify-center card-hand-drawn bg-amber-50 w-fit py-2 px-0">
                                <img
                                    src={mainFriendexInterfaceImage}
                                    alt="Main Friendex Interface"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Screenshot placeholder 2 */}
                            <div className="card-hand-drawn aspect-[9/16] md:aspect-video flex items-center justify-center bg-stone-100">
                                <div className="text-center p-8">
                                    <p className="text-stone-400 text-lg">
                                        👤 Friend Entry View
                                    </p>
                                    <p className="text-stone-400 text-sm mt-2">
                                        <img
                                            src={friendDetailsBottom}
                                            alt="Friend Details Bottom"
                                            className="w-full h-full object-contain"
                                        />
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* GIF placeholder */}
                        <div className="card-hand-drawn aspect-[9/16] md:aspect-video flex items-center justify-center bg-stone-100">
                            <div className="text-center p-8">
                                <p className="text-stone-400 text-xl">
                                    🎬 Interactive Demo
                                </p>
                                <img
                                    src={friendDetailsTop}
                                    alt="Friend Details Top"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Testimonial Section */}
                    <section className="mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-stone-900">
                            What People Are Saying
                        </h2>

                        <div className="max-w-3xl mx-auto space-y-6">
                            {/* Testimonial 1 - ADHD */}
                            <div className="muted-card-hand-drawn">
                                <p className="text-lg text-stone-700 italic mb-4">
                                    "As someone with ADHD, I genuinely forget my
                                    friends exist sometimes. Friendex helps me
                                    remember I have people who care about me and
                                    that I can reach out to. It's like having an
                                    external brain for relationships."
                                </p>
                                <p className="text-stone-600 font-bold">
                                    — Beta User with ADHD
                                </p>
                            </div>

                            {/* Testimonial 2 - Social Anxiety */}
                            <div className="muted-card-hand-drawn">
                                <p className="text-lg text-stone-700 italic mb-4">
                                    "As an introvert, I struggle with
                                    maintaining friendships. Friendex helps me
                                    remember conversation topics and interests,
                                    so I actually have something meaningful to
                                    say when I reach out. No more awkward 'hey,
                                    how are you?' messages."
                                </p>
                                <p className="text-stone-600 font-bold">
                                    — Beta User
                                </p>
                            </div>

                            {/* Testimonial 3 - Thoughtful Friend */}
                            <div className="muted-card-hand-drawn">
                                <p className="text-lg text-stone-700 italic mb-4">
                                    "I can finally be the friend I want to be!
                                    With Friendex, I remember birthdays, gift
                                    ideas, allergies, and what we last talked
                                    about. My friends have noticed I'm more
                                    thoughtful, and I feel better about myself
                                    too."
                                </p>
                                <p className="text-stone-600 font-bold">
                                    — Beta User
                                </p>
                            </div>

                            {/* Testimonial 4 - Busy Professional */}
                            <div className="muted-card-hand-drawn">
                                <p className="text-lg text-stone-700 italic mb-4">
                                    "Between work and life, I kept forgetting to
                                    reach out to friends. Now I can quickly see
                                    who I haven't talked to in a while and what
                                    they're interested in. It's helped me
                                    maintain friendships I was worried I'd
                                    lose."
                                </p>
                                <p className="text-stone-600 font-bold">
                                    — Beta User
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Privacy Section */}
                    <section className="py-16 mb-12">
                        <div className="card-hand-drawn p-8 md:p-12 text-center">
                            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6">
                                Private by Default
                                <br />
                                You're in Control
                            </h2>
                            <p className="text-xl text-stone-700 max-w-3xl mx-auto leading-relaxed">
                                We believe you should own your data. Friendex
                                runs entirely on your device and works
                                completely offline. Your private information is
                                never uploaded, tracked, or shared—your data
                                never leaves your device.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🔒</div>
                                    <p className="font-bold text-stone-900">
                                        No Tracking
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        We don't track you or your data
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📱</div>
                                    <p className="font-bold text-stone-900">
                                        Works Offline
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        All data stored locally on your device
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">✉️</div>
                                    <p className="font-bold text-stone-900">
                                        No Signup
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        Start using immediately, no account
                                        needed
                                    </p>
                                </div>
                            </div>
                            <p className="text-lg text-stone-600 max-w-3xl mx-auto mt-8 leading-relaxed">
                                Want to access your Friendex across devices?
                                We're building an optional, secure cloud sync
                                feature. You choose what's right for you.
                            </p>
                        </div>
                    </section>

                    {/* Final CTA */}
                    <section className="text-center py-16">
                        <h2 className="text-4xl md:text-6xl font-bold text-stone-900 mb-4">
                            Ready to connect?
                        </h2>
                        <p className="text-xl text-stone-600 mb-6 max-w-2xl mx-auto">
                            Start building your Friendex today. No signup
                            required.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            <span className="text-sm text-stone-600 font-medium">
                                ✓ No account required
                            </span>
                            <span className="text-stone-400">•</span>
                            <span className="text-sm text-stone-600 font-medium">
                                🔒 100% private
                            </span>
                            <span className="text-stone-400">•</span>
                            <span className="text-sm text-stone-600 font-medium">
                                📱 Works offline
                            </span>
                        </div>
                        <button
                            onClick={onLaunchApp}
                            className="btn-hand-drawn btn-primary text-2xl md:text-3xl px-10 py-4 border-2"
                        >
                            Launch Friendex
                        </button>
                    </section>
                </main>

                <footer className="text-center text-stone-500 py-8 border-t-2 border-stone-200 mt-16">
                    <p className="text-lg">
                        Friendex © 2025 | Built for better connections.
                    </p>
                </footer>
            </div>

            <style jsx="true">{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0) translateX(0);
                    }
                    25% {
                        transform: translateY(-20px) translateX(10px);
                    }
                    50% {
                        transform: translateY(-10px) translateX(-10px);
                    }
                    75% {
                        transform: translateY(-30px) translateX(5px);
                    }
                }
            `}</style>
        </div>
    );
}

export default LandingPage;
