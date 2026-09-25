import { useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import JSZip from 'jszip';
import type { GeneratedCodeResult } from '@/api/types';
import { useProjectStore, type ProjectState } from '@/store/state';

/**
 * Schritt 6: Ergebnis & Export.
 *
 * Fasst das Projektergebnis zusammen (Metadaten, Zustände)
 * und bietet den Export als JSON bzw. PDF-Druck an.
 */
export function Step6Ergebnis() {
  const projectId = useProjectStore((s: ProjectState) => s.projectId);
  const structure = useProjectStore((s: ProjectState) => s.structure);

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

  const componentCount = structure
    ? `${structure.sensors.length} Sensoren · ${structure.actuators.length} Aktoren`
    : '—';

  return (
    <div className="w-full max-w-full space-y-6 print:p-0">
      <div className="space-y-4 border-b border-[#D9D3C7] pb-5">
        <h2 className="font-sans text-2xl font-bold text-[#1E2430]">
          Schritt 6 · Ergebnis & Export
        </h2>

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

      {/* Projekt-Zusammenfassung */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#C46A2B]/30 bg-[#FAF8F4] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C46A2B]">
            Projekttitel
          </span>

          <h4 className="mt-0.5 text-lg font-bold text-[#1E2430]">
            {structure?.project_metadata?.working_title ||
              'Draft2Device Projekt'}
          </h4>

          <p className="mt-1 text-xs leading-relaxed text-[#5A6172]">
            {structure?.project_metadata?.core_intention ||
              'Noch keine Analyse vorhanden — starte die Analyse in Schritt 1.'}
          </p>
        </div>

        <div className="rounded-xl border border-[#D9D3C7] bg-white p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A6172]">
            Projekt-ID
          </span>

          <p className="mt-1 break-all font-mono text-sm text-[#1E2430]">
            {projectId || '—'}
          </p>

          <span className="mt-3 block text-[10px] font-semibold uppercase tracking-wider text-[#5A6172]">
            Komponenten
          </span>

          <p className="mt-0.5 text-sm text-[#1E2430]">
            {componentCount}
          </p>
        </div>
      </div>

      {/* Zustände */}
      {structure && structure.states.length > 0 && (
        <div className="rounded-xl border border-[#D9D3C7] bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#1E2430]">
            Projekt-Zustände ({structure.states.length})
          </h3>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {structure.states.map((state) => (
              <div
                key={state.id}
                className="rounded-lg border border-[#D9D3C7] bg-[#FAF8F4] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1E2430]">
                    {state.name}
                  </span>

                  {state.is_initial_state && (
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700">
                      Start
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs leading-relaxed text-[#5A6172]">
                  {state.description}
                </p>
              </div>
            ))}
          </div>
        </div>
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