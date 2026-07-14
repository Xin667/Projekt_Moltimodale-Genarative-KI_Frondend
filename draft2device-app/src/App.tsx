import React from 'react';
import { AppShell } from './app/AppShell';
import { Stepper } from './app/Stepper';
import { useAppStore } from './app/store';

// Eure echten Schritt-Komponenten importieren
import { Step1Input } from './features/step1-input/Step1Input';

export default function AppShowcase() {
  // Wir holen uns den aktuellen Fortschritt aus eurem Store
  const { currentStep, maxStepReached, setCurrentStep } = useAppStore();

  return (
    <AppShell 
      navigation={
        <Stepper 
          currentStep={currentStep} 
          unlockedStep={maxStepReached} 
          onStepClick={setCurrentStep} 
        />
      }
    >
      {/* Zeige den Inhalt passend zum ausgewählten Schritt */}
      {currentStep === 1 && <Step1Input />}
      {currentStep === 2 && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Schritt 2: Klärung (KI-Fragen)</h2>
          <p className="text-gray-500">Hier entstehen bald die interaktiven Rückfragen der KI.</p>
        </div>
      )}
      {currentStep === 3 && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Schritt 3: Hardware-Auswahl</h2>
          <p className="text-gray-500">Hier werden die passenden Boards ausgewählt.</p>
        </div>
      )}
      {currentStep === 4 && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Schritt 4: Struktur</h2>
          <p className="text-gray-500">Hier wird die Code-Struktur festgelegt.</p>
        </div>
      )}
      {currentStep === 5 && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Schritt 5: Quellcode</h2>
          <p className="text-gray-500">Hier wird der finale Code generiert.</p>
        </div>
      )}
      {currentStep === 6 && (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Schritt 6: Ergebnis</h2>
          <p className="text-gray-500">Hier siehst du die fertige Zusammenfassung.</p>
        </div>
      )}
    </AppShell>
  );
}