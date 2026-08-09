import React, { useState, useRef } from 'react';
import { AudioRecorder } from './AudioRecorder';
import { useProjectStore } from '@/store/state';
import { useAppStore } from '@/app/store';

export const Step1Input: React.FC = () => {
  const [notes, setNotes] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitAnalyze = useProjectStore((s) => s.submitAnalyze);
  const storeError = useProjectStore((s) => s.error);
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!notes.trim() && !uploadedFile) {
      return;
    }

    setIsAnalyzing(true);

    const result = await submitAnalyze({
      message: notes,
      imageFile: uploadedFile,
    });

    setIsAnalyzing(false);

    if (result) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 1: Projekt-Input bereitstellen
        </h2>
        <p className="text-sm text-[#5A6172] mt-1">
          Lade eine Skizze hoch, füge Notizen hinzu oder nimm eine Sprachnotiz auf, um das KI-Modell zu füttern.
        </p>
      </div>

      {/* 1. SketchDropzone */}
      <div className="border-2 border-dashed border-[#D9D3C7] bg-[#FAF8F4]/40 rounded-xl p-8 text-center hover:border-[#C46A2B] transition-colors relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-2">
          <div className="text-3xl">🖼️</div>
          <p className="text-sm font-medium text-[#1E2430]">
            {uploadedFile
              ? `Ausgewählte Skizze: ${uploadedFile.name}`
              : 'Ziehe deine Skizze hierher oder klicke zum Auswählen'}
          </p>
          <p className="text-xs text-[#5A6172]">PNG, JPG bis zu 10MB</p>
        </div>
      </div>

      {/* 2. NotesInput */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1E2430]">
          Zusätzliche Notizen & Anforderungen
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Beschreibe dein Vorhaben..."
          rows={5}
          className="w-full rounded-xl border border-[#D9D3C7] p-4 text-sm focus:outline-none focus:border-[#C46A2B] resize-none"
        />
      </div>

      {/* 3. Echter AudioRecorder */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#1E2430]">
          Ergänzende Sprachnotiz
        </label>
        <AudioRecorder />
      </div>

      {/* Fehleranzeige */}
      {storeError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {storeError.message}
        </div>
      )}

      {/* Analyse-Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!notes.trim() && !uploadedFile)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#C46A2B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A0522D] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              KI analysiert...
            </>
          ) : (
            'Analyse starten'
          )}
        </button>
      </div>
    </div>
  );
};