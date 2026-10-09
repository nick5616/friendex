import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, GalleryVerticalEnd, Undo2, Cake, ScanLine, UserPlus } from "lucide-react";
import { db } from "./db";
import { demoDb } from "./demoDb";
import { seedDemoDatabase } from "./demoSeed";
import { runMigration } from "./migration";
import { useAuth } from "./hooks/useAuth";
import { useFirestoreSync } from "./hooks/useFirestoreSync";
import LoginScreen from "./LoginScreen";
import Toast from "./Toast";
import RolodexList from "./RolodexList.tsx";
import FriendDetailView from "./FriendDetailView";
import FilterAndSort from "./FilterAndSort";
import PWAInstallPrompt from "./PWAInstallPrompt";
import DexScreen from "./DexScreen";
import FriendGrid from "./FriendGrid";
import TrainerCard from "./TrainerCard";
import CatchCelebration from "./CatchCelebration";
import Burst from "./Burst";
import CatchScanner from "./CatchScanner";
import WildEncounter from "./WildEncounter";
import CatchHint from "./CatchHint";
import UnlockCelebration from "./UnlockCelebration";
import { useUnlocks } from "./hooks/useUnlocks";
import { getPendingCatch, clearPendingCatch } from "./trainer";
import { deleteAccountAndData } from "./deleteAccount";
import {
    applyUserColor,
    getUserColor,
    COLOR_SCHEMES,
    parsePronouns,
} from "./utils";
import {
    getDexNumbers,
    getFriendshipTier,
    getLastHangout,
    isBirthdayToday,
    parseBirthday,
    todayKey,
    compressImage,
} from "./dex";

const VIEW_KEY = "friendexView";

const shellButton =
    "w-10 h-10 rounded-full bg-white border-2 border-stone-800 text-stone-800 flex items-center justify-center shadow-[2px_2px_0_#1c1917] active:translate-y-px active:shadow-none transition-all flex-shrink-0";

