import { useState } from "react";
import { browserStorage } from "./browserStorage";
import { loadProfile, saveProfile } from "./core/body/profile";
import type { BodyProfile } from "./core/body/profile";

/**
 * Holds the persisted body profile.
 * @param createFallback builds the starting profile when nothing valid is stored
 * @returns current profile and a function that changes and stores some of its fields
 */
export function useBodyProfile(createFallback: () => BodyProfile) {
    const [profile, setProfile] = useState<BodyProfile>(() => loadProfile(browserStorage(), createFallback()));

    const updateProfile = (changes: Partial<BodyProfile>) => {
        const updated = { ...profile, ...changes };
        setProfile(updated);
        saveProfile(browserStorage(), updated);
    };

    return { profile, updateProfile };
}
