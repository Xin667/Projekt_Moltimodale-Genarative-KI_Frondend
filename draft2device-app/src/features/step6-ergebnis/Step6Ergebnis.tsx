import { useState } from 'react';
import { useProjectStore, type ProjectState } from '@/store/state';

/**
 * Schritt 6: Ergebnis & Export.
 *
 * Fasst das Projektergebnis zusammen (Metadaten, Zustände) und bietet den
 * Export als JSON bzw. PDF-Druck an.
 */
export function Step6Ergebnis() {
  const projectId = useProjectStore((s: ProjectState) => s.projectId);
  const structure = useProjectStore((s: ProjectState) => s.structure);

  const [copied, setCopied] = useState(false);

  const summaryData = {
    project_id: projectId,
    project_metadata: structure?.project_metadata ?? null,
    states: structure?.states ?? null,
    sensors: structure?.sensors ?? null,
    actuators: structure?.actuators ?? null,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(summaryData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(summaryData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'project_result.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6 w-full max-w-full print:p-0">
      {/* Header & Export-Aktionen */}
      <div className="space-y-4 border-b border-[#D9D3C7] pb-5">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
            Schritt 6 · Ergebnis & Export
          </h2>
          <p className="text-sm text-[#5A6172] mt-1">
            Dein Projektergebnis auf einen Blick — als JSON herunterladen oder als PDF speichern.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2 bg-[#C46A2B] hover:bg-[#A85820] text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <span>📄</span> JSON herunterladen
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E2430] hover:bg-black text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            {copied ? '✓ Kopiert' : 'JSON kopieren'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-[#007A5A] hover:bg-[#00664B] text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <span>🖨️</span> Als PDF speichern
          </button>
        </div>
      </div>

      {/* Projekt-Zusammenfassung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FAF8F4] border border-[#C46A2B]/30 rounded-xl p-4">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C46A2B]">
            Projekttitel
          </span>
          <h4 className="font-bold text-[#1E2430] text-lg mt-0.5">
            {structure?.project_metadata?.working_title || 'Draft2Device Projekt'}
          </h4>
          <p className="text-xs text-[#5A6172] mt-1 leading-relaxed">
            {structure?.project_metadata?.core_intention ||
              'Noch keine Analyse vorhanden — starte die Analyse in Schritt 1.'}
          </p>
        </div>

        <div className="bg-white border border-[#D9D3C7] rounded-xl p-4">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5A6172]">
            Projekt-ID
          </span>
          <p className="font-mono text-sm text-[#1E2430] mt-1 break-all">
            {projectId || '—'}
          </p>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5A6172] block mt-3">
            Komponenten
          </span>
          <p className="text-sm text-[#1E2430] mt-0.5">
            {structure ? `${structure.sensors.length} Sensoren · ${structure.actuators.length} Aktoren` : '—'}
          </p>
        </div>
      </div>

      {/* Zustände */}
      {structure && structure.states.length > 0 && (
        <div className="bg-white border border-[#D9D3C7] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[#1E2430] mb-3">
            Projekt-Zustände ({structure.states.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {structure.states.map((st) => (
              <div key={st.id} className="bg-[#FAF8F4] border border-[#D9D3C7] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#1E2430]">{st.name}</span>
                  {st.is_initial_state && (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700">
                      Start
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5A6172] mt-1 leading-relaxed">{st.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON-Ausgabe */}
      <div className="bg-[#12151B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between bg-[#1A1E27] px-4 py-2.5 border-b border-gray-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs font-mono text-gray-400">project_result.json</span>
          </div>
        </div>
        <div className="p-4 overflow-x-auto min-h-[300px] max-h-[480px]">
          <pre className="text-xs font-mono text-amber-300 leading-relaxed">
            <code>{JSON.stringify(summaryData, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
