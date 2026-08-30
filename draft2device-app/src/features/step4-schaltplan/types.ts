/**
 * Schema für ein "Projekt", das vom LLM Schritt für Schritt erzeugt/aktualisiert wird.
 * Bewusst simpel gehalten, damit ein LLM es zuverlässig als JSON ausgeben kann
 * (z.B. über Structured Outputs / Tool-Calls).
 */

/** Name des zu rendernden wokwi-Custom-Elements, z.B. "wokwi-led". */
export type PartType =
  | "wokwi-esp32-devkit-v1"
  | "wokwi-led"
  | "wokwi-pushbutton"
  | "wokwi-resistor"
  | "wokwi-dht22";

export interface Part {
  /** Eindeutige ID, wird in Connections referenziert */
  id: string;
  type: PartType;
  /** Position der linken oberen Ecke auf der Zeichenfläche (px) */
  x: number;
  y: number;
  /** Nur 0 / 90 / 180 / 270 unterstützt (siehe SchematicCanvas) */
  rotation?: 0 | 90 | 180 | 270;
  /** Bauteil-spezifische Attribute, z.B. { color: "red" } bei einer LED */
  attrs?: Record<string, string>;
}

export interface Connection {
  /** Format "<partId>:<pinName>", z.B. "esp32:D2" */
  from: string;
  to: string;
  /** Optional: Farbe des Drahts im Diagramm (z.B. nach Signalart) */
  color?: string;
}

export interface Project {
  id: string;
  title: string;
  parts: Part[];
  connections: Connection[];
}
