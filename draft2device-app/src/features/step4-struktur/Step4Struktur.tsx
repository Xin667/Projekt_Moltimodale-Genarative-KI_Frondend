import { useState } from "react";
import "@wokwi/elements";


const nodeTexts = {
  sensor:
    "Kapazitiver Feuchtigkeitssensor an Port A0. Liefert 0–100 % Bodenfeuchte; korrosionsfrei, daher dauerhafter Einsatz in echter Erde möglich.",
  mcu:
    "Der Microcontroller führt den Zustandsautomaten aus — exakt die Logik aus der rechten Leiste, kompiliert aus derselben JSON-Definition.",
  led:
    "Chainable RGB-LED an Port D2. Kann jede Farbe darstellen: rot (Durst), grün blinkend (Gießen), blau pulsierend (Überflutung).",
  spk:
    'Grove Speaker an Port D4 (PWM). Spielt das „Jammern“ als Tonfolge; für echte Samples wäre ein MP3-Modul die Alternative.',
};

type NodeKey = keyof typeof nodeTexts;

export function Step4Struktur() {
  const [openPromptText, setOpenPromptText] = useState<string>('');
  
  const [selectedNodeText, setSelectedNodeText] = useState(
    "Bauteil anklicken, um Funktion und Verkabelung zu sehen.",
  );

  function nodeInfo(key: NodeKey) {
    setSelectedNodeText(nodeTexts[key]);
  }

  function genCode() {
    // Diese Funktionen müssen bei dir definiert oder importiert sein:
    runStages(
      "status4",
      "statusText4",
      [
        "Lade Code-Templates (Grove) …",
        "Injiziere Zustandsautomat …",
        "Setze Parameter-Slots …",
      ],
      () => {
        unLock(5);
      },
    );
  }

  function goTo(step: number) {
    console.log("Wechsle zu Schritt", step);
  }

  return (
    <div>
      <section className="panel" id="p4">
        <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 4: Logik- &amp; Hardware-Struktur
        </h2>
        <p className="text-sm text-[#5A6172] mt-1">
          Klicke auf ein Bauteil für Details. Die Verbindungen entsprechen den
          Grove-Ports — keine freien Drähte, keine Widerstände.
        </p>
      </div>
      </div>


        <div className="circuit-wrap">
          <svg
            viewBox="0 0 640 230"
            width="100%"
            role="img"
            aria-label="Schaltungsdiagramm"
          >
            <defs>
              <marker
                id="arr"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <path
                  d="M0,0 L7,3 L0,6"
                  fill="none"
                  stroke="#5A6172"
                />
              </marker>
            </defs>

            <path
              d="M150,115 H255"
              stroke="#C46A2B"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arr)"
            />

            <path
              d="M385,80 H480"
              stroke="#5A6172"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arr)"
            />

            <path
              d="M385,150 H480"
              stroke="#5A6172"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arr)"
            />

            <text
              x="175"
              y="106"
              fontFamily="IBM Plex Mono"
              fontSize="10"
              fill="#5A6172"
            >
              A0 · analog
            </text>

            <text
              x="400"
              y="71"
              fontFamily="IBM Plex Mono"
              fontSize="10"
              fill="#5A6172"
            >
              D2 · digital
            </text>

            <text
              x="400"
              y="141"
              fontFamily="IBM Plex Mono"
              fontSize="10"
              fill="#5A6172"
            >
              D4 · PWM
            </text>

            <g
              className="cnode"
              onClick={() => nodeInfo("sensor")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x="20"
                y="85"
                width="130"
                height="60"
                rx="9"
                fill="#fff"
                stroke="#D9D3C7"
                strokeWidth="1.5"
              />

              <text
                x="85"
                y="111"
                textAnchor="middle"
                fontFamily="IBM Plex Sans"
                fontSize="12"
                fontWeight="600"
                fill="#1E2430"
              >
                Moisture-Sensor
              </text>

              <text
                x="85"
                y="128"
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="9.5"
                fill="#5A6172"
              >
                Grove · kapazitiv
              </text>
            </g>

            <g
              className="cnode"
              onClick={() => nodeInfo("mcu")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x="255"
                y="75"
                width="130"
                height="80"
                rx="9"
                fill="#F3E3D4"
                stroke="#C46A2B"
                strokeWidth="1.5"
              />

              <text
                x="320"
                y="107"
                textAnchor="middle"
                fontFamily="IBM Plex Sans"
                fontSize="12"
                fontWeight="600"
                fill="#1E2430"
              >
                XIAO ESP32-C3
              </text>

              <text
                x="320"
                y="124"
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="9.5"
                fill="#5A6172"
              >
                Zustandsautomat
              </text>
            </g>

            <g
              className="cnode"
              onClick={() => nodeInfo("led")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x="480"
                y="50"
                width="130"
                height="55"
                rx="9"
                fill="#fff"
                stroke="#D9D3C7"
                strokeWidth="1.5"
              />

              <text
                x="545"
                y="73"
                textAnchor="middle"
                fontFamily="IBM Plex Sans"
                fontSize="12"
                fontWeight="600"
                fill="#1E2430"
              >
                RGB-LED
              </text>

              <text
                x="545"
                y="90"
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="9.5"
                fill="#5A6172"
              >
                Grove · chainable
              </text>
            </g>

            <g
              className="cnode"
              onClick={() => nodeInfo("spk")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x="480"
                y="125"
                width="130"
                height="55"
                rx="9"
                fill="#fff"
                stroke="#D9D3C7"
                strokeWidth="1.5"
              />

              <text
                x="545"
                y="148"
                textAnchor="middle"
                fontFamily="IBM Plex Sans"
                fontSize="12"
                fontWeight="600"
                fill="#1E2430"
              >
                Speaker
              </text>

              <text
                x="545"
                y="165"
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="9.5"
                fill="#5A6172"
              >
                Grove · audio
              </text>
            </g>
          </svg>
        </div>

        <div className="cnode-info">{selectedNodeText}</div>

        <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1E2430]">
          Anpassungen 
        </label>
        <textarea
          value={openPromptText}
          onChange={(e) => setOpenPromptText(e.target.value)}
          placeholder="Gib der KI spezifische Anweisungen mit, wie verbleibende Lücken gefüllt werden sollen..."
          rows={4}
          className="w-full rounded-xl border border-[#D9D3C7] p-4 text-sm focus:outline-none focus:border-[#C46A2B] resize-none"
        />
      </div>
      </section>
    </div>
  );
}