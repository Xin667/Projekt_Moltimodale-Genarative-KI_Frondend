import React from 'react';
import { ProjectStatusRail } from '@/features/project-status/ProjectStatusRail';

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

        {/* RECHTE SPALTE: Single Point of Truth — aktueller Projektstatus (3 von 12) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-[#D9D3C7]/40 overflow-hidden">
          <ProjectStatusRail />
        </div>
      </main>
    </div>
  );
}