import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import AddFriend from "./AddFriend.jsx";
import BulkAddFriends from "./BulkAddFriends.jsx";
import ModifyFriend from "./ModifyFriend.jsx";
import ColorPickerPage from "./ColorPickerPage.jsx";
import About from "./About.jsx";
import CatchRoute from "./CatchRoute.jsx";
import { applyUserColor, getUserColor, COLOR_SCHEMES } from "./utils";
import { startUpdateChecker } from "./updateChecker";
import "./index.css"; // <-- Make sure this is imported

// Apply the saved theme before first paint so every route (and the status bar)
// starts in the right colors instead of flashing the default amber
try {
    applyUserColor(
        getUserColor(),
        localStorage.getItem("useSameColorText") === "true",
        localStorage.getItem("colorScheme") || COLOR_SCHEMES.MONOCHROME,
        localStorage.getItem("mixItUp") === "true"
    );
} catch (error) {
    console.warn("Couldn't apply saved theme:", error);
}

startUpdateChecker();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Router>
            <Routes>
                {/* Regular routes */}
                <Route path="/" element={<App />} />
                <Route path="/add" element={<AddFriend />} />
                <Route path="/add/bulk" element={<BulkAddFriends />} />
                <Route path="/modify/:id" element={<ModifyFriend />} />
                <Route path="/color-picker" element={<ColorPickerPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/catch" element={<CatchRoute />} />

                {/* Demo routes - same components, detect mode via URL */}
                <Route path="/demo" element={<App />} />
                <Route path="/demo/add" element={<AddFriend />} />
                <Route path="/demo/add/bulk" element={<BulkAddFriends />} />
                <Route path="/demo/modify/:id" element={<ModifyFriend />} />
                <Route
                    path="/demo/color-picker"
                    element={<ColorPickerPage />}
                />
                <Route path="/demo/about" element={<About />} />
                <Route path="/demo/catch" element={<CatchRoute />} />
            </Routes>
        </Router>
    </React.StrictMode>
);
