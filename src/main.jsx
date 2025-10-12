import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import AddFriend from "./AddFriend.jsx";
import "./index.css"; // <-- Make sure this is imported

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/add" element={<AddFriend />} />
            </Routes>
        </Router>
    </React.StrictMode>
);
