import React, { useMemo, useState } from "react";

export interface Pin {
  id: string;
  label: string;
  signal_type: string;
  description?: string;
}

export interface CircuitComponent {
  id: string;
  name: string;
  category: string;
  description?: string;
  pins: Pin[];
}

export interface Connection {
  id: string;
  from_component_id: string;
  from_pin_id: string;
  to_component_id: string;
  to_pin_id: string;
  signal_type: string;
  wire_color?: string;
  description?: string;
}

export interface CircuitDiagramData {
  title?: string;
  summary?: string;
  components: CircuitComponent[];
  connections: Connection[];
}

interface Props {
  data: CircuitDiagramData;
  onSelectElement?: (info: string) => void;
}

const SIGNAL_COLORS: Record<string, string> = {
  power: "#e53935",
  ground: "#424242",
  digital: "#1e88e5",
  analog: "#00897b",
  pwm: "#8e24aa",
  i2c: "#fb8c00",
  spi: "#6d4c41",
  uart: "#43a047",
  other: "#9e9e9e",
};

const VALID_WIRE_COLORS = ["red", "black", "blue", "yellow", "green", "orange", "purple", "brown", "gray", "white"];

function getWireColor(conn: Connection): string {
  if (conn.wire_color && VALID_WIRE_COLORS.includes(conn.wire_color)) {
    return conn.wire_color;
  }
  return SIGNAL_COLORS[conn.signal_type] || "#888";
}

function getPinColor(pin: Pin): string {
  return SIGNAL_COLORS[pin.signal_type] || "#888";
}

