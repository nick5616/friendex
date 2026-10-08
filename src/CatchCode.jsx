// src/CatchCode.jsx
// Your catch code: a QR a friend scans to add you to their Friendex, plus a
// share/copy link for catching from afar.
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Share2, Copy, Check } from "lucide-react";

export default function CatchCode({ url, name }) {
    const [qr, setQr] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let cancelled = false;
        QRCode.toDataURL(url, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 560,
            color: { dark: "#1c1917", light: "#ffffff" },
        })
            .then((dataUrl) => !cancelled && setQr(dataUrl))
            .catch((err) => console.error("QR error:", err));
        return () => {
            cancelled = true;
        };
    }, [url]);

    const canShare = typeof navigator !== "undefined" && !!navigator.share;

    const handleShare = async () => {
        if (canShare) {
            try {
                await navigator.share({
                    title: `Catch ${name} on Friendex`,
                    text: `Add ${name} to your Friendex!`,
                    url,
                });
                return;
            } catch (err) {
                if (err?.name === "AbortError") return;
                // Fall through to copying
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt("Copy your catch link:", url);
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="dex-bezel !rounded-[14px] p-3">
                <div className="bg-white border-2 border-stone-800 rounded-lg p-2 w-56 h-56 flex items-center justify-center">
                    {qr ? (
                        <img
                            src={qr}
                            alt={`QR code to catch ${name}`}
                            className="w-full h-full"
                            style={{ imageRendering: "pixelated" }}
                        />
                    ) : (
                        <span className="font-pixel text-[10px] text-stone-400">
                            LOADING…
                        </span>
                    )}
                </div>
            </div>
            <p className="text-center text-stone-600 leading-tight px-2">
                Have a friend scan this with the{" "}
                <strong>Friendex catch button</strong> or their phone camera.
            </p>
            <button
                onClick={handleShare}
                className="dex-btn btn-secondary border-2 border-stone-800 flex items-center gap-2 text-base py-2"
            >
                {copied ? (
                    <>
                        <Check className="w-5 h-5" /> Link copied
                    </>
                ) : canShare ? (
                    <>
                        <Share2 className="w-5 h-5" /> Send catch link
                    </>
                ) : (
                    <>
                        <Copy className="w-5 h-5" /> Copy catch link
                    </>
                )}
            </button>
        </div>
    );
}
