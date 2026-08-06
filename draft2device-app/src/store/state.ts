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
  projectId: string | null
  structure: AnalyzeResult | null
  status: ProjectStatus
  error: ApiError | null
  /** Zählt jede Aktualisierung der Struktur — entspricht dem "v3" in der IR-Leiste. */
  version: number

  setProjectId: (id: string | null) => void
  setStructure: (structure: AnalyzeResult) => void
  setStatus: (status: ProjectStatus) => void
  setError: (error: ApiError | null) => void
  reset: () => void

  /** Legt bei Bedarf ein Projekt an und liefert dessen id. Wirft bei Fehlern. */
  startProject: () => Promise<string>
  /** Kompletter Analyse-Durchlauf. Wirft nicht — Fehler landen in `error`. */
  submitAnalyze: (input: {
    message: string
    imageFile?: File | null
  }) => Promise<AnalyzeResult | null>
  /** Antworten auf offene Fragen als Text zurück an /analyze. Wirft nicht. */
  submitAnswers: (
    questions: OpenQuestion[],
    answers: AnswersMap,
    extraPrompt?: string,
  ) => Promise<AnalyzeResult | null>
}

const initialState = {
  projectId: null,
  structure: null,
  status: 'idle',
  error: null,
  version: 0,
} satisfies Pick<ProjectState, 'projectId' | 'structure' | 'status' | 'error' | 'version'>

export const useProjectStore = create<ProjectState>()((set, get) => ({
  ...initialState,

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

  reset: () => {
    resetMockState()
    set({ ...initialState })
  },

  startProject: async () => {
    const existing = get().projectId
    if (existing) return existing

    const projectId = await createProject()
    set({ projectId })
    return projectId
  },

  submitAnalyze: async ({ message, imageFile }) => {
    set({ status: 'loading', error: null })

    try {
      const projectId = await get().startProject()
      const structure = await analyze({ projectId, message, imageFile })
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

// ---------------------------------------------------------------------------
// Vanilla-Zugriff für Code außerhalb von React.
// ---------------------------------------------------------------------------

export const getState = useProjectStore.getState

/**
 * Zustand-Semantik: nimmt ein *Teil*-Objekt des States.
 * Für die Struktur bitte `getState().setStructure(...)` verwenden — das pflegt
 * zusätzlich version, status und projectId.
 */
export const setState = useProjectStore.setState

/** Liefert die Unsubscribe-Funktion zurück. */
export const subscribe = useProjectStore.subscribe
