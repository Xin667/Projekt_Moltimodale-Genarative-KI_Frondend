import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Validierung: Text darf nicht leer sein
const step1Schema = z.object({
  prompt_text: z.string().min(5, { message: "Bitte beschreibe deine Idee etwas genauer (mind. 5 Zeichen)." }),
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  onNext: (data: any) => void;
}

export const Step1Input: React.FC<Step1Props> = ({ onNext }) => {
  const [inputType, setInputType] = useState<'sketch' | 'notes' | 'audio'>('notes');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: { prompt_text: "Pflanze soll Besucher anjammern wenn durstig..." }
  });

  // Hilfsfunktion: Wandelt eine Datei in Base64 um und speichert sie im State
  const fileToBase64 = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Bitte lade nur Bilddateien hoch.");
    }
  };

  // Handler für das klassische Anklicken und Auswählen über das Dateifenster
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      fileToBase64(file);
    }
  };

  // Handler für die Drag-Events (Maus zieht Datei über die Box)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handler für das Droppen (Maus lässt Datei über der Box los)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      fileToBase64(file);
    }
  };

  const onSubmit = (data: Step1FormData) => {
    onNext({
      primary_type: inputType,
      prompt_text: data.prompt_text,
      image_base64: imageBase64,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Kachel: Eingabetyp wählen */}
      <div className="card bg-white p-6 border rounded-xl shadow-sm">
        <h3 className="text-lg font-bold mb-4">Eingabetyp wählen *</h3>
        <div className="flex gap-4">
          <button type="button" className={`flex-1 p-4 border rounded-xl text-center font-medium transition ${inputType === 'sketch' ? 'bg-orange-100 border-orange-500 text-orange-900' : 'bg-white hover:border-gray-400'}`} onClick={() => setInputType('sketch')}>📷 Bild / Skizze</button>
          <button type="button" className={`flex-1 p-4 border rounded-xl text-center font-medium transition ${inputType === 'notes' ? 'bg-orange-100 border-orange-500 text-orange-900' : 'bg-white hover:border-gray-400'}`} onClick={() => setInputType('notes')}>💬 Prompt / Text</button>
          <button type="button" className={`flex-1 p-4 border rounded-xl text-center font-medium transition ${inputType === 'audio' ? 'bg-orange-100 border-orange-500 text-orange-900' : 'bg-white hover:border-gray-400'}`} onClick={() => setInputType('audio')}>🎤 Voice / Audio</button>
        </div>
      </div>

      {/* Kachel: Integrierte Drag & Dropzone für Skizzen */}
      {inputType === 'sketch' && (
        <div className="card bg-white p-6 border rounded-xl shadow-sm">
          <h3 className="font-bold mb-2">Skizze hochladen</h3>
          
          {/* Unsichtbarer, nativer Datei-Input, der per Klick auf das Label getriggert wird */}
          <input type="file" id="fileInput" accept="image/*" className="hidden" onChange={handleFileChange} />
          
          {/* Interaktives Label, das Drag- & Drop-Events abfängt */}
          <label 
            htmlFor="fileInput"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 block text-center cursor-pointer transition ${
              dragActive 
                ? "border-orange-500 bg-orange-50 text-orange-700" 
                : imageBase64 
                  ? "border-green-500 bg-green-50/30 text-slate-800" 
                  : "border-gray-300 hover:border-orange-500 hover:bg-gray-50"
            }`}
          >
            {imageBase64 
              ? " Bild erfolgreich geladen! Ziehe ein anderes Bild hierher, um es zu ersetzen." 
              : "Zieh deine Skizze hierher oder klicke zum Auswählen"
            }
          </label>
          
          {/* Dynamische Bildvorschau */}
          {imageBase64 && (
            <div className="mt-4 p-2 border border-gray-200 bg-gray-50 rounded-lg max-w-xs mx-auto">
              <img src={imageBase64} className="max-h-48 mx-auto rounded object-contain" alt="Preview" />
            </div>
          )}
        </div>
      )}

      {/* Kachel: Textnotizen */}
      <div className="card bg-white p-6 border rounded-xl shadow-sm">
        <h3 className="font-bold mb-2">Text-Notizen</h3>
        <textarea {...register('prompt_text')} rows={4} className="w-full border p-3 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        {errors.prompt_text && <p className="text-red-500 text-sm mt-1">{errors.prompt_text.message}</p>}
      </div>

      {/* Absendebutton */}
      <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-sm">
        Konzept analysieren →
      </button>
    </form>
  );
};