import React from "react";

// A simple SVG icon component for visual flair.
const Icon = ({ children, className }) => (
    <div
        className={`w-16 h-16 bg-amber-200 card-hand-drawn flex items-center justify-center mb-4 ${className}`}
    >
        <span className="text-4xl">{children}</span>
    </div>
);

function LandingPage({ onLaunchApp }) {
    return (
        <div className="min-h-screen pl-4 md:pl-8 py-8 pr-4 md:pr-8 flex flex-col items-center">
            <main className="max-w-4xl w-full">
                {/* --- Hero Section --- */}
                <section className="text-center py-16">
                    <h1 className="text-8xl font-bold text-stone-900 leading-tight">
                        A Pokedex for your friends.
                    </h1>
                    <p className="text-2xl text-stone-600 mt-4 max-w-2xl mx-auto">
                        Your private, tactile space to remember the details that
                        matter and strengthen your connections.
                    </p>
                    <button
                        onClick={onLaunchApp}
                        className="btn-hand-drawn btn-primary text-3xl px-8 py-4 mt-12"
                    >
                        Open Your Friendex
                    </button>
                    <p className="text-stone-500 mt-2">
                        Free to start, private by default.
                    </p>
                </section>

                {/* --- Features Section --- */}
                <section className="py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center">
                            <Icon>🧠</Icon>
                            <h2 className="text-3xl font-bold mb-2">
                                Beat Object Permanence
                            </h2>
                            <p className="text-lg text-stone-700">
                                Friendex acts as your external memory. See all
                                your people in one place and never forget who
                                you can talk to.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Icon>✨</Icon>
                            <h2 className="text-3xl font-bold mb-2">
                                Remember the Details
                            </h2>
                            <p className="text-lg text-stone-700">
                                Keep track of birthdays, gift ideas, inside
                                jokes, and what you last talked about. Show them
                                you care.
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Icon>👆</Icon>{" "}
                            {/* Changed icon to represent tactility */}
                            <h2 className="text-3xl font-bold mb-2">
                                A Joy to Use
                            </h2>
                            <p className="text-lg text-stone-700">
                                A fun, tactile rolodex interface that makes
                                browsing your connections feel delightful, not
                                like a chore.
                            </p>
                        </div>
                    </div>
                </section>

                {/* --- REVISED Privacy Trust Section --- */}
                <section className="py-16">
                    <div className="card-hand-drawn bg-white p-8 md:p-12 text-center">
                        <div className="text-5xl mb-4">🛡️</div>
                        <h2 className="text-5xl font-bold">
                            Private by Default. You're in Control.
                        </h2>
                        <p className="text-xl text-stone-700 max-w-3xl mx-auto mt-4">
                            We believe you should own your data. The standard
                            version of Friendex runs entirely on your device,
                            ensuring your private information is never uploaded
                            or tracked.
                        </p>
                        <p className="text-xl text-stone-500 max-w-3xl mx-auto mt-4">
                            For those who want the convenience of accessing
                            their Friendex on multiple devices, we're building
                            an optional and secure cloud sync feature for the
                            future. You choose what's right for you.
                        </p>
                    </div>
                </section>

                {/* --- Final CTA --- */}
                <section className="text-center py-16">
                    <h2 className="text-6xl font-bold">Ready to connect?</h2>
                    <button
                        onClick={onLaunchApp}
                        className="btn-hand-drawn btn-primary text-3xl px-8 py-4 mt-8"
                    >
                        Launch Friendex
                    </button>
                </section>
            </main>

            <footer className="text-center text-stone-500 pb-4">
                <p>Friendex © 2025 | Built for better connections.</p>
            </footer>
        </div>
    );
}

export default LandingPage;
