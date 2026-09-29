import { useState } from "react";
import { browserStorage } from "./browserStorage";
import { loadSettings, saveSettings } from "./core/settings";
import type { Settings } from "./core/settings";

/**
 * Holds the persisted user settings.
 * @returns current settings and a function that changes and stores some of them
 */
export function useSettings() {
    const [settings, setSettings] = useState<Settings>(() => loadSettings(browserStorage()));

    const updateSettings = (changes: Partial<Settings>) => {
        const updated = { ...settings, ...changes };
        setSettings(updated);
        saveSettings(browserStorage(), updated);
    };

    return { settings, updateSettings };
}
