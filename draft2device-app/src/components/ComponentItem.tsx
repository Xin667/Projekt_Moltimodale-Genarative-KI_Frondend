import { InfoTooltip } from "@/components/ui/info-tooltip"; 

// Begriffs-Erklärungen für schwierige Wörter von der KI
export const GLOSSARY: Record<string, string> = {
  actuator: "Aktoren sind die 'Muskeln und Stimme' deines Projekts. Sie führen Aktionen aus – z. B. eine LED, die leuchtet, oder ein Motor, der sich dreht.",
  sensor: "Sensoren sind das 'Auge und Ohr' deines Projekts. Sie messen Umweltwerte (z. B. Temperatur oder Feuchtigkeit).",
  microcontroller: "Das Gehirn deines Projekts (z. B. ESP32). Er steuert Sensoren und Aktoren per Code.",
  "power supply": "Stromversorgung: Liefert die nötige elektrische Spannung für alle Bauteile.",
  "passive component": "Passives Bauteil (z. B. ein Widerstand). Es benötigt keine eigene Steuerung, schützt aber andere Bauteile."
};

interface ComponentItemProps {
  name: string;
  category: string;
}

export function ComponentItem({ name, category }: ComponentItemProps) {
  // Wandelt das Wort von der KI in Kleinbuchstaben um (z. B. "Actuator" -> "actuator")
  const catKey = category.toLowerCase();
  const explanation = GLOSSARY[catKey];

  return (
    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-md bg-white">
      <span className="font-semibold text-sm text-[#1E2430]">{name}</span>
      <span className="text-xs text-gray-500">({category})</span>

      {/* Wenn für das Wort der KI eine Erklärung im GLOSSARY existiert, zeige den Tooltip */}
      {explanation && (
        <InfoTooltip text={explanation} side="top" />
      )}
    </div>
  );
}