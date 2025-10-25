import React, { useState, useEffect } from "react";

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        const checkInstalled = () => {
            if (window.matchMedia("(display-mode: standalone)").matches) {
                setIsInstalled(true);
                return;
            }

            // Check for iOS Safari
            if (window.navigator.standalone === true) {
                setIsInstalled(true);
                return;
            }
        };

        checkInstalled();

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        // Listen for the appinstalled event
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

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
        } else {
            console.log("User dismissed the install prompt");
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        // Store dismissal in localStorage to avoid showing again for a while
        localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    };

    // Don't show if already installed
    if (isInstalled) return null;

    // Don't show if recently dismissed (within 24 hours)
    const dismissedTime = localStorage.getItem("pwa-install-dismissed");
    if (
        dismissedTime &&
        Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000
    ) {
        return null;
    }

    // Don't show if no install prompt available
    if (!showInstallPrompt && !deferredPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
            <div className="card-hand-drawn bg-amber-100 border-amber-300 p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                                📱
                            </span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-stone-800 text-sm mb-1">
                            Install Friendex
                        </h3>
                        <p className="text-stone-600 text-xs mb-3">
                            Add Friendex to your home screen for quick access
                            and offline use!
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="btn-hand-drawn btn-primary text-xs px-3 py-1"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="btn-hand-drawn bg-stone-200 text-stone-700 hover:bg-stone-300 text-xs px-3 py-1"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-stone-400 hover:text-stone-600"
                    >
                        <span className="text-lg">×</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
