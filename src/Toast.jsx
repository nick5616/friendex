import { useEffect } from "react";

export default function Toast({ message, type = "success", onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 3500);
        return () => clearTimeout(t);
    }, [onDone]);

    const icon = type === "success" ? "✓" : "✕";
    const colors =
        type === "success"
            ? "bg-white border-stone-800 text-stone-800"
            : "bg-white border-red-700 text-red-800";

    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 card-hand-drawn border-2 px-5 py-3 text-sm font-medium flex items-center gap-2 whitespace-nowrap ${colors}`}
            style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.15)" }}
        >
            <span className="font-bold">{icon}</span>
            {message}
        </div>
    );
}
