import React, { useEffect, useState } from 'react';
import { useProjectStore, type ProjectState } from '@/store/state';
import { GlossaryText } from '@/components/GlossaryText';

type TabType = 'code' | 'json' | 'summary';

export const Step5Ergebnis: React.FC = () => {
  const projectId = useProjectStore((s: ProjectState) => (s as any).projectId || (s as any).project_id);
  const analyzeResult = useProjectStore((s: any) => s.analyzeResult || s.analysis);
  const hardwareResult = useProjectStore((s: any) => s.hardwareResult || s.hardware);

  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [code, setCode] = useState<string>('');
  const [fullData, setFullData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    fetch(`/api/code/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setFullData(data);
        setCode(
          data.code ||
            data.python_code ||
            `# MicroPython / Python Script\nimport time\nfrom machine import Pin, ADC\n\n# Initialisierung\nsensor = ADC(Pin(34))\nled = Pin(18, Pin.OUT)\n\nprint("Pflanzenwaechter gestartet...")\n\nwhile True:\n    val = sensor.read()\n    print("Feuchtigkeitswert:", val)\n    if val < 1500:\n        led.value(1)\n    else:\n        led.value(0)\n    time.sleep(2)\n`
        );
      })
      .catch(() => {
        const fallbackCode = `# MicroPython Script fuer ESP32\nimport time\nfrom machine import Pin, ADC\n\nsensor = ADC(Pin(34))\nled_red = Pin(18, Pin.OUT)\nled_green = Pin(23, Pin.OUT)\n\nprint("System bereit...")\n\nwhile True:\n    val = sensor.read()\n    if val < 1200:\n        led_red.value(1)\n        led_green.value(0)\n    else:\n        led_red.value(0)\n        led_green.value(1)\n    time.sleep(1)\n`;
        setCode(fallbackCode);
        setFullData({
          project_id: projectId,
          generated_code: fallbackCode,
          timestamp: new Date().toISOString(),
          analysis: analyzeResult ?? null,
          hardware: hardwareResult ?? null,
        });
      })
      .finally(() => setLoading(false));
  }, [projectId, analyzeResult, hardwareResult]);

  // Inhalt kopieren
  const handleCopy = () => {
    let textToCopy = code;
    if (activeTab === 'json') {
      textToCopy = JSON.stringify(fullData || { project_id: projectId, code }, null, 2);
    } else if (activeTab === 'summary') {
      textToCopy = analyzeResult?.project_metadata?.core_intention || 'Projektergebnis';
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Downloads
  const handleDownloadPython = () => {
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'code.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const jsonString = JSON.stringify(
      fullData || { project_id: projectId, code, timestamp: new Date().toISOString() },
      null,
      2
    );
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project_result.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#5A6172]">
        <div className="inline-block w-8 h-8 border-2 border-[#C46A2B] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium animate-pulse">Quellcode & Export werden vorbereitet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full print:p-0">
      {/* Header & Export-Aktionen */}
      <div className="space-y-4 border-b border-[#D9D3C7] pb-5">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
            Schritt 5 · Quellcode & Export
          </h2>
          <p className="text-sm text-[#5A6172] mt-1">
            <GlossaryText text="" />
          </p>
        </div>

        {/* Action-Buttons in einer Reihe */}
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            onClick={handleDownloadPython}
            className="flex items-center gap-2 px-4 py-2 bg-[#007A5A] hover:bg-[#00664B] text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <span>🐍</span> code.py herunterladen
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-[#C46A2B] hover:bg-[#A85820] text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <span>📄</span> JSON herunterladen
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E2430] hover:bg-black text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <span>🖨️</span> Als PDF speichern
          </button>
        </div>
      </div>

      {/* Viewer Box mit Tabs */}
      <div className="bg-[#12151B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between bg-[#1A1E27] px-4 py-2.5 border-b border-gray-800 gap-2">
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-[#12151B] text-emerald-400 border border-gray-700 shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <span>🐍</span> code.py
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'json'
                  ? 'bg-[#12151B] text-amber-400 border border-gray-700 shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <span>📄</span> project_result.json
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-[#12151B] text-sky-400 border border-gray-700 shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <span>📋</span> Logik & Details
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 rounded-lg border border-gray-700 transition-colors print:hidden"
          >
            {copied ? '✓ Kopiert' : 'Inhalt kopieren'}
          </button>
        </div>

        <div className="p-4 overflow-x-auto min-h-[420px] max-h-[560px]">
          {activeTab === 'code' && (
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
              <code>{code}</code>
            </pre>
          )}

          {activeTab === 'json' && (
            <pre className="text-xs font-mono text-amber-300 leading-relaxed">
              <code>
                {JSON.stringify(
                  fullData || {
                    project_id: projectId,
                    code,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                )}
              </code>
            </pre>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-4 text-xs text-gray-200">
              <div className="bg-[#1A1E27] p-3.5 rounded-xl border border-gray-700">
                <h4 className="font-bold text-sky-400 text-sm mb-1">
                  {analyzeResult?.project_metadata?.working_title || 'Pflanzenwächter'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {analyzeResult?.project_metadata?.core_intention ||
                    'Das System überwacht Bodenfeuchtewerte und steuert die Peripherie an.'}
                </p>
              </div>

              {analyzeResult?.states && (
                <div className="bg-[#1A1E27] p-3.5 rounded-xl border border-gray-700">
                  <h5 className="font-bold text-gray-300 mb-2">Projekt-Zustände:</h5>
                  <div className="space-y-2">
                    {analyzeResult.states.map((st: any) => (
                      <div key={st.id} className="bg-black/40 p-2 rounded border border-gray-800">
                        <span className="font-semibold text-orange-300">{st.name}</span>
                        <p className="text-gray-400 text-[11px] mt-0.5">{st.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};