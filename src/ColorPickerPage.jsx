import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import UserColorPicker from "./UserColorPicker";
import { loadBest, isUnlocked, unlockAt } from "./unlocks";

function ColorPickerPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if we're in demo mode based on the URL
    const isDemoMode = location.pathname.startsWith("/demo");
    const basePath = isDemoMode ? "/demo" : "";
    const best = loadBest(isDemoMode) ?? 0;

    const handleCancel = () => {
        navigate(basePath || "/");
    };

    // Reachable by URL even while locked
    if (!isUnlocked("customizer", best)) {
        const left = unlockAt("customizer") - best;
        return (
            <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
                <div className="dex-card max-w-xs text-center">
                    <Lock className="w-10 h-10 mx-auto text-stone-500" />
                    <div className="text-3xl font-bold mt-2">Not yet!</div>
                    <p className="text-lg text-stone-600 mt-1">
                        The color customizer unlocks at {unlockAt("customizer")} friends.
                        Catch {left} more!
                    </p>
                    <button
                        onClick={handleCancel}
                        className="dex-btn btn-primary border-2 border-stone-800 w-full mt-4"
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <UserColorPicker
                onCancel={handleCancel}
                basePath={basePath}
                best={best}
            />
        </div>
    );
}

export default ColorPickerPage;
