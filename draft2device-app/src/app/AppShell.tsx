import React from 'react';
import { ProjectStatusRail } from '@/features/project-status/ProjectStatusRail';

interface AppShellProps {
  children: React.ReactNode;
  navigation: React.ReactNode;
  projects: React.ReactNode;
}

export function AppShell({ children, navigation, projects }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col font-sans antialiased text-[#1E2430]">
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1800px] w-full mx-auto">
        <aside className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-[#D9D3C7]/40 flex flex-col">
          {projects}
        </aside>

        <section className="lg:col-span-6 bg-white p-8 rounded-2xl shadow-md border border-[#D9D3C7]/40 min-h-[700px]">
          {navigation}
          {children}
        </section>

        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-[#D9D3C7]/40 overflow-hidden">
          <ProjectStatusRail />
        </div>
      </main>
    </div>
  );
}
