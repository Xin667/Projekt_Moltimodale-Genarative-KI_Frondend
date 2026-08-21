import { useMemo, useState } from 'react';
import type {
  CircuitComponent,
  CircuitDiagram,
  ComponentPin,
  Connection,
} from './types';
import { buildLayout, pinColor, wireColor } from './layout';

/** Was der Nutzer im Schaltplan angeklickt hat — wird im Detail-Panel angezeigt. */
export type SchematicSelection =
  | { kind: 'component'; component: CircuitComponent }
  | { kind: 'connection'; connection: Connection }
  | { kind: 'pin'; component: CircuitComponent; pin: ComponentPin };

interface SchematicCanvasProps {
  data: CircuitDiagram;
  /** null = alle normal; sonst genau diese Verbindungen hervorheben (Rest dimmen). */
  highlightedConnectionIds: Set<string> | null;
  onSelect: (selection: SchematicSelection) => void;
}

export function SchematicCanvas({
  data,
  highlightedConnectionIds,
  onSelect,
}: SchematicCanvasProps) {
  const [hoveredConnectionIds, setHoveredConnectionIds] = useState<Set<string> | null>(null);
  const [zoom, setZoom] = useState(1);

  const layout = useMemo(() => buildLayout(data), [data]);

  // Welche Verbindungen berühren ein Bauteil bzw. einen konkreten Pin? (für Hover-Highlighting)
  const componentConnections = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const conn of data.connections) {
      for (const id of [conn.from_component_id, conn.to_component_id]) {
        const list = map.get(id) ?? [];
        list.push(conn.id);
        map.set(id, list);
      }
    }
    return map;
  }, [data.connections]);

  const pinConnections = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const conn of data.connections) {
      const entries = [
        `${conn.from_component_id}:${conn.from_pin_id}`,
        `${conn.to_component_id}:${conn.to_pin_id}`,
      ];
      for (const key of entries) {
        const list = map.get(key) ?? [];
        list.push(conn.id);
        map.set(key, list);
      }
    }
    return map;
  }, [data.connections]);

  // Aktuell fokussierte Verbindungen: Hover gewinnt, sonst der aktive Montageschritt.
  const focusIds = hoveredConnectionIds ?? highlightedConnectionIds;

  const focusedComponents = useMemo(() => {
    if (!focusIds) return null;
    const set = new Set<string>();
    for (const comp of data.components) {
      if ((componentConnections.get(comp.id) ?? []).some((id) => focusIds.has(id))) {
        set.add(comp.id);
      }
    }
    return set;
  }, [focusIds, data.components, componentConnections]);

  if (data.components.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-sm text-[#9aa0ac]">
        Keine Schaltplan-Daten vorhanden.
      </div>
    );
  }

  const dimComponents = focusIds !== null && focusedComponents !== null;

  return (
    <div className="flex h-full flex-col bg-[#14161a]">
      {/* Zoom-Kontrolle */}
      <div className="flex items-center gap-2 border-b border-[#33363e] px-4 py-2 text-xs text-[#9aa0ac]">
        <span className="mr-auto font-medium">Schaltplan</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          className="rounded border border-[#33363e] px-2 py-1 hover:bg-[#1d2026]"
          aria-label="Verkleinern"
        >
          −
        </button>
        <span className="min-w-[40px] text-center tabular-nums">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          className="rounded border border-[#33363e] px-2 py-1 hover:bg-[#1d2026]"
          aria-label="Vergrößern"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="rounded border border-[#33363e] px-2 py-1 hover:bg-[#1d2026]"
        >
          Reset
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <svg
          viewBox={layout.viewBox}
          width={Math.max(50, layout.width * zoom)}
          height={Math.max(50, layout.height * zoom)}
          style={{ display: 'block' }}
        >
          {/* Kabel zuerst zeichnen, damit die Boxen darüber liegen */}
          {layout.wires.map(({ connection, path }) => {
            const focused = focusIds ? focusIds.has(connection.id) : true;
            const dimmed = focusIds !== null && !focused;
            return (
              <path
                key={connection.id}
                d={path}
                fill="none"
                stroke={wireColor(connection)}
                strokeWidth={focused ? 4 : 2.5}
                opacity={dimmed ? 0.15 : 1}
                className="cursor-pointer transition-all"
                onClick={() => onSelect({ kind: 'connection', connection })}
                onMouseEnter={() => setHoveredConnectionIds(new Set([connection.id]))}
                onMouseLeave={() => setHoveredConnectionIds(null)}
              >
                <title>{connection.description}</title>
              </path>
            );
          })}

          {data.components.map((comp) => {
            const box = layout.positions[comp.id];
            if (!box) return null;
            const dimmed = dimComponents && !focusedComponents!.has(comp.id);
            const hoverIds = componentConnections.get(comp.id) ?? [];

            return (
              <g
                key={comp.id}
                className="cursor-pointer"
                opacity={dimmed ? 0.35 : 1}
                onClick={() => onSelect({ kind: 'component', component: comp })}
                onMouseEnter={() => setHoveredConnectionIds(new Set(hoverIds))}
                onMouseLeave={() => setHoveredConnectionIds(null)}
              >
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  rx={8}
                  fill="#1d2026"
                  stroke="#33363e"
                  strokeWidth={1.5}
                />
                <text
                  x={box.x + box.width / 2}
                  y={box.y + 19}
                  textAnchor="middle"
                  fill="#e8e9ec"
                  fontSize={13}
                  fontWeight={600}
                >
                  {comp.name}
                </text>
                <text
                  x={box.x + box.width / 2}
                  y={box.y + 33}
                  textAnchor="middle"
                  fill="#9aa0ac"
                  fontSize={10}
                >
                  {comp.category}
                </text>

                {comp.pins.map((pin) => {
                  const pl = layout.pinLayout[comp.id]?.[pin.id];
                  if (!pl) return null;
                  const px = pl.side === 'left' ? box.x : box.x + box.width;
                  const py =
                    box.y + box.headerHeight + pl.index * box.pinRowHeight + box.pinRowHeight / 2;
                  const pinKey = `${comp.id}:${pin.id}`;
                  const pinHoverIds = pinConnections.get(pinKey) ?? [];

                  return (
                    <g key={pin.id}>
                      <text
                        x={pl.side === 'left' ? box.x + 11 : box.x + box.width - 11}
                        y={py + 4}
                        textAnchor={pl.side === 'left' ? 'start' : 'end'}
                        fill="#e8e9ec"
                        fontSize={11}
                        style={{ pointerEvents: 'none' }}
                      >
                        {pin.label}
                      </text>
                      <circle
                        cx={px}
                        cy={py}
                        r={5}
                        fill={pinColor(pin.signal_type)}
                        stroke="#1d2026"
                        strokeWidth={1}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect({ kind: 'pin', component: comp, pin });
                        }}
                        onMouseEnter={() => setHoveredConnectionIds(new Set(pinHoverIds))}
                        onMouseLeave={() => setHoveredConnectionIds(null)}
                      >
                        <title>{`${pin.label}: ${pin.description}`}</title>
                      </circle>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
