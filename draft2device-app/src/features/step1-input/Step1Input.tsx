import React, { useState } from 'react';
import { AudioRecorder } from './AudioRecorder';

export const Step1Input: React.FC = () => {
  const [notes, setNotes] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
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
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
        <div className="space-y-2">
          <div className="text-3xl">🖼️</div>
          <p className="text-sm font-medium text-[#1E2430]">
            {uploadedFile ? `Ausgewählte Skizze: ${uploadedFile}` : 'Ziehe deine Skizze hierher oder klicke zum Auswählen'}
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
    </div>
  );
};