export function SchematicSVGCanvas({ data, onSelectElement }: Props) {
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);

  const layout = useMemo(() => {
    const { components, connections } = data;
    if (!components || components.length === 0) return null;

    const adj = new Map<string, string[]>();
    components.forEach((c) => adj.set(c.id, []));
    connections.forEach((conn) => {
      adj.get(conn.from_component_id)?.push(conn.to_component_id);
      adj.get(conn.to_component_id)?.push(conn.from_component_id);
    });

    const layer = new Map<string, number>();
    let roots = components.filter((c) => c.category === "Microcontroller").map((c) => c.id);
    if (roots.length === 0) {
      let best: string | null = null;
      let bestDeg = -1;
      components.forEach((c) => {
        const deg = adj.get(c.id)?.length || 0;
        if (deg > bestDeg) {
          bestDeg = deg;
          best = c.id;
        }
      });
      if (best) roots = [best];
    }

    const queue: string[] = [];
    roots.forEach((id) => {
      layer.set(id, 0);
      queue.push(id);
    });

    while (queue.length > 0) {
      const id = queue.shift()!;
      const d = layer.get(id)!;
      adj.get(id)?.forEach((otherId) => {
        if (!layer.has(otherId)) {
          layer.set(otherId, d + 1);
          queue.push(otherId);
        }
      });
    }

    let maxLayer = -1;
    layer.forEach((v) => (maxLayer = Math.max(maxLayer, v)));
    components.forEach((c) => {
      if (!layer.has(c.id)) layer.set(c.id, maxLayer + 1);
    });

    const boxWidth = 200;
    const headerHeight = 46;
    const pinRowHeight = 22;
    const colGap = 200;
    const rowGap = 46;

    const byLayer = new Map<number, CircuitComponent[]>();
    components.forEach((c) => {
      const l = layer.get(c.id)!;
      if (!byLayer.has(l)) byLayer.set(l, []);
      byLayer.get(l)!.push(c);
    });

    const pinSideMap: Record<string, Record<string, "left" | "right">> = {};
    components.forEach((c) => {
      pinSideMap[c.id] = {};
      c.pins.forEach((p) => (pinSideMap[c.id][p.id] = "right"));
    });

    connections.forEach((conn) => {
      const fromL = layer.get(conn.from_component_id);
      const toL = layer.get(conn.to_component_id);
      if (fromL != null && toL != null) {
        if (fromL <= toL) {
          pinSideMap[conn.from_component_id][conn.from_pin_id] = "right";
          pinSideMap[conn.to_component_id][conn.to_pin_id] = "left";
        } else {
          pinSideMap[conn.from_component_id][conn.from_pin_id] = "left";
          pinSideMap[conn.to_component_id][conn.to_pin_id] = "right";
        }
      }
    });

    const positions: Record<string, { x: number; y: number; width: number; height: number; headerHeight: number; pinRowHeight: number }> = {};
    const pinLayout: Record<string, Record<string, { side: "left" | "right"; index: number }>> = {};

    let x = 40;
    const sortedLayers = Array.from(byLayer.keys()).sort((a, b) => a - b);

    sortedLayers.forEach((l) => {
      let y = 40;
      byLayer.get(l)!.forEach((comp) => {
        const leftPins = comp.pins.filter((p) => pinSideMap[comp.id][p.id] === "left");
        const rightPins = comp.pins.filter((p) => pinSideMap[comp.id][p.id] !== "left");
        const rowCount = Math.max(1, leftPins.length, rightPins.length);
        const height = headerHeight + rowCount * pinRowHeight + 14;

        positions[comp.id] = { x, y, width: boxWidth, height, headerHeight, pinRowHeight };
        pinLayout[comp.id] = {};

        leftPins.forEach((p, i) => (pinLayout[comp.id][p.id] = { side: "left", index: i }));
        rightPins.forEach((p, i) => (pinLayout[comp.id][p.id] = { side: "right", index: i }));

        y += height + rowGap;
      });
      x += boxWidth + colGap;
    });

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    Object.values(positions).forEach((b) => {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    });

    const wires = connections.map((conn) => {
      const fromBox = positions[conn.from_component_id];
      const toBox = positions[conn.to_component_id];
      const fromPL = pinLayout[conn.from_component_id]?.[conn.from_pin_id];
      const toPL = pinLayout[conn.to_component_id]?.[conn.to_pin_id];

      if (!fromBox || !toBox || !fromPL || !toPL) return null;

      const p1 = {
        x: fromPL.side === "left" ? fromBox.x : fromBox.x + fromBox.width,
        y: fromBox.y + fromBox.headerHeight + fromPL.index * fromBox.pinRowHeight + fromBox.pinRowHeight / 2,
      };

      const p2 = {
        x: toPL.side === "left" ? toBox.x : toBox.x + toBox.width,
        y: toBox.y + toBox.headerHeight + toPL.index * toBox.pinRowHeight + toBox.pinRowHeight / 2,
      };

      const dx = Math.max(50, Math.abs(p2.x - p1.x) * 0.5);
      const c1x = p1.x + (fromPL.side === "right" ? dx : -dx);
      const c2x = p2.x + (toPL.side === "right" ? dx : -dx);

      minX = Math.min(minX, c1x, p1.x);
      minY = Math.min(minY, p1.y, p2.y);
      maxX = Math.max(maxX, c2x, p2.x);
      maxY = Math.max(maxY, p1.y, p2.y);

      return {
        id: conn.id,
        path: `M ${p1.x},${p1.y} C ${c1x},${p1.y} ${c2x},${p2.y} ${p2.x},${p2.y}`,
        color: getWireColor(conn),
        description: conn.description,
      };
    }).filter((w): w is NonNullable<typeof w> => w !== null);

    const pad = 30;
    const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;

    return { positions, pinLayout, wires, viewBox };
  }, [data]);

  if (!layout) return <div className="p-4 text-gray-500">Keine Schaltplan-Daten vorhanden.</div>;

  return (
    <div className="w-full h-full bg-[#14161a] border border-[#33363e] rounded-xl overflow-auto p-4">
      <svg
        viewBox={layout.viewBox}
        className="w-full h-auto min-h-[500px]"
        style={{ display: "block" }}
      >
        {layout.wires.map((w) => {
          const isHl = hoveredConnId === w.id;
          return (
            <path
              key={w.id}
              d={w.path}
              fill="none"
              stroke={w.color}
              strokeWidth={isHl ? 5 : 2.5}
              opacity={hoveredConnId && !isHl ? 0.3 : 1}
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredConnId(w.id)}
              onMouseLeave={() => setHoveredConnId(null)}
              onClick={() => onSelectElement?.(w.description || `Verbindung ${w.id}`)}
            >
              <title>{w.description}</title>
            </path>
          );
        })}

        {data.components.map((comp) => {
          const box = layout.positions[comp.id];
          if (!box) return null;

          return (
            <g key={comp.id} className="cursor-pointer">
              <rect
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                rx={8}
                fill="#1d2026"
                stroke="#33363e"
                strokeWidth={1.5}
                onClick={() => onSelectElement?.(`${comp.name}: ${comp.description}`)}
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

                const pt = {
                  x: pl.side === "left" ? box.x : box.x + box.width,
                  y: box.y + box.headerHeight + pl.index * box.pinRowHeight + box.pinRowHeight / 2,
                };

                return (
                  <g key={pin.id}>
                    <text
                      x={pl.side === "left" ? box.x + 11 : box.x + box.width - 11}
                      y={pt.y + 4}
                      textAnchor={pl.side === "left" ? "start" : "end"}
                      fill="#e8e9ec"
                      fontSize={11}
                    >
                      {pin.label}
                    </text>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={5}
                      fill={getPinColor(pin)}
                      stroke="#1d2026"
                      strokeWidth={1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectElement?.(`Pin ${pin.label} (${comp.name}): ${pin.description}`);
                      }}
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
  );
}