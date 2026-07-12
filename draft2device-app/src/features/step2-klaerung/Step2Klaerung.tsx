import React, { useState } from 'react';

export const Step2Klaerung: React.FC = () => {
  // Zustände für die Lücken-Komponenten & den Prompt
  const [sliderValue, setSliderValue] = useState<number>(50);
  const [choiceValue, setChoiceValue] = useState<string>('');
  const [isOpenPrompt, setIsOpenPrompt] = useState<boolean>(false);
  const [openPromptText, setOpenPromptText] = useState<string>('');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 2: Analyse & Struktur-Klärung
        </h2>
        <p className="text-sm text-[#5A6172] mt-1">
          Überprüfe die extrahierte Struktur und fülle die notwendigen Systemlücken aus.
        </p>
      </div>

      {/* 1. Analyse-Struktur-Ansicht (4 Blöcke) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FAF8F4] border border-[#D9D3C7] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <h3 className="font-semibold text-sm text-[#1E2430]">Block 1: UI/UX Struktur</h3>
          </div>
          <p className="text-xs text-[#5A6172]">Hier werden Layout-Raster, Menüpfade und Navigationsbäume der hochgeladenen Skizze analysiert.</p>
        </div>

        <div className="bg-[#FAF8F4] border border-[#D9D3C7] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚙️</span>
            <h3 className="font-semibold text-sm text-[#1E2430]">Block 2: Funktionale Logik</h3>
          </div>
          <p className="text-xs text-[#5A6172]">Erkennung von Interaktions-Triggern, Buttons, Event-Handlern und Formular-Zielen.</p>
        </div>

        <div className="bg-[#FAF8F4] border border-[#D9D3C7] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💾</span>
            <h3 className="font-semibold text-sm text-[#1E2430]">Block 3: Daten-Entitäten</h3>
          </div>
          <p className="text-xs text-[#5A6172]">Erfasste Datenfelder, Variablen-Typen und notwendige API-Schnittstellen im Hintergrund.</p>
        </div>

        <div className="bg-[#FAF8F4] border border-[#D9D3C7] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔒</span>
            <h3 className="font-semibold text-sm text-[#1E2430]">Block 4: System-Restriktionen</h3>
          </div>
          <p className="text-xs text-[#5A6172]">Sicherheits-Vorgaben, Validierungs-Regeln und gerätespezifische Einschränkungen.</p>
        </div>
      </div>

      <hr className="border-[#D9D3C7]" />

      {/* 2. Lücken-Komponenten */}
      <div className="space-y-6">
        <h3 className="font-bold text-lg text-[#1E2430]">Systemlücken präzisieren</h3>

        {/* LueckeSlider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-[#1E2430]">
            <label>Lücke A: Performance-Priorität (Slider)</label>
            <span className="text-[#C46A2B] font-bold">{sliderValue}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            disabled={isOpenPrompt}
            className="w-full accent-[#C46A2B] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
          />
          <div className="flex justify-between text-xs text-[#5A6172]">
            <span>Akkulaufzeit</span>
            <span>Rechenleistung</span>
          </div>
        </div>

        {/* LueckeChoice & Offen Lassen */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#1E2430]">
            Lücke B: primäres UI-Thema (Single-Choice)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className={`flex items-center gap-3 border p-3 rounded-xl cursor-pointer transition-colors ${choiceValue === 'light' && !isOpenPrompt ? 'border-[#C46A2B] bg-[#FAF8F4]' : 'border-[#D9D3C7]'} ${isOpenPrompt ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <input 
                type="radio" 
                name="uiTheme" 
                value="light"
                checked={choiceValue === 'light' && !isOpenPrompt}
                onChange={(e) => setChoiceValue(e.target.value)}
                disabled={isOpenPrompt}
                className="accent-[#C46A2B]"
              />
              <span className="text-sm text-[#1E2430]">Light Mode</span>
            </label>

            <label className={`flex items-center gap-3 border p-3 rounded-xl cursor-pointer transition-colors ${choiceValue === 'dark' && !isOpenPrompt ? 'border-[#C46A2B] bg-[#FAF8F4]' : 'border-[#D9D3C7]'} ${isOpenPrompt ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <input 
                type="radio" 
                name="uiTheme" 
                value="dark"
                checked={choiceValue === 'dark' && !isOpenPrompt}
                onChange={(e) => setChoiceValue(e.target.value)}
                disabled={isOpenPrompt}
                className="accent-[#C46A2B]"
              />
              <span className="text-sm text-[#1E2430]">Dark Mode</span>
            </label>

            {/* „Offen lassen"-Option */}
            <label className={`flex items-center gap-3 border p-3 rounded-xl cursor-pointer border-dashed transition-colors ${isOpenPrompt ? 'border-blue-500 bg-blue-50/40' : 'border-[#D9D3C7]'}`}>
              <input 
                type="checkbox" 
                checked={isOpenPrompt}
                onChange={(e) => {
                  setIsOpenPrompt(e.target.checked);
                  if(e.target.checked) setChoiceValue(''); // setzt Radio zurück wenn offen gelassen
                }}
                className="accent-blue-500"
              />
              <span className="text-sm font-medium text-[#1E2430]">Lücken offen lassen</span>
            </label>
          </div>
          {isOpenPrompt && (
            <p className="text-xs text-blue-600 font-medium">ℹ️ Systemlücken werden durch den freien Prompt unten manuell definiert.</p>
          )}
        </div>
      </div>

      <hr className="border-[#D9D3C7]" />

      {/* 3. Offener Prompt */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1E2430]">
          Offener Prompt (Manuelle Spezifikation für KI-Generierung)
        </label>
        <textarea
          value={openPromptText}
          onChange={(e) => setOpenPromptText(e.target.value)}
          placeholder="Gib der KI spezifische Anweisungen mit, wie verbleibende Lücken gefüllt werden sollen..."
          rows={4}
          className="w-full rounded-xl border border-[#D9D3C7] p-4 text-sm focus:outline-none focus:border-[#C46A2B] resize-none"
        />
      </div>
    </div>
  );
};