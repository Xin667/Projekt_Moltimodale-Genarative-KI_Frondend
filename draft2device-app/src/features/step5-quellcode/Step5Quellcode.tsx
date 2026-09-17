import { useCallback, useEffect, useState } from 'react';
import { useProjectStore, type ProjectState } from '@/store/state';
import {
  answerCodeQuestions,
  codeDownloadUrl,
  generateCode,
  getLatestCode,
  toApiError,
} from '@/api/api';
import type { ConfigQuestion, GeneratedFile } from '@/api/types';

/**
 * Schritt 5: Quellcode.
 *
 * Lädt die generierten Dateien über GET /code/{project_id}. Existiert noch
 * kein Code, kann er hier per POST /code erzeugt werden. Offene
 * config_questions (WLAN-Zugangsdaten, Schwellenwerte …) lassen sich direkt
 * beantworten — die Antworten landen in den "{{KEY}}"-Platzhaltern.
 */
export function Step5Quellcode() {
  const projectId = useProjectStore((s: ProjectState) => s.projectId);

  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [questions, setQuestions] = useState<ConfigQuestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) {
      setError('Keine aktive Projekt-ID vorhanden.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getLatestCode(projectId);
      setFiles(result.files);
      setQuestions(result.config_questions);
      setActiveIndex(0);
    } catch (caught) {
      const apiError = toApiError(caught);
      // 404 = für dieses Projekt wurde noch kein Code erzeugt.
      setError(apiError.status === 404 ? null : apiError.message);
      setFiles([]);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate() {
    if (!projectId) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateCode(projectId);
      setFiles(result.files);
      setQuestions(result.config_questions);
      setActiveIndex(0);
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleAnswer(key: string, value: string) {
    if (!projectId) return;
    try {
      const result = await answerCodeQuestions(projectId, { [key]: value });
      setFiles(result.files);
      // "unanswered" enthält die noch offenen Fragen — daraus die neue Liste bauen.
      setQuestions(result.unanswered ?? []);
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  }

  const activeFile = files[activeIndex];
  const code = activeFile?.content ?? '';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = activeFile.path.split('/').pop() || 'code.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[#5A6172]">
        <div className="inline-block w-8 h-8 border-2 border-[#C46A2B] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="font-medium animate-pulse">Quellcode wird geladen...</p>
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
            Der generierte Code für deinen Controller — passend zur Verkabelung aus Schritt 4.
          </p>
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={projectId ? codeDownloadUrl(projectId) : '#'}
              className="flex items-center gap-2 px-4 py-2 bg-[#007A5A] hover:bg-[#00664B] text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              <span>📦</span> Alle Dateien (.zip)
            </a>
            <button
              type="button"
              onClick={handleDownloadFile}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D9D3C7] hover:bg-gray-50 text-[#1E2430] rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              <span>⬇️</span> Diese Datei
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-[#1E2430] hover:bg-black text-white rounded-full text-xs font-semibold shadow-sm transition-all whitespace-nowrap active:scale-95"
            >
              {copied ? '✓ Kopiert' : 'Inhalt kopieren'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <p className="font-bold mb-1">Fehler:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Noch kein Code erzeugt */}
      {files.length === 0 && !error && (
        <div className="rounded-xl border border-[#D9D3C7] bg-[#FAF8F4] p-8 text-center">
          <p className="text-sm text-[#5A6172] mb-4">
            Für dieses Projekt wurde noch kein Quellcode erzeugt.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-[#C46A2B] hover:bg-[#A0522D] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {generating ? 'Code wird generiert…' : 'Quellcode generieren'}
          </button>
        </div>
      )}

      {/* Offene Konfigurationsfragen */}
      {questions.length > 0 && (
        <div className="rounded-xl border border-[#C46A2B]/30 bg-orange-50/40 p-4">
          <h3 className="text-sm font-semibold text-[#1E2430] mb-1">
            Noch offene Angaben ({questions.length})
          </h3>
          <p className="text-xs text-[#5A6172] mb-3">
            Solange du nichts einträgst, nutzt der Code die vorgeschlagenen Beispielwerte.
          </p>
          <div className="space-y-2">
            {questions.map((q) => (
              <ConfigQuestionRow key={q.key} question={q} onAnswer={handleAnswer} />
            ))}
          </div>
        </div>
      )}

      {/* Code-Viewer mit Datei-Tabs */}
      {files.length > 0 && activeFile && (
        <div className="bg-[#12151B] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex flex-wrap items-center gap-1.5 bg-[#1A1E27] px-4 py-2.5 border-b border-gray-800">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <div className="ml-3 flex flex-wrap gap-1">
              {files.map((file, index) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    index === activeIndex
                      ? 'bg-[#12151B] text-emerald-400 border border-gray-700 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                >
                  {file.path}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 overflow-x-auto min-h-[420px] max-h-[560px]">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConfigQuestionRowProps {
  question: ConfigQuestion;
  onAnswer: (key: string, value: string) => void;
}

/** Rendert je nach input_type ein Textfeld, einen Slider oder eine Auswahl. */
function ConfigQuestionRow({ question, onAnswer }: ConfigQuestionRowProps) {
  const [value, setValue] = useState(question.example ?? '');

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed) onAnswer(question.key, trimmed);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg border border-[#D9D3C7] px-3 py-2">
      <span className="text-xs text-[#1E2430] font-medium flex-1 min-w-[200px]">
        {question.question}
        <span className="ml-1 font-mono text-[10px] text-[#9CA3AF]">{question.key}</span>
      </span>

      {question.input_type === 'single_choice' && question.options ? (
        <select
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onAnswer(question.key, e.target.value);
          }}
          className="text-xs border border-[#D9D3C7] rounded-lg px-2 py-1 focus:outline-none focus:border-[#C46A2B]"
        >
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : question.input_type === 'slider' ? (
        <span className="flex items-center gap-2">
          <input
            type="range"
            min={question.min ?? 0}
            max={question.max ?? 100}
            value={Number(value) || question.min || 0}
            onChange={(e) => setValue(e.target.value)}
            onMouseUp={commit}
            onTouchEnd={commit}
            className="accent-[#C46A2B]"
          />
          <span className="text-xs font-mono text-[#1E2430] min-w-[32px] text-right">{value}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={question.example ?? ''}
            className="text-xs border border-[#D9D3C7] rounded-lg px-2 py-1 w-[200px] focus:outline-none focus:border-[#C46A2B]"
          />
          <button
            type="button"
            onClick={commit}
            className="text-[11px] px-2 py-1 rounded-lg bg-[#C46A2B] text-white font-semibold hover:bg-[#A0522D]"
          >
            Übernehmen
          </button>
        </span>
      )}
    </div>
  );
}
