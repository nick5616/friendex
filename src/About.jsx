import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useIsMobile from "./hooks/useIsMobile";
import { applyUserColor, getUserColor, COLOR_SCHEMES } from "./utils";

function About() {
    const navigate = useNavigate();
    const location = useLocation();
    const isDemoMode = location.pathname.startsWith("/demo");
    const basePath = isDemoMode ? "/demo" : "";
    const isMobile = useIsMobile();
    const [scrollY, setScrollY] = useState(0);
    const [currentWord, setCurrentWord] = useState(0);
    const [particles, setParticles] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [wordWidth, setWordWidth] = useState(0);
    const [showStickyBanner, setShowStickyBanner] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [dismissedInstall, setDismissedInstall] = useState(false);

    const words = [
        "Remember",
        "Know",
        "Love",
        "Cherish",
        "Appreciate",
        "Value",
        "Catch",
    ];

    // Load and apply user color on mount (userColor || defaultColor pattern)
    useEffect(() => {
        const colorToUse = getUserColor();
        const useSameColorText =
            localStorage.getItem("useSameColorText") === "true";
        const colorScheme =
            localStorage.getItem("colorScheme") || COLOR_SCHEMES.MONOCHROME;
        const mixItUp = localStorage.getItem("mixItUp") === "true";
        applyUserColor(colorToUse, useSameColorText, colorScheme, mixItUp);
    }, []);

    // PWA Install Logic
    useEffect(() => {
        const checkInstalled = () => {
            if (window.matchMedia("(display-mode: standalone)").matches) {
                setIsInstalled(true);
                return;
            }
            if (window.navigator.standalone === true) {
                setIsInstalled(true);
                return;
            }
        };

        checkInstalled();

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt
        );
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    // Scroll tracking for pokeball and sticky banner
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);
            console.log(currentScrollY);
            // Show sticky banner when pokeball is fully scaled/disappeared (around scrollY > 600)
            // Pokeball reaches max scale around scrollY 300-400, then starts fading
            if (
                currentScrollY > 500 &&
                currentScrollY < 9700 &&
                !showStickyBanner
            ) {
                console.log("showing sticky banner");
                setShowStickyBanner(true);
            } else if (currentScrollY <= 500 && showStickyBanner) {
                console.log("hiding sticky banner");
                setShowStickyBanner(false);
            } else if (currentScrollY > 9700) {
                console.log("hiding sticky banner");
                setShowStickyBanner(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [showStickyBanner]);

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
            tempElement.className = "word-measure-temp";
            tempElement.textContent = words[currentWord];
            document.body.appendChild(tempElement);

            const width = tempElement.offsetWidth;
            document.body.removeChild(tempElement);

            setWordWidth(width);
            setIsAnimating(false);
        };

        measureWord();
    }, [currentWord, isMobile, words]);

    // PWA Install Handlers
    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismissInstall = () => {
        setDismissedInstall(true);
        setShowInstallPrompt(false);
    };

    const handleLaunchApp = () => {
        navigate(basePath || "/");
    };

    // Calculate Pokéball transformation based on scroll
    const pokeballScale = 1 + scrollY / 300;
    const pokeballOpacity = Math.max(0.2, 0.2 + scrollY / 400 - 0.2);
    const pokeballTranslateY = scrollY * 0.3;

    // Check if install prompt should be shown
    const shouldShowInstall =
        showInstallPrompt &&
        !isInstalled &&
        !dismissedInstall &&
        deferredPrompt;

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Pokéball */}
            <div
                className="pokeball-container"
                style={{
                    top: isMobile ? "60vh" : "50vh",
                    left: "50%",
                    transform: `translate(-50%, -50%) scale(${pokeballScale}) translateY(${pokeballTranslateY}px)`,
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
                                    className="word-width-container inline-block action-verb-color"
                                    style={{
                                        width: `${wordWidth}px`,
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
                            <div>
                                <div className="flex flex-wrap justify-center mt-6 h-24 w-full">
                                    <img
                                        src="/graphics/download_point.png"
                                        alt="Download in one click"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div className="pwa-install-button-group">
                                    <button
                                        onClick={
                                            shouldShowInstall
                                                ? handleInstallClick
                                                : handleLaunchApp
                                        }
                                        className="btn-hand-drawn btn-primary text-xl md:text-2xl px-8 py-4 border-2"
                                    >
                                        Install Friendex
                                    </button>
                                    <button
                                        onClick={handleLaunchApp}
                                        className="btn-hand-drawn text-stone-800 hover:bg-stone-100 text-lg md:text-xl px-6 py-3"
                                    >
                                        Continue to Website
                                    </button>
                                </div>
                            </div>

                            <p className="text-stone-500 mt-3 text-lg">
                                Free to start, private by default.
                            </p>
                        </div>
                    </section>

                    {/* Social Proof - Prominent ADHD Testimonial */}
                    <section className="text-center py-8 mb-12">
                        <div className="card-hand-drawn card-primary-bg p-6 md:p-8 max-w-3xl mx-auto border-2">
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
                            <div className="card-hand-drawn overflow-hidden relative card-primary-bg">
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

                            <div className="card-hand-drawn overflow-hidden relative card-accent-bg">
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

                            <div className="card-hand-drawn overflow-hidden relative card-accent-bg">
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
                            <div className="card-hand-drawn overflow-hidden relative card-primary-bg p-6">
                                <div className="flex flex-col justify-center mb-4">
                                    <img
                                        src="/graphics/undraw_playing-fetch_eij7.svg"
                                        alt=""
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-stone-900">
                                    People with ADHD
                                </h3>
                                <p className="text-stone-700 text-lg">
                                    Beat object permanence issues. Friendex acts
                                    as your external memory, so you never forget
                                    your friends exist or lose track of who you
                                    can reach out to.
                                </p>
                            </div>

                            <div className="card-hand-drawn overflow-hidden relative card-accent-bg p-6">
                                <div className="flex flex-col justify-center mb-4">
                                    <img
                                        src="/graphics/undraw_mobile-user_qc9c.svg"
                                        alt=""
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-stone-900">
                                    Socially Anxious & Introverted
                                </h3>
                                <p className="text-stone-700 text-lg">
                                    Reduce overwhelm and build intentional
                                    connections. Keep track of conversation
                                    topics, interests, and meaningful details
                                    that help you feel more confident reaching
                                    out.
                                </p>
                            </div>

                            <div className="card-hand-drawn overflow-hidden relative card-accent-bg p-6">
                                <div className="flex flex-col justify-center mb-4">
                                    <img
                                        src="/graphics/undraw_businesswoman_8lrc.svg"
                                        alt=""
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-stone-900">
                                    Busy Professionals
                                </h3>
                                <p className="text-stone-700 text-lg">
                                    Maintain relationships without guilt. Store
                                    birthdays, gift ideas, and important dates
                                    so you can be thoughtful even when life gets
                                    hectic.
                                </p>
                            </div>

                            <div className="card-hand-drawn overflow-hidden relative card-primary-bg p-6">
                                <div className="flex flex-col justify-center mb-4">
                                    <img
                                        src="/graphics/undraw_true-friends_1h3v (1).svg"
                                        alt=""
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-stone-900">
                                    Anyone Wanting to Be a Better Friend
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
                                <div className="card-hand-drawn card-error-bg p-6 border-2">
                                    <p className="text-lg text-stone-800 font-medium">
                                        Forgot someone's birthday again?
                                    </p>
                                </div>
                                <div className="card-hand-drawn card-error-bg p-6 border-2">
                                    <p className="text-lg text-stone-800 font-medium">
                                        Struggling to remember who you can reach
                                        out to?
                                    </p>
                                </div>
                                <div className="card-hand-drawn card-error-bg p-6 border-2">
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
                                <div className="text-center relative p-6">
                                    <div className="flex flex-col justify-center mb-4">
                                        <img
                                            src="/graphics/undraw_surveillance_k6wl.svg"
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <p className="font-bold text-stone-900 text-lg">
                                        No Tracking
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        We don't track you or your data
                                    </p>
                                </div>
                                <div className="text-center relative p-6">
                                    <div className="flex flex-col justify-center mb-4">
                                        <img
                                            src="/graphics/undraw_in-real-life_8znn.svg"
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <p className="font-bold text-stone-900 text-lg">
                                        Works Offline
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        All data stored locally on your device
                                    </p>
                                </div>
                                <div className="text-center relative p-6">
                                    <div className="flex flex-col justify-center mb-4">
                                        <img
                                            src="/graphics/undraw_skateboarding_i2pz.svg"
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <p className="font-bold text-stone-900 text-lg">
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

                        <div className="flex justify-center">
                            {/* download the app */}
                            <button
                                onClick={handleInstallClick}
                                className="btn-hand-drawn btn-primary text-xl md:text-3xl px-8 py-4 border-2"
                            >
                                Install Friendex
                            </button>
                            <button
                                onClick={handleLaunchApp}
                                className="btn-hand-drawn btn-secondary text-xl md:text-3xl px-8 py-4"
                            >
                                Continue to Website
                            </button>
                        </div>
                    </section>
                </main>

                <footer className="text-center text-stone-500 py-8 border-t-2 border-stone-200 mt-16">
                    <p className="text-lg">
                        Friendex © 2025 | Built for better connections.
                    </p>
                </footer>
            </div>

            {/* Sticky CTA Banner */}
            {showStickyBanner && (
                <div
                    className={`sticky-cta-banner ${
                        showStickyBanner ? "visible" : ""
                    }`}
                >
                    <div className="card-hand-drawn card-primary-bg p-2 md:p-6 mx-2 mb-2 border-2 shadow-lg">
                        <div className="pwa-install-button-group ">
                            <button
                                onClick={
                                    shouldShowInstall
                                        ? handleInstallClick
                                        : handleLaunchApp
                                }
                                className="btn-hand-drawn btn-primary text-lg md:text-xl px-4 py-2 border-2"
                            >
                                Install Friendex
                            </button>
                            <button
                                onClick={handleLaunchApp}
                                className="btn-hand-drawn btn-secondary text-base md:text-lg px-4 py-2"
                            >
                                Continue to Website
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default About;
