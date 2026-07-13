# Draft2Device Frontend

Multimodale KI-Plattform: wandelt analoge Storyboard-Skizzen in
Hardware-Specs + Quellcode um. 6-Schritte-Wizard.

## Stack
React 18 + TypeScript + Vite, Tailwind, shadcn/ui, Zustand,
TanStack Query, React Hook Form + Zod

## Konventionen
- Design-Referenz: reference/draft2device_prototype.html
  (Farben, Fonts, Layout GENAU übernehmen: --paper, --copper, IBM Plex …)
- Struktur: src/features/step1-input … step6-ergebnis,
  src/components (shared), src/store (Zustand slices), src/api
- Alle UI-Texte auf Deutsch
- Backend existiert noch nicht → Mock-Daten aus src/mock/ verwenden
- Keine Klassenkomponenten, nur Function Components + Hooks