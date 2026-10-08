/* global __APP_VERSION__ */
// Keeps the installed PWA fresh. iOS resumes a home-screen app from memory
// without re-fetching index.html, so a new deploy can go unnoticed for days.
// Whenever the app comes back to the foreground we compare the running build
// against /version.json and reload if a newer one is live.

const RELOAD_GUARD_KEY = "friendex_reloadedForVersion";
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

async function fetchLiveVersion() {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.version ?? null;
}

// Forms keep drafts in sessionStorage, which survives a reload, but don't yank
// the page out from under someone mid-edit if we can avoid it.
const isEditing = () => /\/(add|modify)(\/|$)/.test(window.location.pathname);

export function startUpdateChecker() {
    if (!import.meta.env.PROD) return;

    let checking = false;
    let pendingReload = false;

    const reload = (version) => {
        // Never loop: reload at most once per new version
        if (sessionStorage.getItem(RELOAD_GUARD_KEY) === version) return;
        sessionStorage.setItem(RELOAD_GUARD_KEY, version);
        window.location.reload();
    };

    const check = async ({ resumed }) => {
        if (checking) return;
        checking = true;
        try {
            navigator.serviceWorker
                ?.getRegistration()
                .then((reg) => reg?.update())
                .catch(() => {});

            const live = await fetchLiveVersion();
            if (live && live !== __APP_VERSION__) {
                if (resumed && !isEditing()) {
                    reload(live);
                } else {
                    pendingReload = live;
                }
            }
        } catch {
            // Offline or blocked: try again next time
        } finally {
            checking = false;
        }
    };

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState !== "visible") return;
        if (pendingReload && !isEditing()) {
            reload(pendingReload);
            return;
        }
        check({ resumed: true });
    });

    // Pick up a pending update when backing out of an edit screen
    window.addEventListener("popstate", () => {
        if (pendingReload && !isEditing()) reload(pendingReload);
    });

    setInterval(() => check({ resumed: false }), CHECK_INTERVAL_MS);
    check({ resumed: true });
}
