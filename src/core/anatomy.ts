import type { Muscle } from "./muscles";

/**
 * Maps the training groups of the anatomy model (glTF extras `group`) to the muscle groups of the app.
 * Groups that are missing here (neck, sartorius, hip rotators, lower legs, ...) are not trained by any
 * exercise of the app and stay uncolored.
 */
const MUSCLE_BY_MODEL_GROUP: Record<string, Muscle> = {
    Chest: "Brust",
    Serratus: "Brust",
    Deltoids: "Schultern",
    "Rotator cuff": "Schultern",
    Triceps: "Trizeps",
    Biceps: "Bizeps",
    "Upper arms": "Bizeps",
    Forearms: "Unterarme",
    Lats: "Latissimus",
    "Teres major": "Latissimus",
    "Upper back": "Oberer Rücken",
    Trapezius: "Trapez",
    "Spinal extensors": "Unterer Rücken",
    "Lower back": "Unterer Rücken",
    Abdominals: "Bauch",
    Obliques: "Bauch",
    Quadriceps: "Quadrizeps",
    Hamstrings: "Beinbeuger",
    Glutes: "Gesäß",
    Adductors: "Adduktoren",
    Calves: "Waden",
};

/** Single muscles that belong to a different app muscle group than their model group suggests. */
const MUSCLE_BY_MODEL_KEY: Record<string, Muscle> = {
    gluteus_medius: "Abduktoren",
    gluteus_minimus: "Abduktoren",
    tensor_fasciae_latae: "Abduktoren",
};

/**
 * Finds the app muscle group of one muscle of the anatomy model.
 * @param group training group from the model (`extras.group`)
 * @param key muscle key from the model (`extras.key`)
 * @returns the app muscle group, or null when the muscle is not tracked
 */
export function muscleForModelMuscle(group: unknown, key: unknown): Muscle | null {
    return MUSCLE_BY_MODEL_KEY[String(key)] ?? MUSCLE_BY_MODEL_GROUP[String(group)] ?? null;
}
