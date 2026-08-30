import type {
  CircuitComponent,
  CircuitDiagram,
  Connection,
  SignalType,
} from './types';

/**
 * Reine Layout-Mathematik für den Schaltplan — ohne React-Abhängigkeit.
 *
 * Statt fester x/y-Koordinaten (die ein LLM nicht zuverlässig liefern kann)
 * wird ein simples "von links nach rechts"-Layout berechnet: die Distanz
 * jedes Bauteils zum Microcontroller (BFS) bestimmt die Spalte. So fließen
 * Kabel überwiegend in EINE Richtung, statt wild im Grid hin und her zu
 * springen.
 */

/** Signalfarben für Pin-Punkte (und als Fallback-Farbe für Kabel). */
export const SIGNAL_COLORS: Record<SignalType, string> = {
  power: '#e53935',
  ground: '#424242',
  digital: '#1e88e5',
  analog: '#00897b',
  pwm: '#8e24aa',
  i2c: '#fb8c00',
  spi: '#6d4c41',
  uart: '#43a047',
  other: '#9e9e9e',
};

const VALID_WIRE_COLORS: string[] = [
  'red',
  'black',
  'blue',
  'yellow',
  'green',
  'orange',
  'purple',
  'brown',
  'gray',
  'white',
];

/** Kabelfarbe: bevorzugt die feste wire_color, sonst Fallback aus signal_type. */
export function wireColor(conn: Connection): string {
  if (VALID_WIRE_COLORS.includes(conn.wire_color)) return conn.wire_color;
  return SIGNAL_COLORS[conn.signal_type];
}

export function pinColor(signalType: SignalType): string {
  return SIGNAL_COLORS[signalType];
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  headerHeight: number;
  pinRowHeight: number;
}

interface PinPlacement {
  side: 'left' | 'right';
  index: number;
}

export interface WireGeometry {
  connection: Connection;
  path: string;
}

export interface SchematicLayout {
  positions: Record<string, Box>;
  pinLayout: Record<string, Record<string, PinPlacement>>;
  wires: WireGeometry[];
  viewBox: string;
  width: number;
  height: number;
}

const BOX_WIDTH = 200;
const HEADER_HEIGHT = 46;
const PIN_ROW_HEIGHT = 22;
const COL_GAP = 200;
const ROW_GAP = 46;
const MARGIN = 40;

/** BFS-Distanz jedes Bauteils vom Microcontroller (bzw. dem am stärksten verdrahteten Bauteil). */
function computeLayers(
  components: CircuitComponent[],
  connections: Connection[],
): Map<string, number> {
  const adj = new Map<string, string[]>();
  for (const c of components) adj.set(c.id, []);

  for (const conn of connections) {
    if (!adj.has(conn.from_component_id) || !adj.has(conn.to_component_id)) continue;
    adj.get(conn.from_component_id)!.push(conn.to_component_id);
    adj.get(conn.to_component_id)!.push(conn.from_component_id);
  }

  const layer = new Map<string, number>();
  let roots = components
    .filter((c) => c.category === 'Microcontroller')
    .map((c) => c.id);

  if (roots.length === 0) {
    let best: string | null = null;
    let bestDeg = -1;
    for (const c of components) {
      const deg = adj.get(c.id)?.length ?? 0;
      if (deg > bestDeg) {
        bestDeg = deg;
        best = c.id;
      }
    }
    if (best !== null) roots = [best];
  }

  const queue: string[] = [];
  for (const id of roots) {
    if (!layer.has(id)) {
      layer.set(id, 0);
      queue.push(id);
    }
  }
  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = layer.get(id)!;
    for (const other of adj.get(id) ?? []) {
      if (!layer.has(other)) {
        layer.set(other, d + 1);
        queue.push(other);
      }
    }
  }

  // Isolierte Bauteile hinten anhängen, statt sie zu verlieren.
  let maxLayer = -1;
  for (const v of layer.values()) maxLayer = Math.max(maxLayer, v);
  for (const c of components) {
    if (!layer.has(c.id)) layer.set(c.id, maxLayer + 1);
  }

  return layer;
}

