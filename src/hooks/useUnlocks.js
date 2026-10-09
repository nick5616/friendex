import { useEffect, useState } from "react";
import { loadBest, saveBest, milestonesBetween } from "../unlocks";

// Tracks the most friends this device has seen and which milestones were just
// crossed. `ready` holds off until the friend list is final (cloud sync done,
// demo seeded) so a 0 → 80 jump on a fresh device doesn't celebrate everything.
export function useUnlocks(count, ready, isDemoMode) {
    const [best, setBest] = useState(() => loadBest(isDemoMode));
    const [fresh, setFresh] = useState([]);

    useEffect(() => {
        if (!ready || count === undefined) return;
        if (best === null) {
            // First time on this device: take the current dex as the baseline.
            // Wait for a non-empty list, since sync/seed may not have filled it yet.
            if (count === 0) return;
            saveBest(isDemoMode, count);
            setBest(count);
            return;
        }
        if (count > best) {
            const crossed = milestonesBetween(best, count);
            if (crossed.length) setFresh((prev) => [...prev, ...crossed]);
            saveBest(isDemoMode, count);
            setBest(count);
        }
    }, [count, ready, best, isDemoMode]);

    return { best: best ?? count ?? 0, fresh, clearFresh: () => setFresh([]) };
}
