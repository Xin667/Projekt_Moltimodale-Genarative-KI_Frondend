import React, { useEffect, useState } from 'react';
import { fetchHardware, selectHardwareOption } from '@/api/api';
import type { HardwareComponent, ControllerComponent, HardwareOption, ControllerOption } from '@/api/types';
import { useProjectStore, type ProjectState } from '@/store/state';
import { GlossaryText } from '@/components/GlossaryText';

/** Extrahiert URL aus Markdown [Text](url) oder direktem String */
function extractLink(text: string | null | undefined, fallbackUrl?: string | null): string | null {
  if (fallbackUrl && fallbackUrl.startsWith('http')) return fallbackUrl;
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s)]+/);
  return match ? match[0] : null;
}

/** Bereinigt Markdown-Klammern für die Anzeige */
function cleanDisplayText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [reichelt.de](url) -> reichelt.de
    .replace(/\(https?:\/\/[^\s)]+\)/g, '')   // (http...) entfernen
    .trim();
}

/** Formatiert den Preiswert */
function cleanCost(cost: string | null | undefined): string {
  if (!cost) return 'k. A.';
  const cleaned = cleanDisplayText(cost);
  return cleaned.split('(')[0].trim() || cleaned;
}

export const Step3Hardware: React.FC = () => {
  const projectId = useProjectStore((state: ProjectState) => (state as any).projectId || (state as any).project_id);

  const [components, setComponents] = useState<HardwareComponent[]>([]);
  const [controllers, setControllers] = useState<ControllerComponent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!projectId) {
        setErrorMessage('Keine aktive Projekt-ID gefunden. Bitte starte bei Schritt 1.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage(null);
      try {
        const data = await fetchHardware(projectId, 'Ermittle Hardware für das Projekt');
        if (data?.hardware_components) {
          setComponents(data.hardware_components);
        }
        if (data?.controllers) {
          setControllers(data.controllers);
        }
      } catch (err: any) {
        console.error('Fehler beim Laden der Hardware:', err);
        setErrorMessage(err.message || 'Hardware konnte nicht vom Backend geladen werden.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  const handleSelectOption = async (targetId: string, optionId: string, isController = false) => {
    if (isController) {
      setControllers((prev) =>
        prev.map((ctrl) =>
          ctrl.id !== targetId
            ? ctrl
            : {
                ...ctrl,
                options: ctrl.options.map((opt) => ({
                  ...opt,
                  selected: opt.id === optionId,
                })),
              }
        )
      );
    } else {
      setComponents((prev) =>
        prev.map((comp) =>
          comp.id !== targetId
            ? comp
            : {
                ...comp,
                options: comp.options.map((opt) => ({
                  ...opt,
                  selected: opt.id === optionId,
                })),
              }
        )
      );
    }

    setSaving(true);
    try {
      await selectHardwareOption(projectId, [{ target_id: targetId, option_id: optionId }]);
    } catch (err) {
      console.error('Fehler beim Speichern der Auswahl:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[#5A6172]">
        <div className="inline-block w-6 h-6 border-2 border-[#C46A2B] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium animate-pulse">Hardware-Optionen werden ermittelt...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        <p className="font-bold mb-1">Hinweis zur Hardware-Abfrage:</p>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 3 · Hardware-Auswahl
        </h2>
        <p className="text-sm text-[#5A6172] mt-1">
          <GlossaryText text="Wähle für jede Komponente die passende Hardware-Option." />
        </p>
      </div>

      {/* 1. Controller */}
      {controllers.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-[#1E2430]">
            <GlossaryText text="Steuerungseinheit / Microcontroller" />
          </h3>
          {controllers.map((ctrl) => (
            <div key={ctrl.id} className="space-y-3">
              <span className="text-xs text-[#5A6172] block">
                <GlossaryText text={ctrl.role} />
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ctrl.options.map((opt: ControllerOption) => {
                  const isSelected = opt.selected;
                  const displayCost = cleanCost(opt.cost);
                  const directUrl = extractLink(opt.availability, opt.product_link) || extractLink(opt.cost);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(ctrl.id, opt.id, true)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between shadow-sm relative hover:border-[#C46A2B] ${
                        isSelected
                          ? 'border-[#C46A2B] bg-[#FAF8F4] ring-2 ring-[#C46A2B]/20'
                          : 'border-[#D9D3C7] bg-white'
                      }`}
                    >
                      <div>
                        {/* Name & Preis */}
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <h4 className="font-bold text-sm text-[#1E2430] leading-snug flex-1">
                            <GlossaryText text={cleanDisplayText(opt.name)} />
                          </h4>
                          <span className="shrink-0 text-[#C46A2B] font-bold text-xs bg-white px-2 py-1 rounded border border-[#D9D3C7]/60 whitespace-nowrap shadow-2xs">
                            {displayCost}
                          </span>
                        </div>

                        {/* Specs */}
                        <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
                          {opt.voltage && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                              <GlossaryText text={cleanDisplayText(opt.voltage)} />
                            </span>
                          )}
                          {opt.wireless_connectivity && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                              <GlossaryText text={cleanDisplayText(opt.wireless_connectivity)} />
                            </span>
                          )}
                        </div>

                        {/* Stichpunkte */}
                        {opt.pros_cons && opt.pros_cons.length > 0 && (
                          <ul className="text-xs text-[#5A6172] space-y-1.5 mb-3 list-disc pl-4">
                            {opt.pros_cons.map((pc, idx) => (
                              <li key={idx} className="leading-relaxed">
                                <GlossaryText text={cleanDisplayText(pc)} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Footer mit Link */}
                      <div className="pt-2 border-t border-[#D9D3C7]/40 flex items-center justify-between text-[11px] text-[#5A6172] mt-2 gap-2">
                        <span className="truncate flex-1">
                          <GlossaryText text={cleanDisplayText(opt.availability)} />
                        </span>
                        {directUrl ? (
                          <a
                            href={directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#C46A2B] hover:underline font-semibold shrink-0 inline-flex items-center gap-0.5"
                          >
                            Shop / Link ↗
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Sensoren & Aktoren */}
      {components.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-bold text-lg text-[#1E2430]">
            <GlossaryText text="Sensoren & Aktoren" />
          </h3>
          {components.map((comp) => (
            <div key={comp.id} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-base text-[#1E2430]">
                  <GlossaryText text={comp.component_name} />
                </h4>
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded shrink-0">
                  Ref: {comp.concept_ref_id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comp.options.map((opt: HardwareOption) => {
                  const isSelected = opt.selected;
                  const displayCost = cleanCost(opt.cost);
                  const directUrl = extractLink(opt.availability, opt.product_link) || extractLink(opt.cost);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(comp.id, opt.id, false)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between shadow-sm relative hover:border-[#C46A2B] ${
                        isSelected
                          ? 'border-[#C46A2B] bg-[#FAF8F4] ring-2 ring-[#C46A2B]/20'
                          : 'border-[#D9D3C7] bg-white'
                      }`}
                    >
                      <div>
                        {/* Name & Preis */}
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <h5 className="font-bold text-sm text-[#1E2430] leading-snug flex-1">
                            <GlossaryText text={cleanDisplayText(opt.name)} />
                          </h5>
                          <span className="shrink-0 text-[#C46A2B] font-bold text-xs bg-white px-2 py-1 rounded border border-[#D9D3C7]/60 whitespace-nowrap shadow-2xs">
                            {displayCost}
                          </span>
                        </div>

                        {/* Specs */}
                        <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
                          {opt.interface && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                              Port: <GlossaryText text={cleanDisplayText(opt.interface)} />
                            </span>
                          )}
                          {opt.voltage && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                              <GlossaryText text={cleanDisplayText(opt.voltage)} />
                            </span>
                          )}
                          {opt.connector && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                              <GlossaryText text={cleanDisplayText(opt.connector)} />
                            </span>
                          )}
                        </div>

                        {/* Stichpunkte */}
                        {opt.pros_cons && opt.pros_cons.length > 0 && (
                          <ul className="text-xs text-[#5A6172] space-y-1.5 mb-3 list-disc pl-4">
                            {opt.pros_cons.map((pc, idx) => (
                              <li key={idx} className="leading-relaxed">
                                <GlossaryText text={cleanDisplayText(pc)} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Footer mit Link */}
                      <div className="pt-2 border-t border-[#D9D3C7]/40 flex items-center justify-between text-[11px] text-[#5A6172] mt-2 gap-2">
                        <span className="truncate flex-1">
                          <GlossaryText text={cleanDisplayText(opt.availability)} />
                        </span>
                        {directUrl ? (
                          <a
                            href={directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#C46A2B] hover:underline font-semibold shrink-0 inline-flex items-center gap-0.5"
                          >
                            Shop / Link ↗
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {saving && (
        <div className="text-xs text-[#C46A2B] italic text-right">
          Auswahl wird gespeichert...
        </div>
      )}
    </div>
  );
};