function FriendexApp() {
    const navigate = useNavigate();
    const location = useLocation();

    const { user, signIn, signOut } = useAuth();

    // Determine if we're in demo mode based on the URL
    const isDemoMode = location.pathname.startsWith("/demo");
    const currentDb = isDemoMode ? demoDb : db;
    const basePath = isDemoMode ? "/demo" : "";

    const friends = useLiveQuery(() => currentDb.friends.toArray(), [currentDb]);
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const fileInputRef = useRef(null);
    const importFileInputRef = useRef(null);
    const [sortBy, setSortBy] = useState("name");
    const [filterText, setFilterText] = useState("");
    const [filterField, setFilterField] = useState("name");
    const [toast, setToast] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [showTrainerCard, setShowTrainerCard] = useState(false);
    const [catchInfo, setCatchInfo] = useState(null);
    const [stampKey, setStampKey] = useState(null);
    const [hangoutBurstKey, setHangoutBurstKey] = useState(null);
    const [showCatchMenu, setShowCatchMenu] = useState(false);
    const [showScanner, setShowScanner] = useState(false);    // A trainer from a scanned QR code or an opened catch link, waiting to be caught
    const [encounter, setEncounter] = useState(getPendingCatch);
    const [view, setView] = useState(() => {
        try {
            return localStorage.getItem(VIEW_KEY) || "dex";
        } catch {
            return "dex";
        }
    });

    // Firestore sync for non-demo authenticated users
    const { initialSyncDone } = useFirestoreSync(
        isDemoMode ? null : user,
        friends,
        isDemoMode
    );

    const unlocks = useUnlocks(
        friends?.length,
        isDemoMode || (!!user && initialSyncDone),
        isDemoMode
    );

    // Seed the appropriate database on initial mount and run migration
    useEffect(() => {
        const initializeApp = async () => {
            await runMigration();
            if (isDemoMode) {
                await seedDemoDatabase();
            }
        };

        initializeApp();
    }, [isDemoMode]);

    // Load and apply user color on mount
    useEffect(() => {
        const colorToUse = getUserColor();
        const useSameColorText =
            localStorage.getItem("useSameColorText") === "true";
        const colorScheme =
            localStorage.getItem("colorScheme") || COLOR_SCHEMES.MONOCHROME;
        const mixItUp = localStorage.getItem("mixItUp") === "true";
        applyUserColor(colorToUse, useSameColorText, colorScheme, mixItUp);
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(VIEW_KEY, view);
        } catch {
            // Storage unavailable (private mode) - view just won't be remembered
        }
    }, [view]);

    // Check if we're returning from adding/editing a friend
    useEffect(() => {
        if (location.state?.newFriendId) {
            setSelectedFriendId(location.state.newFriendId);
            if (location.state.caught) {
                setCatchInfo({
                    id: location.state.newFriendId,
                    count: location.state.caught,
                });
            } else if (location.state.toast) {
                setToast(location.state.toast);
            }
            navigate(location.pathname, { replace: true });
        } else if (location.state?.toast) {
            setToast(location.state.toast);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const dexNumbers = useMemo(() => getDexNumbers(friends), [friends]);

    // Apply filtering and sorting — computed before auth gate so the useEffect below
    // can also live before the gate (hooks must not be called after conditional returns)
    const filteredAndSortedFriends = useMemo(() => {
        if (!friends) return [];

        let filtered = [...friends];

        if (filterText.trim()) {
            const searchText = filterText.toLowerCase();
            filtered = filtered.filter((friend) => {
                switch (filterField) {
                    case "name":
                        return friend.name?.toLowerCase().includes(searchText);
                    case "tags":
                        return friend.tags?.some((tag) =>
                            tag.toLowerCase().includes(searchText)
                        );
                    case "pronouns":
                        return parsePronouns(friend.pronouns)
                            .join("/")
                            .includes(searchText);
                    case "notes":
                        return [].concat(friend.notes || [])
                            .join(" ")
                            .toLowerCase()
                            .includes(searchText);
                    default:
                        return true;
                }
            });
        }

        switch (sortBy) {
            case "name":
                filtered.sort(
                    (a, b) => a.name?.localeCompare(b.name || "") || 0
                );
                break;
            case "dex":
                filtered.sort(
                    (a, b) => dexNumbers.get(a.id) - dexNumbers.get(b.id)
                );
                break;
            case "hangout":
                // Most recent first; never-hung-out friends go last
                filtered.sort((a, b) =>
                    (getLastHangout(b) || "").localeCompare(
                        getLastHangout(a) || ""
                    )
                );
                break;
            case "age":
                filtered.sort((a, b) => {
                    const dateA =
                        parseBirthday(a.keyInfo?.birthday) || new Date();
                    const dateB =
                        parseBirthday(b.keyInfo?.birthday) || new Date();
                    return dateA - dateB;
                });
                break;
            default:
                break;
        }

        return filtered;
    }, [friends, filterText, filterField, sortBy, dexNumbers]);

    // Auto-select first friend when list loads or selected friend is removed
    useEffect(() => {
        const currentList = filteredAndSortedFriends;

        if (location.state?.newFriendId) {
            return;
        }

        if (currentList && currentList.length > 0 && !selectedFriendId) {
            setSelectedFriendId(currentList[0].id);
        }
        if (
            currentList &&
            selectedFriendId &&
            !currentList.some((f) => f.id === selectedFriendId) &&
            !location.state?.newFriendId
        ) {
            setSelectedFriendId(
                currentList.length > 0 ? currentList[0].id : null
            );
        }
    }, [filteredAndSortedFriends, selectedFriendId, location.state]);

    // Redirect to /add when there are genuinely no friends — must be a useEffect, not
    // inline render code, so it only fires after all state has settled.
    // Signed-out users must stay here to see the login screen: sync reports "done"
    // immediately when there's no user, so the user check is what holds this back.
    useEffect(() => {
        if (
            friends !== undefined &&
            friends.length === 0 &&
            !isDemoMode &&
            user &&
            initialSyncDone &&
            !encounter
        ) {
            navigate("/add");
        }
    }, [friends, isDemoMode, user, initialSyncDone, navigate, encounter]);

    const handleCatchDone = useCallback(() => setCatchInfo(null), []);
    // Stable so the toast's auto-dismiss timer isn't reset on every re-render
    const clearToast = useCallback(() => setToast(null), []);

    const handleScanned = useCallback((trainer) => {
        setShowScanner(false);
        setEncounter(trainer);
    }, []);

    const handleCaught = useCallback((newFriendId) => {
        clearPendingCatch();
        setEncounter(null);
        setSelectedFriendId(newFriendId);
        setCatchInfo({ id: newFriendId, count: 1 });
        setView("dex");
    }, []);

    const handleRun = useCallback(() => {
        clearPendingCatch();
        setEncounter(null);
    }, []);

    // Auth gate — only applies to non-demo routes (must be after all hooks above)
    if (!isDemoMode) {
        if (user === undefined) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-stone-500 text-sm">Loading…</p>
                </div>
            );
        }
        if (!user) {
            return <LoginScreen onSignIn={signIn} />;
        }
    }

    let friendsForRolodex = filteredAndSortedFriends;
    if (selectedFriendId) {
        const selectedFriend = friends?.find((f) => f.id === selectedFriendId);
        const isInFiltered = filteredAndSortedFriends.some(
            (f) => f.id === selectedFriendId
        );

        if (selectedFriend && !isInFiltered) {
            friendsForRolodex = [selectedFriend, ...filteredAndSortedFriends];
        }
    }

    const selectedFriend = friends?.find((f) => f.id === selectedFriendId);
    const selectedTier = getFriendshipTier(selectedFriend);
    const lastHangout = getLastHangout(selectedFriend);
    const hungOutToday = lastHangout === todayKey();
    const birthdayToday = isBirthdayToday(selectedFriend?.keyInfo?.birthday);
    const caughtFriend = friends?.find((f) => f.id === catchInfo?.id);

    const handleProfilePictureClick = () => {
        if (selectedFriend && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !selectedFriend) return;

        try {
            const dataUrl = await compressImage(file);
            // Clearing photoId tells the cloud sync to upload this as a new photo
            await currentDb.friends.update(selectedFriend.id, {
                profilePicture: dataUrl,
                photoId: null,
            });
        } catch (error) {
            console.error("Photo error:", error);
            setToast({ message: "Couldn't read that photo", type: "error" });
        }
    };

    const handleHangout = async () => {
        if (!selectedFriend) return;
        const today = todayKey();
        const list = selectedFriend.hangouts || [];
        if (list.includes(today)) {
            await currentDb.friends.update(selectedFriend.id, {
                hangouts: list.filter((d) => d !== today),
            });
            setToast({ message: "Un-logged today's hangout", type: "success" });
        } else {
            await currentDb.friends.update(selectedFriend.id, {
                hangouts: [...list, today],
            });
            setStampKey(Date.now());
            setHangoutBurstKey(Date.now());
        }
    };

    const handleSelectFromGrid = (id) => {
        setSelectedFriendId(id);
        setView("dex");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleExportFriends = async () => {
        const allFriends = await currentDb.friends.toArray();
        const jsonString = JSON.stringify(allFriends, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const date = new Date().toISOString().split("T")[0];
        const prefix = isDemoMode ? "friendex-demo-export" : "friendex-export";
        link.download = `${prefix}-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        importFileInputRef.current?.click();
    };

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedFriends = JSON.parse(text);

            if (!Array.isArray(importedFriends)) {
                alert("Invalid JSON format. Expected an array of friends.");
                return;
            }

            const friendsToImport = importedFriends.map((friend) => {
                const { id, ...friendWithoutId } = friend;
                return friendWithoutId;
            });

            await currentDb.friends.bulkAdd(friendsToImport);

            setToast({ message: `Imported ${friendsToImport.length} friend${friendsToImport.length !== 1 ? "s" : ""}`, type: "success" });
            e.target.value = "";
        } catch (error) {
            console.error("Import error:", error);
            setToast({ message: "Import failed — check the JSON file format", type: "error" });
        }
    };

    const handleResetDemo = async () => {
        if (
            confirm(
                "Are you sure you want to reset the demo database to its original state?"
            )
        ) {
            await seedDemoDatabase();
            setShowTrainerCard(false);
            setToast({ message: "Demo friends reset", type: "success" });
        }
    };

    // No awaits before deleteAccountAndData: its re-auth popup needs this click
    const handleDeleteAccount = async () => {
        const answer = prompt(
            "This permanently deletes your Friendex account, every friend and photo " +
                "in the cloud, and everything stored on this device. It can't be undone.\n\n" +
                'Type DELETE to confirm.'
        );
        if (answer?.trim().toUpperCase() !== "DELETE") return;
        try {
            await deleteAccountAndData();
            window.location.replace("/");
        } catch (err) {
            if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") return;
            console.error("Account deletion failed:", err);
            setToast({ message: "Couldn't delete your account — nothing was removed from this device", type: "error" });
        }
    };

    const handleDeleteFriend = async (friendId) => {
        await currentDb.friends.delete(friendId);
    };

    const trainerStats = {
        friends: friends?.length ?? 0,
        hangouts: (friends || []).reduce(
            (sum, f) => sum + (f.hangouts?.length || 0),
            0
        ),
        besties: (friends || []).filter(
            (f) => (getFriendshipTier(f)?.level || 0) >= 4
        ).length,
    };

    const accountInitial = isDemoMode
        ? "D"
        : (user?.displayName || user?.email || "?")[0].toUpperCase();

    return (
        <div className="min-h-screen flex flex-col pb-28">
            {/* Pokédex shell */}
            <header className="dex-shell px-4 pb-4 text-white relative z-10">
                <div className="relative max-w-3xl mx-auto flex items-start gap-3">
                    <div
                        className="dex-lens w-14 h-14 rounded-full flex-shrink-0 mt-1"
                        aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                        <h1
                            onClick={() => navigate(`${basePath}/about`)}
                            className="text-4xl font-bold leading-none mt-2 cursor-pointer"
                            style={{ textShadow: "2px 2px 0 #1c1917" }}
                        >
                            Friendex
                        </h1>
                        <div className="font-pixel text-[10px] text-white/85 mt-1">
                            {String(friends?.length ?? 0).padStart(3, "0")}{" "}
                            REGISTERED
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <button
                            onClick={() => setShowSearch((v) => !v)}
                            className={shellButton}
                            aria-label="Search friends"
                            aria-pressed={showSearch}
                        >
                            <Search className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() =>
                                setView((v) => (v === "grid" ? "dex" : "grid"))
                            }
                            className={shellButton}
                            aria-label={
                                view === "grid"
                                    ? "Show rolodex view"
                                    : "Show grid view"
                            }
                        >
                            {view === "grid" ? (
                                <GalleryVerticalEnd className="w-5 h-5" strokeWidth={2.5} />
                            ) : (
                                <LayoutGrid className="w-5 h-5" strokeWidth={2.5} />
                            )}
                        </button>
                        <button
                            onClick={() => setShowTrainerCard(true)}
                            title="Trainer card"
                            aria-label="Open trainer card"
                            className={`${shellButton} overflow-hidden font-bold`}
                        >
                            {!isDemoMode && user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                accountInitial
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <div className="w-full max-w-3xl mx-auto flex-grow">
                {showSearch && (
                    <FilterAndSort
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        filterText={filterText}
                        setFilterText={setFilterText}
                        filterField={filterField}
                        setFilterField={setFilterField}
                        filteredCount={filteredAndSortedFriends.length}
                        onClose={() => setShowSearch(false)}
                    />
                )}

                {friendsForRolodex.length > 0 && view === "grid" ? (
                    <section className="mt-5">
                        <FriendGrid
                            friends={filteredAndSortedFriends}
                            dexNumbers={dexNumbers}
                            selectedId={selectedFriendId}
                            onSelect={handleSelectFromGrid}
                        />
                    </section>
                ) : friendsForRolodex.length > 0 ? (
                    <>
                        <section className="flex items-center gap-3 pl-3 mt-6">
                            <DexScreen
                                friend={selectedFriend}
                                tier={selectedTier}
                                lastHangout={lastHangout}
                                stampKey={stampKey}
                                birthdayToday={birthdayToday}
                                onPhotoClick={handleProfilePictureClick}
                            />
                            <div className="flex-1 min-w-0">
                                <RolodexList
                                    friends={friendsForRolodex || []}
                                    selectedId={selectedFriendId}
                                    onSelect={setSelectedFriendId}
                                    dexNumbers={dexNumbers}
                                />
                            </div>
                        </section>

                        {birthdayToday && (
                            <div className="relative mx-3 mt-4 dex-card !py-2 flex items-center justify-center gap-2 bg-pink-100 text-pink-900 font-bold text-lg">
                                <Cake className="w-5 h-5" />
                                It's {selectedFriend.name}'s birthday today!
                                <Burst
                                    burstKey={`bday-${selectedFriend.id}`}
                                    shape="confetti"
                                    count={18}
                                    distance={120}
                                />
                            </div>
                        )}

                        {selectedFriend && (
                            <section className="px-3 mt-5">
                                <button
                                    onClick={handleHangout}
                                    className="relative dex-btn w-full border-2 border-stone-800 flex items-center justify-center gap-2 text-xl py-3"
                                    style={
                                        hungOutToday
                                            ? {
                                                  background: "white",
                                                  color: "#1c1917",
                                              }
                                            : {
                                                  background: "var(--color-shell)",
                                                  color: "white",
                                                  boxShadow: "3px 3px 0 #1c1917",
                                                  textShadow: "1px 1px 0 rgba(0,0,0,0.35)",
                                              }
                                    }
                                >
                                    {hungOutToday ? (
                                        <>
                                            <Undo2 className="w-5 h-5" />
                                            Hung out today · tap to undo
                                        </>
                                    ) : (
                                        "We just hung out!"
                                    )}
                                    <Burst burstKey={hangoutBurstKey} />
                                </button>
                            </section>
                        )}

                        <section className="px-3 mt-5">
                            <FriendDetailView
                                friend={selectedFriend}
                                dexNumber={dexNumbers.get(selectedFriendId)}
                                basePath={basePath}
                                onDeleteFriend={handleDeleteFriend}
                                currentDb={currentDb}
                            />
                        </section>
                    </>
                ) : (
                    <section className="px-3 py-10 text-center text-stone-600 text-lg">
                        No friends found with {filterField} "{filterText}".
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => navigate(`${basePath}/add`)}
                                className="dex-btn btn-primary border-2 border-stone-800"
                            >
                                Register a new friend
                            </button>
                        </div>
                    </section>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            <input
                ref={importFileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
            />

            {/* Catch a new friend: scan their trainer card or register by hand */}
            <AnimatePresence>
                {showCatchMenu && (
                    <>
                        <motion.div
                            className="fixed inset-0 z-40 bg-black/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCatchMenu(false)}
                        />
                        <motion.div
                            className="fixed z-40 right-4 flex flex-col items-end gap-2"
                            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)" }}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                        >
                            {[
                                {
                                    icon: ScanLine,
                                    label: "Scan trainer card",
                                    onClick: () => setShowScanner(true),
                                },
                                {
                                    icon: UserPlus,
                                    label: "Register manually",
                                    onClick: () => navigate(`${basePath}/add`),
                                },
                            ].map(({ icon: Icon, label, onClick }) => (
                                <button
                                    key={label}
                                    onClick={() => {
                                        setShowCatchMenu(false);
                                        onClick();
                                    }}
                                    className="dex-btn bg-white border-2 border-stone-800 text-stone-800 flex items-center gap-2 shadow-[3px_3px_0_#1c1917]"
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <motion.button
                onClick={() => setShowCatchMenu((v) => !v)}
                aria-label="Catch a new friend"
                aria-expanded={showCatchMenu}
                title="Catch a new friend"
                className="fixed z-40 right-4 w-[76px] h-[76px] rounded-full"
                style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
                animate={{ rotate: showCatchMenu ? 180 : 0 }}
                whileHover={{ rotate: [0, -14, 14, -8, 0] }}
                whileTap={{ scale: 0.88 }}
            >
                <CatchHint pressed={showCatchMenu} />
                {/* Padded copy of the app icon: the original's art touches the
                    image edges, which iOS Safari clips */}
                <img
                    src="/icons/catch-ball.png"
                    alt=""
                    className="w-full h-full drop-shadow-[3px_3px_0_rgba(28,25,23,0.9)]"
                />
            </motion.button>

            <AnimatePresence>
                {showScanner && (
                    <CatchScanner
                        onCatch={handleScanned}
                        onClose={() => setShowScanner(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {encounter && (isDemoMode || initialSyncDone) && (
                    <WildEncounter
                        trainer={encounter}
                        friends={friends}
                        currentDb={currentDb}
                        user={user}
                        isDemoMode={isDemoMode}
                        onCaught={handleCaught}
                        onRun={handleRun}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showTrainerCard && (
                    <TrainerCard
                        user={user}
                        isDemoMode={isDemoMode}
                        stats={trainerStats}
                        best={unlocks.best}
                        onClose={() => setShowTrainerCard(false)}
                        onChangeTheme={() => navigate(`${basePath}/color-picker`)}
                        onImport={handleImportClick}
                        onExport={handleExportFriends}
                        onResetDemo={handleResetDemo}
                        onAbout={() => navigate(`${basePath}/about`)}
                        onSignOut={() => {
                            setShowTrainerCard(false);
                            signOut();
                        }}
                        onDeleteAccount={handleDeleteAccount}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {catchInfo && (
                    <CatchCelebration
                        name={caughtFriend?.name}
                        count={catchInfo.count}
                        dexNumber={dexNumbers.get(catchInfo.id)}
                        onDone={handleCatchDone}
                    />
                )}
            </AnimatePresence>

            {/* After the catch animation, so the two don't stack */}
            <AnimatePresence>
                {unlocks.fresh.length > 0 && !catchInfo && !encounter && (
                    <UnlockCelebration
                        unlocks={unlocks.fresh}
                        best={unlocks.best}
                        onDone={unlocks.clearFresh}
                    />
                )}
            </AnimatePresence>

            <PWAInstallPrompt />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDone={clearToast}
                />
            )}
        </div>
    );
}

function App() {
    return <FriendexApp />;
}

export default App;
