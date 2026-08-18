import { useState, useMemo } from "react";
import { InfoTooltip } from "@/components/ui/info-tooltip";

// --- Types für das Schaltplan-SVG ---
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

// --- Unterkomponente: Dynamisches SVG-Diagramm ---
function SchematicSVGCanvas({ data, onSelectElement }: { data: CircuitDiagramData; onSelectElement?: (info: string) => void }) {
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
      <svg viewBox={layout.viewBox} className="w-full h-auto min-h-[500px]" style={{ display: "block" }}>
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

              <text x={box.x + box.width / 2} y={box.y + 19} textAnchor="middle" fill="#e8e9ec" fontSize={13} fontWeight={600}>
                {comp.name}
              </text>
              <text x={box.x + box.width / 2} y={box.y + 33} textAnchor="middle" fill="#9aa0ac" fontSize={10}>
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

// Fallback-Beispieldaten aus deinem Backend-Format
const sampleBackendData: CircuitDiagramData = {
  title: "ESP32-Bodenfeuchteanzeige",
  summary: "Der ESP32 liest Bodenfeuchtesensoren aus und zeigt Werte per LED und OLED an.",
  components: [
    {
      id: "controller_main",
      name: "ESP32-DevKitC V4",
      category: "Microcontroller",
      pins: [
        { id: "5v", label: "5V", signal_type: "power" },
        { id: "gnd", label: "GND", signal_type: "ground" },
        { id: "3v3", label: "3V3", signal_type: "power" },
        { id: "gpio34", label: "GPIO34", signal_type: "analog" },
        { id: "gpio35", label: "GPIO35", signal_type: "analog" },
        { id: "gpio18", label: "GPIO18", signal_type: "digital" },
        { id: "gpio19", label: "GPIO19", signal_type: "digital" },
        { id: "gpio22", label: "GPIO22", signal_type: "i2c" },
        { id: "gpio21", label: "GPIO21", signal_type: "i2c" }
      ]
    },
    {
      id: "sensor_1",
      name: "Capacitive Soil Moisture Sensor v1.2",
      category: "Sensor",
      pins: [
        { id: "vcc", label: "VCC", signal_type: "power" },
        { id: "gnd", label: "GND", signal_type: "ground" },
        { id: "aout", label: "AOUT", signal_type: "analog" }
      ]
    },
    {
      id: "sensor_2",
      name: "Capacitive Soil Moisture Sensor v1.2",
      category: "Sensor",
      pins: [
        { id: "vcc", label: "VCC", signal_type: "power" },
        { id: "gnd", label: "GND", signal_type: "ground" },
        { id: "aout", label: "AOUT", signal_type: "analog" }
      ]
    },
    {
      id: "led_rot",
      name: "5mm diffuse rote LED",
      category: "Actuator",
      pins: [
        { id: "anode", label: "Anode", signal_type: "digital" },
        { id: "cathode", label: "Kathode", signal_type: "ground" }
      ]
    },
    {
      id: "led_gruen",
      name: "5mm diffuse grüne LED",
      category: "Actuator",
      pins: [
        { id: "anode", label: "Anode", signal_type: "digital" },
        { id: "cathode", label: "Kathode", signal_type: "ground" }
      ]
    },
    {
      id: "display_oled",
      name: "0,96\" OLED Display SSD1306",
      category: "Actuator",
      pins: [
        { id: "gnd", label: "GND", signal_type: "ground" },
        { id: "vcc", label: "VCC", signal_type: "power" },
        { id: "scl", label: "SCL", signal_type: "i2c" },
        { id: "sda", label: "SDA", signal_type: "i2c" }
      ]
    }
  ],
  connections: [
    { id: "conn_01", from_component_id: "controller_main", from_pin_id: "3v3", to_component_id: "sensor_1", to_pin_id: "vcc", signal_type: "power", wire_color: "red" },
    { id: "conn_02", from_component_id: "controller_main", from_pin_id: "gnd", to_component_id: "sensor_1", to_pin_id: "gnd", signal_type: "ground", wire_color: "black" },
    { id: "conn_03", from_component_id: "controller_main", from_pin_id: "gpio34", to_component_id: "sensor_1", to_pin_id: "aout", signal_type: "analog", wire_color: "yellow" },
    { id: "conn_04", from_component_id: "controller_main", from_pin_id: "3v3", to_component_id: "sensor_2", to_pin_id: "vcc", signal_type: "power", wire_color: "red" },
    { id: "conn_05", from_component_id: "controller_main", from_pin_id: "gnd", to_component_id: "sensor_2", to_pin_id: "gnd", signal_type: "ground", wire_color: "black" },
    { id: "conn_06", from_component_id: "controller_main", from_pin_id: "gpio35", to_component_id: "sensor_2", to_pin_id: "aout", signal_type: "analog", wire_color: "green" },
    { id: "conn_07", from_component_id: "controller_main", from_pin_id: "gpio18", to_component_id: "led_rot", to_pin_id: "anode", signal_type: "digital", wire_color: "orange" },
    { id: "conn_08", from_component_id: "controller_main", from_pin_id: "gnd", to_component_id: "led_rot", to_pin_id: "cathode", signal_type: "ground", wire_color: "black" },
    { id: "conn_09", from_component_id: "controller_main", from_pin_id: "gpio19", to_component_id: "led_gruen", to_pin_id: "anode", signal_type: "digital", wire_color: "blue" },
    { id: "conn_10", from_component_id: "controller_main", from_pin_id: "gnd", to_component_id: "led_gruen", to_pin_id: "cathode", signal_type: "ground", wire_color: "black" },
    { id: "conn_11", from_component_id: "controller_main", from_pin_id: "3v3", to_component_id: "display_oled", to_pin_id: "vcc", signal_type: "power", wire_color: "red" },
    { id: "conn_12", from_component_id: "controller_main", from_pin_id: "gnd", to_component_id: "display_oled", to_pin_id: "gnd", signal_type: "ground", wire_color: "black" },
    { id: "conn_13", from_component_id: "controller_main", from_pin_id: "gpio22", to_component_id: "display_oled", to_pin_id: "scl", signal_type: "i2c", wire_color: "purple" },
    { id: "conn_14", from_component_id: "controller_main", from_pin_id: "gpio21", to_component_id: "display_oled", to_pin_id: "sda", signal_type: "i2c", wire_color: "white" }
  ]
};

// --- Hauptkomponente Schritt 5 ---
export function Step5Quellcode({ backendData }: { backendData?: CircuitDiagramData }) {
  const [activeTab, setActiveTab] = useState<'simulation' | 'code' | 'json'>('simulation');
  const [copied, setCopied] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<string>("");

  const currentData: CircuitDiagramData = backendData || sampleBackendData;

  const sampleCode = `// Generiert von Draft2Device für ESP32
#include <Arduino.h>
#include <Wire.h>

const int SENSOR_1_PIN = 34;
const int SENSOR_2_PIN = 35;
const int LED_ROT_PIN  = 18;
const int LED_GRUEN_PIN = 19;

void setup() {
  Serial.begin(115200);
  pinMode(LED_ROT_PIN, OUTPUT);
  pinMode(LED_GRUEN_PIN, OUTPUT);
  Wire.begin(21, 22);
  Serial.println("[INFO] ESP32 System gestartet.");
}

void loop() {
  int s1 = analogRead(SENSOR_1_PIN);
  int s2 = analogRead(SENSOR_2_PIN);

  if (s1 < 1500) {
    digitalWrite(LED_ROT_PIN, HIGH);
    digitalWrite(LED_GRUEN_PIN, LOW);
  } else {
    digitalWrite(LED_ROT_PIN, LOW);
    digitalWrite(LED_GRUEN_PIN, HIGH);
  }
  delay(1000);
}`;

  const handleCopy = () => {
    const textToCopy = activeTab === 'json' ? JSON.stringify(currentData, null, 2) : sampleCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 5 · Quellcode & Live-Schaltplan
        </h2>
        <p className="text-sm text-[#5A6172] mt-1 flex items-center justify-between gap-1">
          <span>
            {currentData.title ? `${currentData.title} — ` : ''}
            Automatisch generierter Schaltplan und Quellcode.
          </span>
          <InfoTooltip 
            text="Visualisiert alle Komponenten, Pins und Bezier-Verbindungen aus deinen Backend-Daten." 
            side="left" 
          />
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D3C7] pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'simulation' ? 'bg-[#1E2430] text-white' : 'bg-gray-100 text-[#5A6172] hover:bg-gray-200'
            }`}
          >
             Schaltplan (SVG)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'code' ? 'bg-[#1E2430] text-white' : 'bg-gray-100 text-[#5A6172] hover:bg-gray-200'
            }`}
          >
             Code / Logik <span className="opacity-60 text-[10px] ml-0.5">(main.cpp)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'json' ? 'bg-[#1E2430] text-white' : 'bg-gray-100 text-[#5A6172] hover:bg-gray-200'
            }`}
          >
             Schaltplan <span className="opacity-60 text-[10px] ml-0.5">(diagram.json)</span>
          </button>
        </div>

        {activeTab !== 'simulation' && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs font-medium text-[#C46A2B] bg-[#FAF8F4] border border-[#D9D3C7] px-3 py-1 rounded-lg hover:bg-white transition-colors"
          >
            {copied ? '✓ Kopiert!' : activeTab === 'json' ? 'JSON kopieren' : 'Code kopieren'}
          </button>
        )}
      </div>

      <div className="bg-[#FAF8F4] border border-[#D9D3C7] rounded-lg p-2.5 text-xs text-[#5A6172] flex items-center gap-2">
        <span className="shrink-0">💡</span>
        <span>
          {activeTab === 'simulation' && (
            <><strong>Interaktiver Schaltplan:</strong> Fahre mit der Maus über Kabel oder klicke auf Bauteile, um Details zu sehen.</>
          )}
          {activeTab === 'code' && (
            <><strong>Programm-Code:</strong> C++ Steuerungsprogramm passend zu deinen ausgewählten Pins.</>
          )}
          {activeTab === 'json' && (
            <><strong>Schaltplan-Daten (JSON):</strong> Rohdaten deines Hardware-Aufbaus vom Backend.</>
          )}
        </span>
      </div>

      {activeTab === 'simulation' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#1E2430]">
              Dynamisches Schaltplan-Diagramm
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-medium">
              ● SVG Auto-Layout
            </span>
          </div>

          <div className="w-full min-h-[580px] rounded-xl overflow-hidden">
            <SchematicSVGCanvas 
              data={currentData} 
              onSelectElement={(info) => setSelectedInfo(info)} 
            />
          </div>

          {selectedInfo && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg">
              ℹ️ {selectedInfo}
            </div>
          )}
        </div>
      )}

      {(activeTab === 'code' || activeTab === 'json') && (
        <div className="bg-[#1E2430] text-slate-200 rounded-xl p-4 font-mono text-xs overflow-auto h-[580px] leading-relaxed whitespace-pre-wrap break-words">
          <code>
            {activeTab === 'code' 
              ? sampleCode 
              : JSON.stringify(currentData, null, 2)}
          </code>
        </div>
      )}

      <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="text-slate-500 font-semibold shrink-0">Serial Output:</span>
          <span className="truncate">[INFO] ESP32 System gestartet.</span>
        </div>
        <div className="shrink-0">
          <InfoTooltip 
            text="Zeigt Konsolenausgaben des Microcontrollers an." 
            side="left" 
          />
        </div>
      </div>
    </div>
  );
}