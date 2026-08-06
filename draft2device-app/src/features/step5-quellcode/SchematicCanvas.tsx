import { useMemo, useState } from "react";
import type { Project } from "../types";
import { PartElement } from "./PartElement";

type PinMap = Record<string, Record<string, { x: number; y: number }>>;

interface SchematicCanvasProps {
  project: Project;
  width?: number;
  height?: number;
}

/**
 * Rendert ein Projekt-JSON (Bauteile + Verbindungen) als interaktives Breadboard-Schema.
 * Bauteile kommen aus @wokwi/elements, Drähte sind eine eigene SVG-Overlay-Schicht.
 */
export function SchematicCanvas({ project, width = 900, height = 560 }: SchematicCanvasProps) {
  const [pinsByPart, setPinsByPart] = useState<PinMap>({});

  const handlePinsResolved = (
    partId: string,
    pins: Record<string, { x: number; y: number }>
  ) => {
    setPinsByPart((prev) => ({ ...prev, [partId]: pins }));
  };

  const resolvePin = (ref: string) => {
    const [partId, pinName] = ref.split(":");
    return pinsByPart[partId]?.[pinName];
  };

  const wires = useMemo(() => {
    return project.connections
      .map((conn, i) => {
        const a = resolvePin(conn.from);
        const b = resolvePin(conn.to);
        if (!a || !b) return null;
        return { key: `${conn.from}->${conn.to}-${i}`, a, b, color: conn.color ?? "#e07b39" };
      })
      .filter((w): w is NonNullable<typeof w> => w !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinsByPart, project.connections]);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        background: "#f7f4ee",
        border: "1px solid #ddd6c8",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Bauteil-Ebene */}
      {project.parts.map((part) => (
        <PartElement key={part.id} part={part} onPinsResolved={handlePinsResolved} />
      ))}

      {/* Draht-Ebene: liegt über den Bauteilen, blockiert aber keine Klicks auf sie */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        {wires.map((w) => (
          <line
            key={w.key}
            x1={w.a.x}
            y1={w.a.y}
            x2={w.b.x}
            y2={w.b.y}
            stroke={w.color}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}
        {wires.map((w) => (
          <g key={`${w.key}-dots`}>
            <circle cx={w.a.x} cy={w.a.y} r={3.5} fill={w.color} />
            <circle cx={w.b.x} cy={w.b.y} r={3.5} fill={w.color} />
          </g>
        ))}
      </svg>
    </div>
  );
}
