import { useEffect, useState } from 'react';
import { useProjectStore, type ProjectState } from '@/store/state';

/**
 * Schritt 5: Quellcode.
 *
 * Lädt den generierten Code (Endpoint /api/code/<project_id>, sobald er
 * existiert) und zeigt ihn im Terminal-Look. Solange der Endpoint fehlt,
 * wird ein MicroPython-Fallback angezeigt.
 */
export function Step5Quellcode() {
  const projectId = useProjectStore((s: ProjectState) => s.projectId);

  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!projectId) {
      setCode(fallbackCode());
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/code/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setCode(data.code || data.python_code || fallbackCode());
      })
      .catch(() => setCode(fallbackCode()))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPython = () => {
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'code.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#5A6172]">
        <div className="inline-block w-8 h-8 border-2 border-[#C46A2B] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium animate-pulse">Quellcode wird vorbereitet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header & Aktionen */}
      <div className="space-y-4 border-b border-[#D9D3C7] pb-5">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
            Schritt 5 · Quellcode
          </h2>
          <p className="text-sm text-[#5A6172] mt-1">
            Der generierte MicroPython-Code für deinen Microcontroller.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPython}
            className="flex items-center gap-2 px-4 py-2 bg-[#007A5A] hover:bg-[#00664B] text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <span>🐍</span> code.py herunterladen
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E2430] hover:bg-black text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            {copied ? '✓ Kopiert' : 'Inhalt kopieren'}
          </button>
        </div>
      </div>

      {/* Code-Viewer */}
      <div className="bg-[#12151B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between bg-[#1A1E27] px-4 py-2.5 border-b border-gray-800 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs font-mono text-gray-400">code.py</span>
          </div>
        </div>
        <div className="p-4 overflow-x-auto min-h-[420px] max-h-[560px]">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function fallbackCode(): string {
  return `# MicroPython Script fuer ESP32
import time
from machine import Pin, ADC

sensor = ADC(Pin(34))
led_red = Pin(18, Pin.OUT)
led_green = Pin(23, Pin.OUT)

print("System bereit...")

while True:
    val = sensor.read()
    if val < 1200:
        led_red.value(1)
        led_green.value(0)
    else:
        led_red.value(0)
        led_green.value(1)
    time.sleep(1)
`;
}
