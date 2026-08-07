import React from 'react';

interface AppShellProps {
  sidebarLeft: React.ReactNode;
  mainContent: React.ReactNode;
  sidebarRight: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  sidebarLeft,
  mainContent,
  sidebarRight,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1E2430] antialiased selection:bg-orange-200">
      <div className="mx-auto max-w-[1600px] min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr_320px] divide-x divide-[#D9D3C7]">
        <aside className="bg-[#FAF8F4]/85 backdrop-blur-sm p-6 overflow-y-auto z-10">
          {sidebarLeft}
        </aside>
        <main className="bg-white p-8 overflow-y-auto pb-24">
          <div className="max-w-3xl mx-auto">
            {mainContent}
          </div>
        </main>
        <aside className="bg-white/60 backdrop-blur-sm p-6 overflow-y-auto hidden xl:block">
          {sidebarRight}
        </aside>
      </div>
    </div>
  );
};