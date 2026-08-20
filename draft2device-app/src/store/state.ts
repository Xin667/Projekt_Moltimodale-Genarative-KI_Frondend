import { create } from 'zustand'
import {
  ApiError,
  analyze,
  createProject,
  formatAnswersAsMessage,
  resetMockState,
  toApiError,
} from '@/api/api'
import type { AnalyzeResult, AnswersMap, OpenQuestion } from '@/api/types'

export type ProjectStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface ProjectState {
  // --- Bestehende Server & API Felder ---
  projectId: string | null
  structure: AnalyzeResult | null
  status: ProjectStatus
  error: ApiError | null
  /** Zählt jede Aktualisierung der Struktur — entspricht dem "v3" in der IR-Leiste. */
  version: number

  // --- NEU: Formular-Eingaben aus den Schritten 1–4 ---
  sketchFile: File | null
  notes: string
  performancePriority: number
  uiTheme: 'light' | 'dark' | ''
  openPrompt: string
  primaryHardwareId: string
  secondaryHardwareIds: string[]
  structureAdjustments: string

  // --- Bestehende Setters ---
  setProjectId: (id: string | null) => void
  setStructure: (structure: AnalyzeResult) => void
  setStatus: (status: ProjectStatus) => void
  setError: (error: ApiError | null) => void
  reset: () => void

  // --- NEU: Setters für Schritt 1–4 ---
  setSketchFile: (file: File | null) => void
  setNotes: (notes: string) => void
  setPerformancePriority: (val: number) => void
  setUiTheme: (theme: 'light' | 'dark' | '') => void
  setOpenPrompt: (prompt: string) => void
  setPrimaryHardwareId: (id: string) => void
  setSecondaryHardwareIds: (ids: string[]) => void
  toggleSecondaryHardware: (id: string) => void
  setStructureAdjustments: (adj: string) => void

  // --- API Calls ---
  startProject: (name?: string) => Promise<string>
  /** Überarbeitete submitAnalyze: Kann optional ohne Parameter aufgerufen werden und nutzt dann die Daten aus dem Store. */
  submitAnalyze: (input?: {
    message?: string
    imageFile?: File | null
  }) => Promise<AnalyzeResult | null>
  submitAnswers: (
    questions: OpenQuestion[],
    answers: AnswersMap,
    extraPrompt?: string,
  ) => Promise<AnalyzeResult | null>
}

const initialState = {
  // API State
  projectId: null,
  structure: null,
  status: 'idle',
  error: null,
  version: 0,

  // NEU: Schritt 1-4 Initialwerte
  sketchFile: null,
  notes: '',
  performancePriority: 50,
  uiTheme: '',
  openPrompt: '',
  primaryHardwareId: '',
  secondaryHardwareIds: [],
  structureAdjustments: '',
} satisfies Pick<
  ProjectState,
  | 'projectId'
  | 'structure'
  | 'status'
  | 'error'
  | 'version'
  | 'sketchFile'
  | 'notes'
  | 'performancePriority'
  | 'uiTheme'
  | 'openPrompt'
  | 'primaryHardwareId'
  | 'secondaryHardwareIds'
  | 'structureAdjustments'
>

export const useProjectStore = create<ProjectState>()((set, get) => ({
  ...initialState,

  // Bestehende Setters
  setProjectId: (projectId) => set({ projectId }),

  setStructure: (structure) =>
    set((state) => ({
      structure,
      version: state.version + 1,
      status: 'ready',
      error: null,
      projectId: structure.project_id || state.projectId,
    })),

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error, status: error ? 'error' : get().status }),

  // NEU: Setters für Formularfelder
  setSketchFile: (sketchFile) => set({ sketchFile }),
  setNotes: (notes) => set({ notes }),
  setPerformancePriority: (performancePriority) => set({ performancePriority }),
  setUiTheme: (uiTheme) => set({ uiTheme }),
  setOpenPrompt: (openPrompt) => set({ openPrompt }),
  setPrimaryHardwareId: (primaryHardwareId) => set({ primaryHardwareId }),
  setSecondaryHardwareIds: (secondaryHardwareIds) => set({ secondaryHardwareIds }),

  toggleSecondaryHardware: (id) =>
    set((state) => {
      const exists = state.secondaryHardwareIds.includes(id)
      return {
        secondaryHardwareIds: exists
          ? state.secondaryHardwareIds.filter((item) => item !== id)
          : [...state.secondaryHardwareIds, id],
      }
    }),

  setStructureAdjustments: (structureAdjustments) => set({ structureAdjustments }),

  reset: () => {
    resetMockState()
    set({ ...initialState })
  },

  startProject: async (name) => {
    const existing = get().projectId
    if (existing) return existing

    const projectId = await createProject(name)
    set({ projectId })
    return projectId
  },

  submitAnalyze: async (input) => {
    set({ status: 'loading', error: null })

    try {
      const state = get()
      const projectId = await state.startProject()

      // Kombiniert alle Eingaben aus Schritt 1 bis 4 automatisch zu einer Nachricht
      const combinedMessage =
        input?.message ||
        [
          state.notes && `Notizen: ${state.notes}`,
          state.openPrompt && `Anforderung: ${state.openPrompt}`,
          state.primaryHardwareId && `Hardware: ${state.primaryHardwareId}`,
          state.secondaryHardwareIds.length > 0 &&
            `Erweiterungen: ${state.secondaryHardwareIds.join(', ')}`,
          state.structureAdjustments && `Anpassungen: ${state.structureAdjustments}`,
        ]
          .filter(Boolean)
          .join('\n') ||
        'Standard-Analyse gestartet'

      // Nimmt das manuell übergebene Bild ODER die hochgeladene Skizze aus Schritt 1
      const imageFile = input?.imageFile !== undefined ? input.imageFile : state.sketchFile

      const structure = await analyze({ projectId, message: combinedMessage, imageFile })
      get().setStructure(structure)
      return structure
    } catch (caught) {
      set({ status: 'error', error: toApiError(caught) })
      return null
    }
  },

  submitAnswers: async (questions, answers, extraPrompt) => {
    const formatted = formatAnswersAsMessage(questions, answers)
    const message = [formatted, extraPrompt?.trim()].filter(Boolean).join('\n\n')

    if (!message) {
      set({
        status: 'error',
        error: new ApiError('client', 'Bitte mindestens eine Frage beantworten.'),
      })
      return null
    }

    return get().submitAnalyze({ message })
  },
}))

// Vanilla-Zugriff
export const getState = useProjectStore.getState
export const setState = useProjectStore.setState
export const subscribe = useProjectStore.subscribe