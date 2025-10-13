import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import AddFriend from "./AddFriend.jsx";
import ModifyFriend from "./ModifyFriend.jsx";
import "./index.css"; // <-- Make sure this is imported

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Router>
            <Routes>
                {/* Regular routes */}
                <Route path="/" element={<App />} />
                <Route path="/add" element={<AddFriend />} />
                <Route path="/modify/:id" element={<ModifyFriend />} />

                {/* Demo routes - same components, detect mode via URL */}
                <Route path="/demo" element={<App />} />
                <Route path="/demo/add" element={<AddFriend />} />
                <Route path="/demo/modify/:id" element={<ModifyFriend />} />
            </Routes>
        </Router>
    </React.StrictMode>
);