export function buildLayout(data: CircuitDiagram): SchematicLayout {
  const { components, connections } = data;

  if (components.length === 0) {
    return {
      positions: {},
      pinLayout: {},
      wires: [],
      viewBox: '0 0 1 1',
      width: 1,
      height: 1,
    };
  }

  const layerOf = computeLayers(components, connections);

  const byLayer = new Map<number, CircuitComponent[]>();
  for (const c of components) {
    const l = layerOf.get(c.id)!;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(c);
  }
  const layers = [...byLayer.keys()].sort((a, b) => a - b);

  // Pins stehen standardmäßig rechts; Verbindungen "rückwärts" klappen sie nach links,
  // damit Kabel nie rückwärts durch eine Box hindurch laufen müssen.
  const pinSideMap: Record<string, Record<string, 'left' | 'right'>> = {};
  for (const c of components) {
    pinSideMap[c.id] = {};
    for (const p of c.pins) pinSideMap[c.id][p.id] = 'right';
  }
  for (const conn of connections) {
    const fromLayer = layerOf.get(conn.from_component_id);
    const toLayer = layerOf.get(conn.to_component_id);
    if (fromLayer === undefined || toLayer === undefined) continue;

    if (fromLayer <= toLayer) {
      pinSideMap[conn.from_component_id][conn.from_pin_id] = 'right';
      pinSideMap[conn.to_component_id][conn.to_pin_id] = 'left';
    } else {
      pinSideMap[conn.from_component_id][conn.from_pin_id] = 'left';
      pinSideMap[conn.to_component_id][conn.to_pin_id] = 'right';
    }
  }

  const positions: Record<string, Box> = {};
  const pinLayout: Record<string, Record<string, PinPlacement>> = {};

  let x = MARGIN;
  for (const l of layers) {
    let y = MARGIN;
    for (const comp of byLayer.get(l)!) {
      const side = pinSideMap[comp.id];
      const leftPins = comp.pins.filter((p) => side[p.id] === 'left');
      const rightPins = comp.pins.filter((p) => side[p.id] !== 'left');
      const rowCount = Math.max(1, leftPins.length, rightPins.length);
      const height = HEADER_HEIGHT + rowCount * PIN_ROW_HEIGHT + 14;

      positions[comp.id] = {
        x,
        y,
        width: BOX_WIDTH,
        height,
        headerHeight: HEADER_HEIGHT,
        pinRowHeight: PIN_ROW_HEIGHT,
      };
      pinLayout[comp.id] = {};
      leftPins.forEach((p, i) => {
        pinLayout[comp.id][p.id] = { side: 'left', index: i };
      });
      rightPins.forEach((p, i) => {
        pinLayout[comp.id][p.id] = { side: 'right', index: i };
      });

      y += height + ROW_GAP;
    }
    x += BOX_WIDTH + COL_GAP;
  }

  const pinPoint = (box: Box, side: 'left' | 'right', index: number) => ({
    x: side === 'left' ? box.x : box.x + box.width,
    y: box.y + box.headerHeight + index * box.pinRowHeight + box.pinRowHeight / 2,
  });

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const extend = (px: number, py: number) => {
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  };

  for (const box of Object.values(positions)) {
    extend(box.x, box.y);
    extend(box.x + box.width, box.y + box.height);
  }

  // Kabel-Geometrie: auch die Bezier-Kontrollpunkte fließen in die Bounding-Box ein.
  // Eine kubische Bezierkurve bleibt innerhalb der konvexen Hülle ihrer 4 Kontrollpunkte,
  // daher wird dadurch garantiert nichts am Rand abgeschnitten.
  const wires: WireGeometry[] = [];
  for (const conn of connections) {
    const fromBox = positions[conn.from_component_id];
    const toBox = positions[conn.to_component_id];
    const fromPL = pinLayout[conn.from_component_id]?.[conn.from_pin_id];
    const toPL = pinLayout[conn.to_component_id]?.[conn.to_pin_id];
    if (!fromBox || !toBox || !fromPL || !toPL) continue;

    const p1 = pinPoint(fromBox, fromPL.side, fromPL.index);
    const p2 = pinPoint(toBox, toPL.side, toPL.index);
    const dx = Math.max(50, Math.abs(p2.x - p1.x) * 0.5);
    const c1x = p1.x + (fromPL.side === 'right' ? dx : -dx);
    const c2x = p2.x + (toPL.side === 'right' ? dx : -dx);

    extend(c1x, p1.y);
    extend(c2x, p2.y);

    wires.push({
      connection: conn,
      path: `M ${p1.x},${p1.y} C ${c1x},${p1.y} ${c2x},${p2.y} ${p2.x},${p2.y}`,
    });
  }

  const pad = 30;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const width = Math.max(50, maxX - minX);
  const height = Math.max(50, maxY - minY);

  return {
    positions,
    pinLayout,
    wires,
    viewBox: `${minX} ${minY} ${width} ${height}`,
    width,
    height,
  };
}
