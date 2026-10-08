// src/CatchScanner.jsx
// Full-screen camera that reads a friend's trainer-card QR code. Uses jsQR so it
// works in iOS Safari / installed PWAs, which have no BarcodeDetector.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Link2 } from "lucide-react";
import { parseCatchCode } from "./trainer";

export default function CatchScanner({ onCatch, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);
    const [notOurs, setNotOurs] = useState(false);
    const [pasted, setPasted] = useState("");
    // Kept in a ref so a parent re-render doesn't restart the camera
    const onCatchRef = useRef(onCatch);
    onCatchRef.current = onCatch;

    useEffect(() => {
        let stream;
        let frame;
        let stopped = false;
        let lastRejected = "";
        let jsQR;

        const scan = () => {
            if (stopped) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video && canvas && video.readyState >= 2 && video.videoWidth) {
                // Decode a downscaled frame: plenty for a QR on a phone screen, and fast
                const scale = Math.min(1, 640 / video.videoWidth);
                canvas.width = Math.round(video.videoWidth * scale);
                canvas.height = Math.round(video.videoHeight * scale);
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(image.data, image.width, image.height, {
                    inversionAttempts: "dontInvert",
                });
                if (code?.data) {
                    const trainer = parseCatchCode(code.data);
                    if (trainer) {
                        stopped = true;
                        navigator.vibrate?.(60);
                        onCatchRef.current(trainer);
                        return;
                    }
                    if (code.data !== lastRejected) {
                        lastRejected = code.data;
                        setNotOurs(true);
                    }
                }
            }
            frame = requestAnimationFrame(scan);
        };

        (async () => {
            try {
                // Loaded on demand so the decoder isn't in every page load
                [{ default: jsQR }, stream] = await Promise.all([
                    import("jsqr"),
                    navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "environment" },
                        audio: false,
                    }),
                ]);
                if (stopped) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                const video = videoRef.current;
                video.srcObject = stream;
                await video.play();
                frame = requestAnimationFrame(scan);
            } catch (err) {
                console.warn("Camera unavailable:", err);
                setError(
                    err?.name === "NotAllowedError"
                        ? "Camera access was blocked. Allow it in your browser settings, or paste a catch link below."
                        : "Couldn't open the camera. You can paste a catch link below instead."
                );
            }
        })();

        return () => {
            stopped = true;
            cancelAnimationFrame(frame);
            stream?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    const handlePaste = (e) => {
        e.preventDefault();
        const trainer = parseCatchCode(pasted.trim());
        if (trainer) onCatch(trainer);
        else setNotOurs(true);
    };

    return (
        <motion.div
            className="fixed inset-0 z-[55] bg-stone-950 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-label="Scan a trainer card"
        >
            <div
                className="dex-shell !rounded-none px-4 pb-3 flex items-center justify-between text-white"
                style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
            >
                <span className="relative font-pixel text-sm">SCAN TRAINER CARD</span>
                <button onClick={onClose} aria-label="Close scanner" className="relative">
                    <X className="w-7 h-7" />
                </button>
            </div>

            <div className="relative flex-1 overflow-hidden">
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder */}
                {!error && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-64 h-64">
                            {["top-0 left-0 border-t-4 border-l-4 rounded-tl-xl",
                              "top-0 right-0 border-t-4 border-r-4 rounded-tr-xl",
                              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl",
                              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl"].map((pos) => (
                                <span key={pos} className={`absolute w-10 h-10 border-white ${pos}`} />
                            ))}
                            <motion.span
                                className="absolute left-3 right-3 h-0.5 bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)]"
                                animate={{ top: ["10%", "90%", "10%"] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                )}

                <div className="absolute bottom-0 inset-x-0 p-4 safe-bottom flex flex-col gap-3">
                    {(error || notOurs) && (
                        <div className="dex-card !p-3 text-stone-800 text-base leading-snug">
                            {error ||
                                "That code isn't a Friendex trainer card. Ask your friend to open their trainer card and tap “Catch me”."}
                        </div>
                    )}
                    {!error && !notOurs && (
                        <p className="text-center text-white text-lg font-bold drop-shadow">
                            Point at a friend's trainer card QR code
                        </p>
                    )}
                    <form onSubmit={handlePaste} className="flex gap-2">
                        <div className="relative flex-1">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                            <input
                                value={pasted}
                                onChange={(e) => {
                                    setPasted(e.target.value);
                                    setNotOurs(false);
                                }}
                                placeholder="…or paste a catch link"
                                className="w-full pl-9 pr-3 py-2 border-2 border-stone-800 bg-white text-base focus:outline-none focus:ring-2 focus:ring-stone-500"
                                style={{ borderRadius: "var(--radius-dex)" }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!pasted.trim()}
                            className="dex-btn btn-primary border-2 border-stone-800 text-base disabled:opacity-50"
                        >
                            Catch
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
