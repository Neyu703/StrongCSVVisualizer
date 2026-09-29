import styles from "./ModelCredit.module.scss";

/** Attribution required by the CC BY-SA 4.0 license of the anatomy models (see assets/anatomy/NOTICE.md). */
export function ModelCredit() {
    return (
        <p className={styles.credit}>
            3D-Modell:{" "}
            <a href="https://github.com/Z-Anatomy/Models-of-human-anatomy" target="_blank" rel="noreferrer">
                Z-Anatomy
            </a>{" "}
            /{" "}
            <a href="https://github.com/Kevin-Mattheus-Moerman/BodyParts3D" target="_blank" rel="noreferrer">
                BodyParts3D
            </a>
            , als Trainings-Atlas aufbereitet von{" "}
            <a href="https://github.com/slfresh/fitmitwith-anatomy-atlas" target="_blank" rel="noreferrer">
                slfresh
            </a>
            , unverändert eingebunden. Lizenz:{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
                CC BY-SA 4.0
            </a>
            .
        </p>
    );
}
