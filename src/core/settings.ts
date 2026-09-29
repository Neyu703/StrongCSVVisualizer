import { loadJson } from "./storage";
import type { StorageLike } from "./storage";

/** Which anatomy model the 3D view shows. */
export type BodyModel = "male" | "female";

export const BODY_MODELS: readonly BodyModel[] = ["male", "female"];

/** User preferences, stored separately from the training data. */
export interface Settings {
    /** Draw a fitted trend line in every chart. */
    showTrendlines: boolean;
    bodyModel: BodyModel;
}

export const SETTINGS_KEY = "strong-pro-settings-v1";

export const DEFAULT_SETTINGS: Settings = { showTrendlines: true, bodyModel: "male" };

/**
 * Checks that parsed JSON is an object that may hold settings.
 * @param value parsed JSON
 * @returns true for non-null objects
 */
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Keeps only the stored settings that have a valid value, so older or damaged data cannot break newer ones.
 * @param stored stored object
 * @returns the valid subset
 */
function validSettings(stored: Record<string, unknown>): Partial<Settings> {
    return {
        ...(typeof stored.showTrendlines === "boolean" && { showTrendlines: stored.showTrendlines }),
        ...(BODY_MODELS.includes(stored.bodyModel as BodyModel) && { bodyModel: stored.bodyModel as BodyModel }),
    };
}

/**
 * Reads the stored settings; missing, corrupt or invalid entries fall back to the defaults.
 * @param storage browser storage
 * @returns the settings
 */
export function loadSettings(storage: StorageLike): Settings {
    const stored = loadJson(storage, SETTINGS_KEY, isObject);
    return { ...DEFAULT_SETTINGS, ...(stored && validSettings(stored)) };
}

/**
 * Stores the settings. A failure is ignored on purpose: preferences still work for this session.
 * @param storage browser storage
 * @param settings settings to store
 */
export function saveSettings(storage: StorageLike, settings: Settings): void {
    try {
        storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
        // Not worth interrupting the user; the setting simply resets on the next visit
    }
}
