import React, { useEffect, useRef } from "react";
import type { Part } from "./types";

// Globale Typ-Deklaration für benutzerdefinierte Wokwi-Web-Components (Custom Elements)
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

/** Von @wokwi/elements zur Laufzeit bereitgestellte Pin-Infos (siehe Paket-Typings). */
interface ElementPin {
  name: string;
  x: number;
  y: number;
  number?: string | number;
}

interface WokwiElementInstance extends HTMLElement {
  readonly pinInfo?: ElementPin[];
}

interface PartElementProps {
  part: Part;
  /** Wird aufgerufen, sobald die Pin-Positionen (in Canvas-Koordinaten) bekannt sind */
  onPinsResolved: (partId: string, pins: Record<string, { x: number; y: number }>) => void;
}

/** Dreht einen Punkt (px, py) um den Mittelpunkt (cx, cy) um `deg` Grad. */
function rotatePoint(px: number, py: number, cx: number, cy: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

/**
 * Platziert ein einzelnes wokwi-Element auf der Canvas und meldet dessen
 * absolute Pin-Koordinaten nach oben, damit SchematicCanvas Drähte zeichnen kann.
 *
 * Hinweis: Für die Rotation wird die tatsächlich gerenderte Bounding Box
 * (getBoundingClientRect) als Mittelpunkt genutzt – das funktioniert zuverlässig,
 * weil wokwi-Elemente ohne zusätzliche CSS-Transforms in ihrer nativen Pixelgröße
 * rendern. `pinInfo` liefert die Pin-Koordinaten im selben (unrotierten) Koordinatenraum.
 */
export function PartElement({ part, onPinsResolved }: PartElementProps) {
  const ref = useRef<WokwiElementInstance | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // pinInfo ist bei LitElement-Komponenten teils erst nach dem ersten Render verfügbar,
    // daher einmal per rAF verzögert lesen.
    const raf = requestAnimationFrame(() => {
      const pins = el.pinInfo ?? [];
      const rect = el.getBoundingClientRect();
      const rotation = part.rotation ?? 0;
      const cx = part.x + rect.width / 2;
      const cy = part.y + rect.height / 2;

      const resolved: Record<string, { x: number; y: number }> = {};
      for (const pin of pins) {
        const abs = rotatePoint(part.x + pin.x, part.y + pin.y, cx, cy, rotation);
        resolved[pin.name] = abs;
      }
      onPinsResolved(part.id, resolved);
    });

    return () => cancelAnimationFrame(raf);
  }, [part.id, part.type, part.x, part.y, part.rotation, onPinsResolved]);

  const style: React.CSSProperties = {
    position: "absolute",
    left: part.x,
    top: part.y,
    transform: part.rotation ? `rotate(${part.rotation}deg)` : undefined,
    transformOrigin: "center center",
  };

  // Zweifacher Type-Cast stellt sicher, dass 'part.type' (z. B. 'wokwi-led') als React.ElementType akzeptiert wird
  const Tag = part.type as unknown as React.ElementType;

  return <Tag ref={ref as never} style={style} {...(part.attrs ?? {})} />;
}