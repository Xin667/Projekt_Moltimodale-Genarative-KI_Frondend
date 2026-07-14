import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
  navigation: React.ReactNode; // Hier landet der Stepper!
}

export function AppShell({ children, navigation }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col font-sans antialiased text-[#1E2430]">
      {/* Das 3-Spalten-Layout über Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1800px] w-full mx-auto">
        
        {/* LINKE SPALTE: DEIN Stepper als Navigation (3 von 12 Spalten) */}
        <aside className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-[#D9D3C7]/40 flex flex-col">
          {navigation}
        </aside>

        {/* MITTLERE SPALTE: Der Hauptarbeitsbereich für die Schritte (6 von 12 Spalten) */}
        <section className="lg:col-span-6 bg-white p-8 rounded-2xl shadow-md border border-[#D9D3C7]/40 min-h-[700px]">
          {children}
        </section>

        {/* RECHTE SPALTE: KI-Assistent & Empfehlungen (3 von 12 Spalten) */}
        <aside className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-[#D9D3C7]/40 flex flex-col gap-4">
          <h3 className="font-bold text-lg text-[#1E2430] border-b border-[#D9D3C7] pb-2">KI-Assistent</h3>
          <div className="bg-orange-50/40 text-sm p-4 rounded-xl border border-orange-100/50 leading-relaxed">
            "Ich helfe dir dabei, deine Skizze in echten Code zu verwandeln. Lass uns mit Schritt 1 starten!"
          </div>
        </aside>

      </main>
    </div>
  );
}