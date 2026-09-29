import { useState } from "react";
import type { ImportMessage } from "./components/ImportCard";
import { describeImport } from "./core/format";
import { applyImport } from "./core/library";
import { browserStorage } from "./browserStorage";
import { clearLibrary, loadLibrary, saveLibrary } from "./core/storage";
import type { Library } from "./core/types";

/**
 * Holds the persisted library and the CSV import / reset actions.
 * @returns library (null until the first import), last import message and actions
 */
export function useLibrary() {
    const [library, setLibrary] = useState<Library | null>(() => loadLibrary(browserStorage()));
    const [message, setMessage] = useState<ImportMessage | null>(null);

    const importFile = async (file: File) => {
        try {
            const result = applyImport(library, await file.text());
            if (result.addedSets > 0) {
                saveLibrary(browserStorage(), result.library);
                setLibrary(result.library);
            }
            setMessage({ kind: "success", text: describeImport(result.addedWorkouts, result.addedSets) });
        } catch (error) {
            setMessage({ kind: "error", text: error instanceof Error ? error.message : String(error) });
        }
    };

    const reset = () => {
        clearLibrary(browserStorage());
        setLibrary(null);
        setMessage(null);
    };

    return { library, message, importFile, reset };
}
