import React from 'react';
import { AppShell } from './app/AppShell';
import { Stepper } from './app/Stepper';
import { useAppStore } from './app/store';

// Eure echten Schritt-Komponenten importieren
import { Step1Input } from './features/step1-input/Step1Input';
import { Step2Klaerung } from './features/step2-klaerung/Step2Klaerung';
import { Step3Hardware } from './features/step3-hardware/Step3Hardware';
import { Button, buttonVariants } from './components/ui/button';
import { Step4Struktur } from './features/step4-struktur/Step4Struktur';
import { Step5Quellcode } from './features/step5-quellcode/Step5Quellcode';
import { Step6Ergebnis } from './features/step6-ergebnis/Step6Ergebnis';

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
      <div className="pb-6">
      {/* Zeige den Inhalt passend zum ausgewählten Schritt */}
      {currentStep === 1 && <Step1Input />}
      {currentStep === 2 && <Step2Klaerung />}
      {currentStep === 3 && <Step3Hardware />}
      {currentStep === 4 && <Step4Struktur />}
      {currentStep === 5 && <Step5Quellcode />}
      {currentStep === 6 && <Step6Ergebnis />}
      </div>
      <div className="flex justify-end">
        <Button
          className={buttonVariants({ variant: 'default' })}
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep >= 6}
        >
          Weiter zu Schritt {currentStep + 1 <= 6 ? currentStep + 1 : 'fertig'}
        </Button>
      </div>
    </AppShell>
  );
}