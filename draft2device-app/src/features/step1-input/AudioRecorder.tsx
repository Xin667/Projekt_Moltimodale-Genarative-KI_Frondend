import React, { useState, useRef } from 'react';
import { useAppStore } from '../../app/store';

export function AudioRecorder() {
  const { step1Data, setStep1Data } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. Aufnahme starten
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Wir lassen den Browser entscheiden, welches Format er am besten kann (webm, ogg oder mp4)
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Hier ist der Trick: Wir nehmen genau den Typen, den der Recorder erzeugt hat!
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setStep1Data({ audioUrl });
        
        // Mikrofon ausschalten
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mikrofon-Zugriff fehlgeschlagen:", err);
      alert("Bitte erlaube den Mikrofon-Zugriff in deinem Browser oben links in der Adresszeile!");
    }
  };

  // 2. Aufnahme stoppen
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 3. Aufnahme löschen
  const deleteRecording = () => {
    setStep1Data({ audioUrl: null });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between p-5 bg-orange-50/20 border border-[#D9D3C7]/40 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-[#5A6172]'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#1E2430]">
              {isRecording ? 'Nimmt auf...' : 'Sprachnotiz aufnehmen'}
            </h4>
            <p className="text-xs text-[#5A6172]">
              {isRecording ? 'Sprich jetzt... Klicke auf Stopp zum Beenden.' : 'Erkläre deine Skizze einfach per Sprache.'}
            </p>
          </div>
        </div>

        <div>
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              Stoppen
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 text-[#1E2430] border border-[#D9D3C7] text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              Aufnahme starten
            </button>
          )}
        </div>
      </div>

      {/* Audio-Player */}
      {step1Data.audioUrl && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 w-full max-w-md">
            <span className="text-xs font-semibold text-gray-500">Deine Aufnahme:</span>
            <audio src={step1Data.audioUrl} controls className="h-8 w-full" />
          </div>
          <button
            type="button"
            onClick={deleteRecording}
            className="text-xs text-red-600 hover:text-red-800 hover:underline font-semibold"
          >
            Löschen & neu aufnehmen
          </button>
        </div>
      )}
    </div>
  );
}