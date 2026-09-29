import type { ValueFormat } from "./core/format";
import type { ExerciseKind } from "./core/sets";
import type { RecordKey, SessionMetric } from "./core/stats";

/** Chartable metrics per exercise kind, first entry is the default. */
export const METRICS_BY_KIND: Record<ExerciseKind, SessionMetric[]> = {
    strength: ["e1rm", "maxWeight", "volume", "maxReps"],
    reps: ["maxReps"],
    cardio: ["distance", "seconds"],
};

/** RPE metrics per exercise kind, offered in the chart picker only when the exercise has RPE data. */
export const OPTIONAL_METRICS_BY_KIND: Record<ExerciseKind, SessionMetric[]> = {
    strength: ["e1rmRpe", "avgRpe"],
    reps: ["avgRpe"],
    cardio: ["avgRpe"],
};

export const METRIC_LABELS: Record<SessionMetric, string> = {
    e1rm: "1RM",
    e1rmRpe: "RPE-1RM",
    avgRpe: "Ø RPE",
    maxWeight: "Gewicht",
    volume: "Volumen",
    bestSetVolume: "Bestes Set",
    maxReps: "Wdh.",
    distance: "Distanz",
    seconds: "Dauer",
};

export const METRIC_FORMATS: Record<SessionMetric, ValueFormat> = {
    e1rm: "weight",
    e1rmRpe: "weight",
    avgRpe: "rpe",
    maxWeight: "weight",
    volume: "weight",
    bestSetVolume: "weight",
    maxReps: "reps",
    distance: "distance",
    seconds: "time",
};

export const RECORD_LABELS: Record<RecordKey, string> = {
    maxWeight: "Max. Gewicht",
    best1RM: "Bestes 1RM (geschätzt)",
    bestSetVolume: "Bestes Set (Volumen)",
    maxWorkoutVolume: "Bestes Workout (Volumen)",
    maxReps: "Max. Wiederholungen",
    maxDistance: "Längste Distanz",
    longestTime: "Längste Dauer",
};

export const KIND_LABELS: Record<ExerciseKind, string> = {
    strength: "Kraft",
    reps: "Wiederholungen",
    cardio: "Cardio",
};

/** Empty-state hint of the tabs that need an imported library. */
export const IMPORT_FIRST_HINT = "Importiere zuerst deine Strong-CSV in der Übersicht.";
