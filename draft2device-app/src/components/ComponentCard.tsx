import { InfoTooltip } from "@/components/ui/info-tooltip"; 
import { GLOSSARY } from "@/constants/glossary";

export function ComponentCard({ name, category }: { name: string; category: string }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="font-bold">{name}</h3>
      
      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
        <span>Kategorie: {category}</span>
        
        {category.toLowerCase() === "sensor" && (
          <InfoTooltip text={GLOSSARY.sensor} side="top" />
        )}
        {category.toLowerCase() === "actuator" && (
          <InfoTooltip text={GLOSSARY.actuator} side="top" />
        )}
        {category.toLowerCase() === "microcontroller" && (
          <InfoTooltip text={GLOSSARY.microcontroller} side="top" />
        )}
      </div>
    </div>
  );
}