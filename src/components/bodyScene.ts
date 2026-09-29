import {
    Box3,
    DirectionalLight,
    Group,
    HemisphereLight,
    Material,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Raycaster,
    Scene,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { muscleForModelMuscle } from "../core/anatomy";
import { heatColor } from "../core/heat";
import { MUSCLES } from "../core/muscles";
import type { Muscle } from "../core/muscles";
import type { BodyModel } from "../core/settings";

export type BodyView = "front" | "back";

/** Handle to the 3D figure created by createBodyScene. */
export interface BodyScene {
    /** Shows the male or female anatomy model (loaded on first use); rejects when it cannot be loaded. */
    setModel(model: BodyModel): Promise<void>;
    /** Colors every muscle group by its relative intensity (0 = untrained, 1 = most trained). */
    setIntensities(intensities: Record<Muscle, number>): void;
    /** Moves the camera in front of or behind the figure. */
    setView(view: BodyView): void;
    /** Releases all WebGL resources and listeners. */
    dispose(): void;
}

interface SceneCallbacks {
    /** Called while the pointer moves over the figure; muscle is null over untracked parts or the background. */
    onHover(muscle: Muscle | null, x: number, y: number): void;
}

/**
 * Models are embedded as data URLs and imported lazily, so only the selected one is decoded.
 * Both are CC BY-SA 4.0 (see assets/anatomy/NOTICE.md).
 */
const MODEL_SOURCES: Record<BodyModel, () => Promise<{ default: string }>> = {
    male: () => import("../../assets/anatomy/full-body-male-mobile.glb?url"),
    female: () => import("../../assets/anatomy/full-body-female-mobile.glb?url"),
};

const PALETTES = {
    light: { idle: 0xbdbdc4, untracked: 0xd8d8de },
    dark: { idle: 0x62626b, untracked: 0x3b3b42 },
};

const FIELD_OF_VIEW = 28;
const FRAMING_MARGIN = 1.12;
const PICK_INTERVAL_MS = 40;

/**
 * Loads and parses one anatomy model.
 * @param model male or female
 * @returns the model's scene graph, one mesh per muscle
 */
async function loadFigure(model: BodyModel): Promise<Group> {
    const { default: dataUrl } = await MODEL_SOURCES[model]();
    const buffer = await (await fetch(dataUrl)).arrayBuffer();
    return (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(buffer, "")).scene;
}

/**
 * Replaces the materials of a loaded model and tags every mesh with its app muscle group.
 * @param figure loaded model
 * @param muscleMaterials one shared material per muscle group
 * @param untrackedMaterial material for muscles and tissue the app does not track
 * @returns the meshes to test when picking
 */
function assignMaterials(
    figure: Group,
    muscleMaterials: Record<Muscle, MeshStandardMaterial>,
    untrackedMaterial: MeshStandardMaterial,
): Mesh[] {
    const meshes: Mesh[] = [];
    figure.traverse((object) => {
        if (!(object instanceof Mesh)) {
            return;
        }
        (object.material as Material).dispose();
        const muscle = muscleForModelMuscle(object.userData.group, object.userData.key);
        object.userData.muscle = muscle;
        object.material = muscle ? muscleMaterials[muscle] : untrackedMaterial;
        meshes.push(object);
    });
    return meshes;
}

/**
 * Creates an interactive 3D anatomy figure whose muscle groups can be colored.
 * @param host element that receives the canvas and defines its size
 * @param callbacks hover notifications
 * @returns handle to switch model, color, turn and dispose the figure
 * @throws Error when WebGL is unavailable
 */
export function createBodyScene(host: HTMLElement, callbacks: SceneCallbacks): BodyScene {
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    scene.add(new HemisphereLight(0xffffff, 0x555555, 1.6));
    const keyLight = new DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2, 3, 4);
    const backLight = new DirectionalLight(0xffffff, 1.4);
    backLight.position.set(-2, 2, -4);
    scene.add(keyLight, backLight);

    const muscleMaterials = Object.fromEntries(
        MUSCLES.map((muscle) => [muscle, new MeshStandardMaterial({ roughness: 0.6 })]),
    ) as Record<Muscle, MeshStandardMaterial>;
    const untrackedMaterial = new MeshStandardMaterial({ roughness: 0.7 });

    const camera = new PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 20);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    // Vertical swipes keep scrolling the page; horizontal swipes turn the figure
    renderer.domElement.style.touchAction = "pan-y";

    const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
    const figures = new Map<BodyModel, { figure: Group; meshes: Mesh[] }>();
    let current: { figure: Group; meshes: Mesh[] } | null = null;
    let intensities = Object.fromEntries(MUSCLES.map((muscle) => [muscle, 0])) as Record<Muscle, number>;
    let view: BodyView = "front";
    let modelRequest = 0;
    let disposed = false;

    const render = () => renderer.render(scene, camera);
    const applyColors = () => {
        const palette = darkMode.matches ? PALETTES.dark : PALETTES.light;
        untrackedMaterial.color.set(palette.untracked);
        for (const muscle of MUSCLES) {
            const intensity = intensities[muscle];
            muscleMaterials[muscle].color.set(intensity > 0 ? heatColor(intensity) : palette.idle);
        }
        render();
    };
    const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        render();
    };
    const placeCamera = (distance: number) => {
        camera.position.set(controls.target.x, controls.target.y, controls.target.z + (view === "front" ? distance : -distance));
        controls.update();
        render();
    };
    /** Centers the orbit on the figure and backs the camera off until the whole body fits. */
    const frameFigure = (figure: Group) => {
        const box = new Box3().setFromObject(figure);
        const size = box.getSize(new Vector3());
        controls.target.copy(box.getCenter(new Vector3()));
        const distance = (size.y / 2 / Math.tan((FIELD_OF_VIEW / 2) * (Math.PI / 180))) * FRAMING_MARGIN;
        controls.minDistance = distance * 0.55;
        controls.maxDistance = distance * 1.6;
        placeCamera(distance);
    };

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    let pendingPointer: PointerEvent | null = null;
    let pickTimer: number | undefined;
    const pick = () => {
        const event = pendingPointer;
        pendingPointer = null;
        pickTimer = undefined;
        if (!event || !current) {
            return;
        }
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(current.meshes, false)[0];
        callbacks.onHover((hit?.object.userData.muscle as Muscle | null | undefined) ?? null, event.clientX - rect.left, event.clientY - rect.top);
    };
    // Picking walks ~130k triangles, so coalesce pointer events to one test every PICK_INTERVAL_MS
    const handlePointer = (event: PointerEvent) => {
        pendingPointer = event;
        pickTimer ??= window.setTimeout(pick, PICK_INTERVAL_MS);
    };
    const cancelPick = () => {
        window.clearTimeout(pickTimer);
        pickTimer = undefined;
        pendingPointer = null;
    };
    const handleLeave = () => {
        cancelPick();
        callbacks.onHover(null, 0, 0);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("pointermove", handlePointer);
    canvas.addEventListener("pointerdown", handlePointer);
    canvas.addEventListener("pointerleave", handleLeave);
    controls.addEventListener("change", render);
    darkMode.addEventListener("change", applyColors);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    applyColors();

    return {
        async setModel(model) {
            const request = ++modelRequest;
            if (!figures.has(model)) {
                const figure = await loadFigure(model);
                figures.set(model, { figure, meshes: assignMaterials(figure, muscleMaterials, untrackedMaterial) });
            }
            // A newer request or dispose() may have happened while loading
            if (request !== modelRequest || disposed) {
                return;
            }
            if (current) {
                scene.remove(current.figure);
            }
            current = figures.get(model)!;
            scene.add(current.figure);
            frameFigure(current.figure);
        },
        setIntensities(next) {
            intensities = next;
            applyColors();
        },
        setView(next) {
            view = next;
            placeCamera(camera.position.distanceTo(controls.target));
        },
        dispose() {
            disposed = true;
            cancelPick();
            resizeObserver.disconnect();
            darkMode.removeEventListener("change", applyColors);
            canvas.removeEventListener("pointermove", handlePointer);
            canvas.removeEventListener("pointerdown", handlePointer);
            canvas.removeEventListener("pointerleave", handleLeave);
            controls.dispose();
            figures.forEach(({ meshes }) => meshes.forEach((mesh) => mesh.geometry.dispose()));
            [untrackedMaterial, ...Object.values(muscleMaterials)].forEach((material) => material.dispose());
            renderer.dispose();
            canvas.remove();
        },
    };
}
