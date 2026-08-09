import { useState } from 'react';
import { useProjectStore, type ProjectState } from '@/store/state';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface HardwareItem {
  name: string;
  category: string;
  port: string;
  price?: number; // Optional: Nur da, wenn das Backend Preise liefert
}

export function Step6Ergebnis() {
  const [downloading, setDownloading] = useState(false);

  // 1. Echt-Daten aus dem Store auslesen
  const primaryHardwareId = useProjectStore((state: ProjectState) => state.primaryHardwareId);
  const secondaryHardwareIds = useProjectStore((state: ProjectState) => state.secondaryHardwareIds);
  const structure = useProjectStore((state: ProjectState) => state.structure);

  // 2. Dynamische Stückliste aus den Schritten aufbauen (ohne Hardcoded-Preise)
  const hardwareList: HardwareItem[] = [];

  // Haupt-Board
  if (primaryHardwareId) {
    hardwareList.push({
      name: primaryHardwareId,
      category: 'Microcontroller',
      port: 'Zentrale',
      // price wird weggelassen oder aus structure.prices ausgelesen
      price: (structure as Record<string, any>)?.prices?.[primaryHardwareId],
    });
  }

  // Sensoren & Aktoren
  secondaryHardwareIds.forEach((id, index) => {
    hardwareList.push({
      name: id,
      category: id.toLowerCase().includes('sensor') ? 'Eingabe' : 'Ausgabe',
      port: `D${index + 1}`,
      price: (structure as Record<string, any>)?.prices?.[id],
    });
  });

  // Gesamtsumme berechnen (nur wenn alle Bauteile einen Preis vom Backend haben)
  const hasAllPrices = hardwareList.length > 0 && hardwareList.every((item) => item.price !== undefined);
  const totalPrice = hasAllPrices
    ? hardwareList.reduce((sum, item) => sum + (item.price || 0), 0)
    : null;

  // 3. Code-Fallback
  const pythonCode =
    (structure as Record<string, any>)?.code ||
    `# Generiert von Draft2Device (MicroPython)
import time

print("[INFO] Geraet gestartet...")
print("Haupt-Hardware: ${primaryHardwareId || 'Nicht ausgewählt'}")
print("Aktive Komponenten: ${secondaryHardwareIds.join(', ') || 'Keine'}")

while True:
    time.sleep(1)
`;

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    setDownloading(true);
    downloadFile('main.py', pythonCode, 'text/x-python');
    downloadFile(
      'diagram.json',
      JSON.stringify({ parts: hardwareList, structure: structure || null }, null, 2),
      'application/json'
    );
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 6 · Ergebnis & Export
        </h2>
        <p className="text-sm text-[#5A6172] mt-1 flex items-center justify-between gap-1">
          <span>Dein Gerät wurde erfolgreich generiert! Hier findest du deine zusammengestellte Hardware.</span>
          <InfoTooltip text="Lade den generierten Python-Code herunter, um ihn auf deinen Microcontroller zu übertragen." side="left" />
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-[#D9D3C7] rounded-xl p-3.5 shadow-sm">
          <span className="text-xs text-[#5A6172] font-medium">Projekt-Name</span>
          <h4 className="font-bold text-[#1E2430] text-base mt-0.5">
            {(structure as Record<string, any>)?.title || 'Draft2Device'}
          </h4>
        </div>
        <div className="bg-white border border-[#D9D3C7] rounded-xl p-3.5 shadow-sm">
          <span className="text-xs text-[#5A6172] font-medium">Status</span>
          <div className="font-bold text-emerald-600 text-base mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Bereit für Build
          </div>
        </div>
        <div className="bg-[#FAF8F4] border border-[#C46A2B] rounded-xl p-3.5 shadow-sm">
          <span className="text-xs text-[#C46A2B] font-bold uppercase tracking-wider">Geschätzte Hardwarekosten</span>
          <h4 className="font-extrabold text-[#1E2430] text-xl mt-0.5">
            {totalPrice !== null ? `${totalPrice.toFixed(2)} €` : '-- €'}
          </h4>
        </div>
      </div>

      {/* Hardware Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1E2430]">
            Stückliste & Verkabelung
          </h3>
          <InfoTooltip text="Diese Komponenten basieren auf deinen Auswahlen aus Schritt 3." side="left" />
        </div>

        <div className="border border-[#D9D3C7] rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F4] border-b border-[#D9D3C7] text-[#1E2430] font-semibold">
              <tr>
                <th className="p-2.5 pl-3">Bauteil</th>
                <th className="p-2.5">Kategorie</th>
                <th className="p-2.5">Grove-Port</th>
                <th className="p-2.5 pr-3 text-right">Preis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D3C7]/50 text-[#5A6172]">
              {hardwareList.length > 0 ? (
                hardwareList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-2.5 pl-3 font-medium text-[#1E2430]">{item.name}</td>
                    <td className="p-2.5">{item.category}</td>
                    <td className="p-2.5 font-mono font-bold text-[#C46A2B]">{item.port}</td>
                    <td className="p-2.5 pr-3 text-right font-medium text-[#1E2430]">
                      {item.price !== undefined ? `${item.price.toFixed(2)} €` : '-- €'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400 italic">
                    Keine Hardware in Schritt 3 ausgewählt.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-[#FAF8F4] font-semibold text-[#1E2430] border-t border-[#D9D3C7]">
              <tr>
                <td colSpan={3} className="p-2.5 text-right">Gesamtsumme:</td>
                <td className="p-2.5 pr-3 text-right text-[#C46A2B] font-bold">
                  {totalPrice !== null ? `${totalPrice.toFixed(2)} €` : '-- €'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Download Actions */}
      <div className="pt-1 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleDownloadAll}
          className="flex-1 min-w-[200px] bg-[#C46A2B] text-white font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-[#a85822] transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <span>📦</span>
          <span>{downloading ? 'Paket wird erstellt...' : 'Projekt-Paket herunterladen (.py / .json)'}</span>
        </button>

        <button
          type="button"
          onClick={() => downloadFile('main.py', pythonCode, 'text/x-python')}
          className="bg-white border border-[#D9D3C7] text-[#1E2430] font-medium text-sm py-2.5 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <span>🐍</span>
          <span>Nur main.py</span>
        </button>
      </div>
    </div>
  );
}