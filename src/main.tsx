import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@neyu703/base-css/base.css";
import "./styles/global.scss";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);

const RELOAD_AFTER_HIDDEN_MS = 30 * 60 * 1000;

// Hosted use only (not file://): offline cache plus pick up a new deploy after a long absence
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => undefined);
    });

    let hiddenAt = 0;
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            hiddenAt = Date.now();
        } else if (hiddenAt && Date.now() - hiddenAt > RELOAD_AFTER_HIDDEN_MS) {
            location.reload();
        }
    });
}
