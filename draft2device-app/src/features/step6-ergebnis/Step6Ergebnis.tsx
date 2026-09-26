import { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import JSZip from 'jszip';
import type { GeneratedCodeResult } from '@/api/types';
import { useProjectStore, type ProjectState } from '@/store/state';
import {
  getCircuitDiagram,
  getLatestCode,
  getLatestHardwareSelection,
} from '@/api/api';
import type {
  CircuitDiagramResponse,
  GeneratedCodeResult,
  HardwareResult,
} from '@/api/types';
import { StaticSchematic } from './StaticSchematic';
import { signalColor, signalTypesInUse } from './schematicTheme';

/** Eine Zeile der Stückliste — je Bauteil bzw. Controller die gewählte Option. */
interface BomRow {
  id: string;
  name: string;
  category: string;
  detail: string;
  voltage: string;
  cost: string;
}

/**
 * Schritt 6: Ergebnis & Export.
 *
 * Fasst das komplette Projektergebnis zusammen: Analyse-Metadaten, den finalen
 * Schaltplan aus Schritt 4, die Hardware-Stückliste aus Schritt 3 und den
 * generierten Quellcode aus Schritt 5. Alle Abschnitte sind druckoptimiert,
 * damit "Als PDF speichern" ein vollständiges Dokument ergibt.
 */
export function Step6Ergebnis() {
  const projectId = useProjectStore((s: ProjectState) => s.projectId);
  const structure = useProjectStore((s: ProjectState) => s.structure);

  const [diagram, setDiagram] = useState<CircuitDiagramResponse | null>(null);
  const [hardware, setHardware] = useState<HardwareResult | null>(null);
  const [code, setCode] = useState<GeneratedCodeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [codeResult, setCodeResult] = useState<GeneratedCodeResult | null>(null);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  /**
   * Projekt-Code laden.
   *
   * AbortController verhindert, dass ein veralteter Request
   * nach einem projectId-Wechsel noch State aktualisiert.
   */
  useEffect(() => {
    if (!projectId) {
      setCodeResult(null);
      setActiveFilePath('');
      setCodeLoading(false);
      setCodeError(null);
      return;
    }

    const controller = new AbortController();

    const loadCode = async () => {
      setCodeLoading(true);
      setCodeError(null);

      try {
        const response = await fetch(
          `/code/${encodeURIComponent(projectId)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(
            `Code konnte nicht geladen werden (HTTP ${response.status}).`,
          );
        }

        const result = (await response.json()) as GeneratedCodeResult;

        setCodeResult(result);
        setActiveFilePath(result.files[0]?.path ?? '');
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setCodeError(
          error instanceof Error
            ? error.message
            : 'Code konnte nicht geladen werden.',
        );
        setCodeResult(null);
        setActiveFilePath('');
      } finally {
        if (!controller.signal.aborted) {
          setCodeLoading(false);
        }
      }
    };

    void loadCode();

    return () => controller.abort();
  }, [projectId]);

  /**
   * Exportdaten nur neu erzeugen, wenn sich die relevanten
   * Projektdaten tatsächlich ändern.
   */
  const summaryData = useMemo(
    () => ({
      project_id: projectId,
      project_metadata: structure?.project_metadata ?? null,
      states: structure?.states ?? null,
      sensors: structure?.sensors ?? null,
      actuators: structure?.actuators ?? null,
    }),
    [projectId, structure],
  );

  const summaryJson = useMemo(
    () => JSON.stringify(summaryData, null, 2),
    [summaryData],
  );

  /**
   * Wenn die aktuell gewählte Datei nicht mehr existiert,
   * automatisch auf die erste Datei zurückfallen.
   */
  const activeCodeFile = useMemo(() => {
    if (!codeResult?.files.length) {
      return undefined;
    }

    return (
      codeResult.files.find((file) => file.path === activeFilePath) ??
      codeResult.files[0]
    );
  }, [codeResult, activeFilePath]);

  const handleCopyCode = async () => {
    if (!activeCodeFile) return;

    try {
      await navigator.clipboard.writeText(activeCodeFile.content);
      setCodeCopied(true);

      window.setTimeout(() => {
        setCodeCopied(false);
      }, 2000);
    } catch {
      setCodeError('Code konnte nicht in die Zwischenablage kopiert werden.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryJson);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCodeError('JSON konnte nicht in die Zwischenablage kopiert werden.');
    }
  };

  const handleDownloadJSON = async () => {
    const zip = new JSZip();

    zip.file('project_result.json', summaryJson);

    for (const file of codeResult?.files ?? []) {
      zip.file(file.path, file.content);
    }

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6,
      },
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${projectId || 'draft2device'}_export.zip`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // URL erst nach dem Download-Vorgang freigeben.
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#5A6172]">
        <div className="inline-block w-8 h-8 border-2 border-[#C46A2B] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium animate-pulse">Ergebnis wird zusammengestellt...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 print:p-0">
      <div className="space-y-4 border-b border-[#D9D3C7] pb-5">
        <div>
          <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
            Schritt 6 · Ergebnis & Export
          </h2>
          <p className="text-sm text-[#5A6172] mt-1">
            Dein komplettes Projektergebnis — Schaltplan, Stückliste und Quellcode.
            Als JSON herunterladen oder als PDF speichern.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => void handleDownloadJSON()}
            className="rounded-full bg-[#C46A2B] px-4 py-2 text-xs font-semibold text-white"
          >
            📦 JSON + Quellcode als ZIP
          </button>

          <button
            type="button"
            onClick={() => void handleCopy()}
            className="rounded-full bg-[#1E2430] px-4 py-2 text-xs font-semibold text-white"
          >
            {copied ? '✓ Kopiert' : 'JSON kopieren'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-[#007A5A] px-4 py-2 text-xs font-semibold text-white"
          >
            🖨️ Als PDF speichern
          </button>
        </div>
      </div>

      {/* Projekt-Übersicht */}
      <section className="print-break-avoid">
        <h3 className="text-sm font-bold text-[#1E2430] uppercase tracking-wider mb-3">
          Projekt-Übersicht
        </h3>
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
              Umfang
            </span>
            <p className="text-sm text-[#1E2430] mt-0.5">
              {bom.length > 0 ? `${bom.length} Bauteile` : '—'}
              {diagram ? ` · ${diagram.connections.length} Verbindungen` : ''}
              {code ? ` · ${code.files.length} Dateien` : ''}
            </p>
          </div>
        </div>

        {structure && structure.states.length > 0 && (
          <div className="bg-white border border-[#D9D3C7] rounded-xl p-4 mt-4">
            <h4 className="text-sm font-semibold text-[#1E2430] mb-3">
              Projekt-Zustände ({structure.states.length})
            </h4>
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
      </section>

      {/* 1.1 Schaltplan — steht bewusst VOR dem Quellcode */}
      {diagram && (
        <section className="space-y-4 print-break-avoid">
          <h3 className="text-sm font-bold text-[#1E2430] uppercase tracking-wider">
            Schaltplan
            <span className="ml-2 font-normal normal-case tracking-normal text-xs text-[#5A6172]">
              {diagram.title}
            </span>
          </h3>

          <div className="bg-white border border-[#D9D3C7] rounded-xl p-4">
            <p className="text-xs text-[#5A6172] leading-relaxed mb-3">{diagram.summary}</p>

            <StaticSchematic
              components={diagram.components}
              connections={diagram.connections}
            />

            {/* Legende */}
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-[#D9D3C7]/60">
              {signalTypesInUse(diagram.components, diagram.connections).map((type) => (
                <span key={type} className="flex items-center gap-1.5 text-[10px] text-[#5A6172]">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: signalColor(type) }}
                  />
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Montageschritte */}
          {diagram.assembly_steps.length > 0 && (
            <div className="bg-white border border-[#D9D3C7] rounded-xl p-4">
              <h4 className="text-xs font-bold text-[#1E2430] uppercase tracking-wider mb-3">
                Montageschritte ({diagram.assembly_steps.length})
              </h4>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {diagram.assembly_steps.map((step) => (
                  <li
                    key={step.step_number}
                    className="text-xs p-2.5 rounded-lg border border-gray-200/80 bg-white text-[#5A6172] leading-relaxed print-break-avoid"
                  >
                    <span className="font-bold text-[#C46A2B] mr-2">{step.step_number}.</span>
                    {step.instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Stromversorgung + Sicherheitshinweise */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagram.power_requirements.length > 0 && (
              <div className="bg-white border border-[#D9D3C7] rounded-xl p-4 print-break-avoid">
                <h4 className="text-xs font-bold text-[#1E2430] uppercase tracking-wider mb-3">
                  Stromversorgung
                </h4>
                <ul className="space-y-2">
                  {diagram.power_requirements.map((req, idx) => {
                    const comp = diagram.components.find((c) => c.id === req.component_id);
                    return (
                      <li key={idx} className="text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                        <span className="font-semibold text-[#1E2430] block leading-tight">
                          {comp?.name || req.component_id}
                        </span>
                        <span className="text-[#C46A2B] font-bold text-[11px] inline-block my-0.5">
                          {req.voltage}
                        </span>
                        <p className="text-[11px] text-[#5A6172] leading-snug">{req.note}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {diagram.safety_notes.length > 0 && (
              <div className="bg-white border border-[#D9D3C7] rounded-xl p-4 print-break-avoid">
                <h4 className="text-xs font-bold text-[#1E2430] uppercase tracking-wider mb-3">
                  Sicherheitshinweise
                </h4>
                <ul className="space-y-2">
                  {diagram.safety_notes.map((note, idx) => (
                    <li key={idx} className="text-[11px] text-[#5A6172] leading-snug flex items-start gap-2">
                      <span className="text-[#C46A2B] font-bold shrink-0">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Code-Ergebnis */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#12151B] shadow-xl">
        <div className="flex min-h-12 items-end border-b border-gray-800 bg-[#1A1E27]">
          <div className="flex shrink-0 items-center gap-1.5 self-stretch px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>

          <div className="flex min-w-0 flex-1 self-stretch overflow-x-auto">
            {codeResult?.files.map((file) => {
              const isActive = file.path === activeCodeFile?.path;

              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setActiveFilePath(file.path)}
                  className={[
                    'min-w-0 flex-1 truncate border-r border-[#2B313F]',
                    'px-3 text-xs font-mono',
                    isActive
                      ? 'border-t border-t-[#C46A2B] bg-[#12151B] text-gray-200'
                      : 'text-gray-500 hover:text-gray-300',
                  ].join(' ')}
                  aria-selected={isActive}
                  role="tab"
                >
                  {file.path}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => void handleCopyCode()}
            disabled={!activeCodeFile}
            title="Aktuelle Code-Datei kopieren"
            aria-label="Aktuelle Code-Datei kopieren"
            className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-[#2B313F] hover:text-white disabled:opacity-40"
          >
            {codeCopied ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
          </button>
        </div>

        <div
          className={[
            'border-b border-[#2B313F] bg-[#1A1E27]',
            'px-4 py-2 text-xs font-mono',
            codeError ? 'text-red-400' : 'text-gray-400',
          ].join(' ')}
        >
          {codeLoading
            ? 'Code wird geladen...'
            : codeError || ''}
        </div>

        <div className="min-h-[360px] max-h-[520px] overflow-x-auto p-4">
          <pre className="text-xs font-mono leading-relaxed text-emerald-400">
            <code>
              {activeCodeFile?.content ||
                'Noch keine Code-Ergebnisse vorhanden.'}
            </code>
          </pre>
        </div>
      </div>

      {/* JSON-Ausgabe */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#12151B] shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 bg-[#1A1E27] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />

            <span className="ml-3 font-mono text-xs text-gray-400">
              project_result.json
            </span>
          </div>
        </div>

        <div className="min-h-[300px] max-h-[480px] overflow-x-auto p-4">
          <pre className="font-mono text-xs leading-relaxed text-amber-300">
            <code>{summaryJson}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
      {/* 1.2 Hardware-Stückliste */}
      {bom.length > 0 && (
        <section className="print-break-avoid">
          <h3 className="text-sm font-bold text-[#1E2430] uppercase tracking-wider mb-3">
            Hardware-Stückliste ({bom.length})
          </h3>
          <div className="border border-[#D9D3C7] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[#D9D3C7] text-[#1E2430] font-semibold">
                <tr>
                  <th className="p-3 pl-4">#</th>
                  <th className="p-3">Bauteil</th>
                  <th className="p-3">Kategorie</th>
                  <th className="p-3">Details</th>
                  <th className="p-3 pr-4 text-right">Preis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D3C7]/40 text-[#5A6172]">
                {bom.map((row, idx) => (
                  <tr key={row.id} className="align-top">
                    <td className="p-3 pl-4 font-mono text-[#9CA3AF]">{idx + 1}</td>
                    <td className="p-3 font-medium text-[#1E2430]">
                      {row.name}
                      {row.voltage && (
                        <span className="block font-normal text-[11px] text-[#C46A2B] mt-0.5">
                          {row.voltage}
                        </span>
                      )}
                    </td>
                    <td className="p-3">{row.category}</td>
                    <td className="p-3 text-[11px]">{row.detail || '—'}</td>
                    <td className="p-3 pr-4 text-right font-medium text-[#1E2430] whitespace-nowrap">
                      {row.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 1.1/1.3 Quellcode — unter dem Schaltplan */}
      {code && code.files.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#1E2430] uppercase tracking-wider">
            Quellcode ({code.files.length} Dateien)
          </h3>
          {code.files.map((file) => (
            <div
              key={file.path}
              className="bg-[#12151B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl print:bg-white print:border-gray-300 print:shadow-none print-break-avoid"
            >
              <div className="flex items-center gap-1.5 bg-[#1A1E27] px-4 py-2.5 border-b border-gray-800 print:bg-white print:border-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 print:hidden" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 print:hidden" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 print:hidden" />
                <span className="ml-3 text-xs font-mono text-gray-300 print:text-[#1E2430] print:font-semibold">
                  {file.path}
                </span>
              </div>
              <div className="p-4 overflow-x-auto max-h-[420px] print:max-h-none print:overflow-visible">
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed print:text-[#1E2430]">
                  <code>{file.content}</code>
                </pre>
              </div>
            </div>
          ))}

          {/* Offene Konfigurationsangaben (nur am Bildschirm) */}
          {code.config_questions.length > 0 && (
            <div className="rounded-xl border border-[#C46A2B]/30 bg-orange-50/40 p-4 print:hidden">
              <p className="text-xs text-[#5A6172]">
                Hinweis: {code.config_questions.length} Angabe(n) im Code nutzen noch
                Beispielwerte. Du kannst sie in Schritt 5 anpassen.
              </p>
            </div>
          )}
        </section>
      )}

      {/* JSON-Ausgabe (nur am Bildschirm — im PDF redundant zu den Abschnitten oben) */}
      <section className="print:hidden">
        <h3 className="text-sm font-bold text-[#1E2430] uppercase tracking-wider mb-3">
          Rohdaten (JSON)
        </h3>
        <div className="bg-[#12151B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 overflow-x-auto min-h-[200px] max-h-[420px]">
            <pre className="text-xs font-mono text-amber-300 leading-relaxed">
              <code>{JSON.stringify(summaryData, null, 2)}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Baut aus dem Hardware-Ergebnis die Stückliste: je Eintrag die gewählte Option. */
function buildBom(hardware: HardwareResult): BomRow[] {
  const rows: BomRow[] = [];

  for (const controller of hardware.controllers) {
    const selected = controller.options.find((o) => o.selected) ?? controller.options[0];
    if (!selected) continue;
    rows.push({
      id: controller.id,
      name: selected.name,
      category: 'Microcontroller',
      detail: selected.supported_interfaces?.join(', ') ?? controller.role ?? '',
      voltage: selected.voltage,
      cost: selected.cost || '—',
    });
  }

  for (const component of hardware.hardware_components) {
    const selected = component.options.find((o) => o.selected) ?? component.options[0];
    if (!selected) continue;
    rows.push({
      id: component.id,
      name: selected.name,
      category: component.component_name,
      detail: selected.interface || selected.connector || '',
      voltage: selected.voltage,
      cost: selected.cost || '—',
    });
  }

  return rows;
}
