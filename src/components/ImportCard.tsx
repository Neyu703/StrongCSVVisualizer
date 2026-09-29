import { useRef, useState } from "react";
import type { DragEvent } from "react";
import styles from "./ImportCard.module.scss";

export interface ImportMessage {
    kind: "success" | "error";
    text: string;
}

interface ImportCardProps {
    hasData: boolean;
    message: ImportMessage | null;
    onFile: (file: File) => void;
}

/** Drop zone and file picker for Strong CSV exports. */
export function ImportCard({ hasData, message, onFile }: ImportCardProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (files: FileList | null) => {
        const file = files?.[0];
        if (file) {
            onFile(file);
        }
    };

    const handleDrop = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
    };

    return (
        <section
            className={isDragging ? styles.dragging : styles.zone}
            onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <h2 className={styles.title}>{hasData ? "Neuere CSV importieren" : "Strong-CSV importieren"}</h2>
            <p className={styles.text}>
                Ziehe deine Strong-Exportdatei hierher oder wähle sie aus. Gespeicherte Workouts bleiben
                unverändert – es werden nur neue hinzugefügt.
            </p>
            <button type="button" className={styles.button} onClick={() => inputRef.current?.click()}>
                CSV auswählen
            </button>
            <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                }}
            />
            {message && (
                <p role="status" className={message.kind === "error" ? styles.error : styles.success}>
                    {message.text}
                </p>
            )}
        </section>
    );
}
