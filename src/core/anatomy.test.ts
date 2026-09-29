import { describe, expect, it } from "vitest";
import femaleMap from "../../assets/anatomy/female-muscle-map.json";
import maleMap from "../../assets/anatomy/full-body-map.json";
import { muscleForModelMuscle } from "./anatomy";
import { MUSCLES } from "./muscles";

/** Groups deliberately left uncolored: no exercise of the app trains them. */
const UNTRACKED_GROUPS = ["Neck", "Sartorius", "Hip flexors", "Hip rotators", "Lower legs"];

describe("muscleForModelMuscle", () => {
    it("maps groups, with single-muscle overrides taking precedence", () => {
        expect(muscleForModelMuscle("Chest", "pectoralis_minor")).toBe("Brust");
        expect(muscleForModelMuscle("Glutes", "gluteus_maximus")).toBe("Gesäß");
        expect(muscleForModelMuscle("Glutes", "gluteus_medius")).toBe("Abduktoren");
        expect(muscleForModelMuscle("Hip flexors", "tensor_fasciae_latae")).toBe("Abduktoren");
    });

    it("returns null for untracked and missing groups", () => {
        expect(muscleForModelMuscle("Neck", "sternocleidomastoid")).toBeNull();
        expect(muscleForModelMuscle(undefined, undefined)).toBeNull();
    });
});

describe.each([
    ["male", maleMap.muscles],
    ["female", femaleMap.muscles],
])("bundled %s anatomy map", (_sex, muscles) => {
    it("has every group either mapped or deliberately untracked", () => {
        const unexpected = muscles.filter(
            ({ group, key }) => muscleForModelMuscle(group, key) === null && !UNTRACKED_GROUPS.includes(group),
        );
        expect(unexpected.map(({ id }) => id)).toEqual([]);
    });

    it("provides meshes for every muscle group of the app", () => {
        const covered = new Set(muscles.map(({ group, key }) => muscleForModelMuscle(group, key)));
        expect(MUSCLES.filter((muscle) => !covered.has(muscle))).toEqual([]);
    });
});
