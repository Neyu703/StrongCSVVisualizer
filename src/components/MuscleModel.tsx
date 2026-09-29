import { useEffect, useMemo, useRef, useState } from "react";
import { formatNumber } from "../core/format";
import { heatColor, toCssColor } from "../core/heat";
import type { Muscle, MuscleIntensity } from "../core/muscles";
import type { BodyModel } from "../core/settings";
import { Card } from "./Card";
import { createBodyScene } from "./bodyScene";
import type { BodyScene, BodyView } from "./bodyScene";
import { ModelCredit } from "./ModelCredit";
import { SegmentedControl } from "./SegmentedControl";
import type { SegmentOption } from "./SegmentedControl";
import styles from "./MuscleModel.module.scss";

const VIEWS: SegmentOption<BodyView>[] = [
    { value: "front", label: "Vorne" },
    { value: "back", label: "Hinten" },
];

const LEGEND_GRADIENT = `linear-gradient(to right, ${[0, 0.5, 1].map((step) => toCssColor(heatColor(step))).join(", ")})`;

type LoadState = "loading" | "ready" | "unavailable";

interface HoverLabel {
    muscle: Muscle;
    x: number;
    y: number;
}

interface MuscleModelProps {
    entries: MuscleIntensity[];
    model: BodyModel;
}

/** Rotatable 3D anatomy figure whose muscle groups are colored by training intensity. */
export function MuscleModel({ entries, model }: MuscleModelProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<BodyScene | null>(null);
    const [view, setView] = useState<BodyView>("front");
    const [hover, setHover] = useState<HoverLabel | null>(null);
    const [loadState, setLoadState] = useState<LoadState>("loading");

    const intensities = useMemo(
        () => Object.fromEntries(entries.map(({ muscle, intensity }) => [muscle, intensity])) as Record<Muscle, number>,
        [entries],
    );

    useEffect(() => {
        try {
            const scene = createBodyScene(hostRef.current!, {
                onHover: (muscle, x, y) => setHover(muscle ? { muscle, x, y } : null),
            });
            sceneRef.current = scene;
            return () => {
                scene.dispose();
                sceneRef.current = null;
            };
        } catch {
            setLoadState("unavailable");
            return undefined;
        }
    }, []);
    useEffect(() => sceneRef.current?.setIntensities(intensities), [intensities]);
    useEffect(() => sceneRef.current?.setView(view), [view]);
    useEffect(() => {
        setLoadState((state) => (state === "unavailable" ? state : "loading"));
        sceneRef.current
            ?.setModel(model)
            .then(() => setLoadState((state) => (state === "unavailable" ? state : "ready")))
            .catch(() => setLoadState("unavailable"));
    }, [model]);

    const hovered = hover && entries.find((entry) => entry.muscle === hover.muscle);
    return (
        <Card title="3D-Ansicht">
            <SegmentedControl label="Ansicht" options={VIEWS} value={view} onChange={setView} />
            <div className={styles.stage}>
                <div ref={hostRef} className={styles.host} />
                {loadState === "loading" && <p className={styles.status}>Modell wird geladen …</p>}
                {loadState === "unavailable" && (
                    <p className={styles.status}>3D-Ansicht nicht verfügbar (WebGL oder Modell nicht ladbar).</p>
                )}
                {hover && hovered && (
                    <div className={styles.label} style={{ left: hover.x, top: hover.y }}>
                        <strong>{hovered.muscle}</strong> · {formatNumber(hovered.load, 1)} Sätze
                    </div>
                )}
            </div>
            <div className={styles.legend}>
                <span>wenig</span>
                <span className={styles.gradient} style={{ background: LEGEND_GRADIENT }} />
                <span>viel</span>
            </div>
            <p className={styles.hint}>
                Ziehen zum Drehen, Tippen oder Darüberfahren für Details. Graue Muskeln wurden nicht trainiert oder werden
                von der App nicht erfasst.
            </p>
            <ModelCredit />
        </Card>
    );
}
