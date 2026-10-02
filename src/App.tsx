import { useMemo, useState } from "react";
import { TabBar } from "./components/TabBar";
import type { TabItem } from "./components/TabBar";
import type { Library } from "./core/types";
import { Body } from "./screens/Body";
import { Exercises } from "./screens/Exercises";
import { History } from "./screens/History";
import { Muscles } from "./screens/Muscles";
import { Overview } from "./screens/Overview";
import { Records } from "./screens/Records";
import { Settings } from "./screens/Settings";
import { useLibrary } from "./useLibrary";
import { useSettings } from "./useSettings";
import styles from "./App.module.scss";

type Tab = "overview" | "history" | "exercises" | "records" | "muscles" | "body" | "settings";

const EMPTY_LIBRARY: Library = { unit: "kg", sets: [] };

const TABS: TabItem<Tab>[] = [
    { id: "overview", label: "Übersicht", icon: <path d="M4 20V11M10 20V4M16 20v-6M22 20H2" /> },
    {
        id: "history",
        label: "Verlauf",
        icon: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
    },
    { id: "exercises", label: "Übungen", icon: <path d="M6 7v10M3 10v4M18 7v10M21 10v4M6 12h12" /> },
    { id: "records", label: "Rekorde", icon: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.2 6.5 20.2l1-6.2L3 9.6l6.2-.9z" /> },
    { id: "muscles", label: "Muskeln", icon: <path d="M2 12h5l3-8 4 16 3-8h5" /> },
    {
        id: "body",
        label: "Körper",
        icon: (
            <>
                <circle cx="12" cy="4.5" r="2.5" />
                <path d="M5 9.5l7 1.5 7-1.5M12 11v4M12 15l-3 6.5M12 15l3 6.5" />
            </>
        ),
    },
    {
        id: "settings",
        label: "Einstellungen",
        icon: (
            <>
                <path d="M3 6h9M17 6h4M3 12h4M12 12h9M3 18h11M19 18h2" />
                <circle cx="14.5" cy="6" r="2.5" />
                <circle cx="9.5" cy="12" r="2.5" />
                <circle cx="16.5" cy="18" r="2.5" />
            </>
        ),
    },
];

/** Root component: tab navigation over the locally stored Strong library. */
export default function App() {
    const { library, message, importFile, reset } = useLibrary();
    const { settings, updateSettings } = useSettings();
    const [tab, setTab] = useState<Tab>("overview");
    const [exercise, setExercise] = useState<string | null>(null);
    const now = useMemo(() => new Date(), []);
    const { sets, unit } = library ?? EMPTY_LIBRARY;

    const openExercise = (name: string | null) => {
        setExercise(name);
        setTab("exercises");
    };

    return (
        <>
            <main className={styles.content}>
                {tab === "overview" && (
                    <Overview sets={sets} unit={unit} now={now} showTrendlines={settings.showTrendlines} message={message} onFile={importFile} onReset={reset} onSelectExercise={openExercise} />
                )}
                {tab === "history" && <History sets={sets} unit={unit} />}
                {tab === "exercises" && <Exercises sets={sets} unit={unit} now={now} showTrendlines={settings.showTrendlines} selected={exercise} onSelect={openExercise} />}
                {tab === "records" && <Records sets={sets} unit={unit} onSelectExercise={openExercise} />}
                {tab === "muscles" && <Muscles sets={sets} now={now} model={settings.bodyModel} showTrendlines={settings.showTrendlines} />}
                {tab === "body" && <Body sets={sets} unit={unit} bodyModel={settings.bodyModel} now={now} />}
                {tab === "settings" && <Settings settings={settings} onChange={updateSettings} />}
            </main>
            <TabBar tabs={TABS} active={tab} onSelect={setTab} />
        </>
    );
}
