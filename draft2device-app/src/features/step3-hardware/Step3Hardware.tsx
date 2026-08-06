import React, { useState } from 'react';

interface HardwareItem {
  id: string;
  name: string;
  price: string;
  description: string;
  specs: string;
  icon: string;
}

export const Step3Hardware: React.FC = () => {
  // Zustand für die ausgewählte primäre Hardware-Karte
  const [selectedMainHw, setSelectedMainHw] = useState<string>('');
  
  // Zustand für ausgewählte sekundäre Hardware (Mehrfachauswahl)
  const [selectedSecondaryHw, setSelectedSecondaryHw] = useState<string[]>([]);

  // Beispieldaten für primäre Hardware-Karten
  const primaryHardware: HardwareItem[] = [
    {
      id: 'hw-pro',
      name: 'EdgeCompute IoT Node Pro',
      price: '149,00€',
      description: 'Maximale Rechenpower direkt an der Maschine. Perfekt für Echtzeit-KI-Analysen.',
      specs: 'Quad-Core 1.5GHz, 8GB RAM, 64GB eMMC',
      icon: '🚀'
    },
    {
      id: 'hw-eco',
      name: 'SmartNode Core Eco',
      price: '79,00€',
      description: 'Ultra-energiesparend und kompakt. Ideal für verteilte Sensornetzwerke im Batteriebetrieb.',
      specs: 'Dual-Core 800MHz, 2GB RAM, 16GB MicroSD',
      icon: '🌱'
    }
  ];

  // Beispieldaten für sekundäre Hardware-Liste
  const secondaryHardware = [
    { id: 'sec-temp', name: 'Präzisions-Temperatursensor (Modbus)', price: '24,50 €' },
    { id: 'sec-vib', name: '3-Achsen-Vibrationssensor (Piezo)', price: '38,90 €' },
    { id: 'sec-wifi', name: 'Externes High-Gain WiFi/BLE Modul', price: '12,00 €' }
  ];

  const handleToggleSecondary = (id: string) => {
    if (selectedSecondaryHw.includes(id)) {
      setSelectedSecondaryHw(selectedSecondaryHw.filter(item => item !== id));
    } else {
      setSelectedSecondaryHw([...selectedSecondaryHw, id]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 3: Hardware-Auswahl & Konfiguration
        </h2>
        <p className="text-sm text-[#5A6172] mt-1">
          Wähle die passende Zielhardware für dein KI-Generat aus und füge bei Bedarf Sensoren hinzu.
        </p>
      </div>

      {/* 1. Primäre Hardware-Auswahl (Karten mit Preis & Info) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#1E2430]">
          Primäre Steuerungseinheit wählen
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {primaryHardware.map((hw) => {
            const isSelected = selectedMainHw === hw.id;
            return (
              <div
                key={hw.id}
                onClick={() => setSelectedMainHw(hw.id)}
                className={`border rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between shadow-sm relative hover:border-[#C46A2B]
                  ${isSelected ? 'border-[#C46A2B] bg-[#FAF8F4] ring-2 ring-[#C46A2B]/20' : 'border-[#D9D3C7] bg-white'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{hw.icon}</span>
                      <h3 className="font-bold text-base text-[#1E2430]">{hw.name}</h3>
                    </div>
                    <span className="text-[#C46A2B] font-bold text-xs md:text-sm lg:text-md bg-[#FAF8F4] px-1 py-1 rounded-md border border-[#D9D3C7]/40">
                      {hw.price}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6172] mb-4 leading-relaxed">{hw.description}</p>
                </div>
                <div className="text-[10px] font-mono bg-gray-100 text-gray-600 px-3 py-1 rounded-md mt-auto">
                  {hw.specs}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-[#D9D3C7]" />

      {/* 2. Sekundäre Hardware-Liste */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-[#1E2430]">
            Sekundäre Hardware & Erweiterungen
          </label>
          <p className="text-xs text-[#5A6172] mt-0.5">
            Optionale Komponenten, die automatisch in die Pin-Belegung eingerechnet werden.
          </p>
        </div>

        <div className="border border-[#D9D3C7] rounded-xl overflow-hidden bg-white shadow-sm">
          {secondaryHardware.map((item, index) => {
            const isChecked = selectedSecondaryHw.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleToggleSecondary(item.id)}
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-[#FAF8F4]/40
                  ${index !== secondaryHardware.length - 1 ? 'border-b border-[#D9D3C7]/60' : ''}
                  ${isChecked ? 'bg-[#FAF8F4]/60' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // gesteuert durch Klick auf Zeile
                    className="accent-[#C46A2B] h-4 w-4 rounded"
                  />
                  <span className="text-sm font-medium text-[#1E2430]">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-[#5A6172]">{item.price}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
