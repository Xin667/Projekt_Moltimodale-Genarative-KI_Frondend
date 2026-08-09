import { useState } from "react";
import "@wokwi/elements";
import { SchematicCanvas } from "./SchematicCanvas";
import { sampleProject } from "./sampleProject";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export function Step5Quellcode() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'code' | 'json'>('simulation');
  const [copied, setCopied] = useState(false);

  const sampleCode = `// Generiert von Draft2Device LLM-Assistent
const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Taster gedrückt: LED AN");
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`;

  const handleCopy = () => {
    const textToCopy = activeTab === 'json' ? JSON.stringify(sampleProject, null, 2) : sampleCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 5 · Quellcode & Live-Simulation
        </h2>
        <p className="text-sm text-[#5A6172] mt-1 flex items-center justify-between gap-1">
          <span>
            {sampleProject.title ? `${sampleProject.title} — ` : ''}
            Beispiel-Rendering aus einem Projekt-JSON.
          </span>
          <InfoTooltip 
            text="Hier wird die Schaltung interaktiv visualisiert und der Quellcode bereitgestellt." 
            side="left" 
          />
        </p>
      </div>

      {/* Navigation Tabs (Sauber getrennt) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9D3C7] pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'simulation' ? 'bg-[#1E2430] text-white' : 'bg-gray-100 text-[#5A6172] hover:bg-gray-200'
            }`}
          >
            🔌 Schaltung (Simulation)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'code' ? 'bg-[#1E2430] text-white' : 'bg-gray-100 text-[#5A6172] hover:bg-gray-200'
            }`}
          >
            📄 main.cpp
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'json' ? 'bg-[#1E2430] text-white' : 'bg-gray-100 text-[#5A6172] hover:bg-gray-200'
            }`}
          >
            ⚙️ diagram.json
          </button>
        </div>

        {activeTab !== 'simulation' && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs font-medium text-[#C46A2B] bg-[#FAF8F4] border border-[#D9D3C7] px-3 py-1 rounded-lg hover:bg-white transition-colors"
          >
            {copied ? '✓ Kopiert!' : 'Code kopieren'}
          </button>
        )}
      </div>

      {/* Tab-Inhalte */}
      {activeTab === 'simulation' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#1E2430] flex items-center gap-6">
              <span>Schaltplan (Wokwi Canvas)</span>
              <InfoTooltip 
                text="Klicke auf Elemente (z. B. Taster), um die Simulation auszulösen." 
                side="top-left" 
              />
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-medium">
              ● Live-Simulation
            </span>
          </div>

          <div className="w-full h-[400px] overflow-hidden border border-[#D9D3C7] rounded-xl bg-[#FAF8F4]">
            <SchematicCanvas project={sampleProject} />
          </div>
        </div>
      )}

      {(activeTab === 'code' || activeTab === 'json') && (
        <div className="bg-[#1E2430] text-slate-200 rounded-xl p-4 font-mono text-xs overflow-auto h-[400px] leading-relaxed whitespace-pre-wrap break-words">
          <code>
            {activeTab === 'code' 
              ? sampleCode 
              : JSON.stringify(sampleProject, null, 2)}
          </code>
        </div>
      )}

      {/* Terminal / Serial Output (Kompakt & abgesichert) */}
      <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="text-slate-500 font-semibold shrink-0">Serial Output:</span>
          <span className="truncate">[INFO] System gestartet. Warte auf Signal...</span>
        </div>
        <div className="shrink-0">
          <InfoTooltip 
            text="Zeigt Konsolenausgaben des Microcontrollers in Echtzeit an." 
            side="left" 
          />
        </div>
      </div>
    </div>
  );
}