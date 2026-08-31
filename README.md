# Projekt_Multimodale-Generative-KI_Frontend

Draft2Device — multimodale KI-Plattform: wandelt analoge Storyboard-Skizzen in
Hardware-Specs + Quellcode um. 6-Schritte-Wizard.

## Stack

React + TypeScript + Vite, Tailwind, shadcn/ui, Zustand, TanStack Query,
React Hook Form + Zod.

Das Backend (FastAPI + OpenAI + SQLite) läuft **separat** vom Frontend-Repo
und wird künftig in ein eigenes Repository ausgelagert.

## Schnellstart

```bash
# Frontend (aus dem Projekt-Root — kein cd nötig)
npm run dev
```

Das Frontend erwartet das Backend unter `http://127.0.0.1:8000`
(Vite-Proxy in `draft2device-app/vite.config.ts`). Backend separat starten:

```bash
uvicorn main:app --reload
```

## Struktur

- `draft2device-app/src/features/step1-input … step6-ergebnis` — die 6 Wizard-Schritte
- `draft2device-app/src/api/` — API-Client-Schicht des Frontends
- Konventionen: Alle UI-Texte auf Deutsch; Design-Referenz
  `draft2device-app/reference/draft2device_prototype.html`
