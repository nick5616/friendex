// src/CatchRoute.jsx
// Landing spot for catch links opened outside the app (phone camera, a shared
// link). Parks the trainer and hands off to the main screen, which shows the
// encounter once sign-in and the first cloud sync are done.
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parseCatchCode, setPendingCatch } from "./trainer";

export default function CatchRoute() {
    const location = useLocation();
    const navigate = useNavigate();
    const basePath = location.pathname.startsWith("/demo") ? "/demo" : "";

    useEffect(() => {
        const trainer = parseCatchCode(`/catch${location.hash}`);
        if (trainer) setPendingCatch(trainer);
        navigate(basePath || "/", {
            replace: true,
            state: trainer
                ? null
                : { toast: { message: "That catch link looks broken", type: "error" } },
        });
    }, [location.hash, basePath, navigate]);

    return null;
}
