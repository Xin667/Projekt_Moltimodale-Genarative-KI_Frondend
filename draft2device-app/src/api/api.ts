import {
  MOCK_ANALYZE_INITIAL,
  MOCK_ANALYZE_REFINED,
  MOCK_PROJECT_ID,
} from '@/mock/analyzeMock'
import type {
  ActorEntity,
  AnalyzeParams,
  AnalyzeResult,
  AnswersMap,
  MachineState,
  OpenQuestion,
  QuestionType,
  SensorActuator,
  TriggerAction,
  TriggerType,
} from '@/api/types'

// ---------------------------------------------------------------------------
// Konfiguration
// ---------------------------------------------------------------------------

/**
 * Basis-URL des FastAPI-Backends.
 * Leer lassen — dann laufen alle Requests über den Vite-Proxy (kein CORS).
 */
export const API_BASE = ''

/** true = keine Netzwerk-Requests, stattdessen Beispieldaten aus src/mock/. */
export const MOCK_MODE: boolean = false

const MOCK_CREATE_DELAY_MS = 300
const MOCK_ANALYZE_DELAY_MS = 800

// ---------------------------------------------------------------------------
// Fehlermodell
// ---------------------------------------------------------------------------

export type ApiErrorKind =
  /** fetch() ist fehlgeschlagen, Backend nicht erreichbar. */
  | 'network'
  /** Backend läuft, aber der Browser hat die Antwort mangels CORS-Header verworfen. */
  | 'cors'
  /** HTTP-Status außerhalb 2xx. */
  | 'http'
  /** HTTP 200, aber der Body enthält ein error-Feld. */
  | 'backend'
  /** Antwort war kein verwertbares JSON. */
  | 'parse'
  /** Ungültige Parameter, bevor überhaupt gesendet wurde. */
  | 'client'

export class ApiError extends Error {
  kind: ApiErrorKind
  status?: number
  /** Rohtext des Backend-Fehlers, falls vorhanden. */
  detail?: string

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: { status?: number; detail?: string; cause?: unknown },
  ) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    this.status = options?.status
    this.detail = options?.detail
  }
}

/** Wandelt beliebige geworfene Werte in einen ApiError um. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError('client', 'Unerwarteter Fehler in der API-Schicht.', { cause: error })
}

// ---------------------------------------------------------------------------
// HTTP-Schicht
// ---------------------------------------------------------------------------

/**
 * Der Browser meldet sowohl eine CORS-Blockade als auch einen nicht erreichbaren
 * Server als `TypeError: Failed to fetch` — ohne jeden Zusatzhinweis.
 *
 */
async function classifyFetchFailure(cause: unknown): Promise<ApiError> {
  // Da alle Requests über den Vite-Proxy laufen, gibt es keine CORS-Blockade mehr.
  // Ein fetch-Fehler bedeutet: Backend bzw. Proxy ist nicht erreichbar.
  return new ApiError(
    'network',
    `Keine Verbindung zum Backend. Läuft der Server (uvicorn main:app --reload)?`,
    { cause },
  )
}

async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text.trim()) return null

  try {
    return JSON.parse(text) as unknown
  } catch (cause) {
    const snippet = text.slice(0, 300)
    // Bei HTTP-Fehlern ist ein nicht-JSON-Body (z. B. HTML-Fehlerseite) zu erwarten.
    if (!res.ok) {
      throw new ApiError('http', `Backend antwortete mit HTTP ${res.status}.`, {
        status: res.status,
        detail: snippet,
      })
    }
    throw new ApiError('parse', 'Antwort des Backends ist kein gültiges JSON.', {
      status: res.status,
      detail: snippet,
      cause,
    })
  }
}

/** Liest ein `error`-Feld aus dem Body — das Backend meldet Fehler mit HTTP 200. */
function extractBackendError(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined
  const value = (data as { error?: unknown }).error
  if (typeof value === 'string' && value.trim()) return value
  return undefined
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, init)
  } catch (cause) {
    throw await classifyFetchFailure(cause)
  }

  const data = await parseJsonBody(res)
  const backendError = extractBackendError(data)

  if (!res.ok) {
    throw new ApiError(
      'http',
      backendError
        ? `Backend antwortete mit HTTP ${res.status}: ${backendError}`
        : `Backend antwortete mit HTTP ${res.status}.`,
      { status: res.status, detail: backendError },
    )
  }

  if (backendError) {
    throw new ApiError('backend', `Das Backend meldet einen Fehler: ${backendError}`, {
      status: res.status,
      detail: backendError,
    })
  }

  return data
}

// ---------------------------------------------------------------------------
// Normalisierung
//
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string')
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function normalizeActor(raw: unknown): ActorEntity {
  const record = asRecord(raw)
  return {
    id: asString(record.id),
    name: asString(record.name),
    type: asString(record.type, 'Other') as ActorEntity['type'],
    description: asString(record.description),
  }
}

function normalizeSensorActuator(raw: unknown): SensorActuator {
  const record = asRecord(raw)
  return {
    id: asString(record.id),
    concept_term: asString(record.concept_term),
    category: asString(record.category),
  }
}

function normalizeTriggerAction(raw: unknown): TriggerAction {
  const record = asRecord(raw)
  return {
    id: asString(record.id),
    trigger: asString(record.trigger),
    trigger_type: asString(record.trigger_type, 'Other') as TriggerType,
    actions: asStringArray(record.actions),
    target_state_id:
      typeof record.target_state_id === 'string' ? record.target_state_id : null,
  }
}

function normalizeState(raw: unknown): MachineState {
  const record = asRecord(raw)
  return {
    id: asString(record.id),
    name: asString(record.name),
    description: asString(record.description),
    is_initial_state: record.is_initial_state === true,
    entry_actions: asStringArray(record.entry_actions),
    trigger_actions: asArray(record.trigger_actions).map(normalizeTriggerAction),
  }
}

function normalizeQuestion(raw: unknown): OpenQuestion {
  const record = asRecord(raw)
  return {
    id: asString(record.id),
    question: asString(record.question),
    reference: asString(record.reference),
    type: asString(record.type, 'Text') as QuestionType,
    options: Array.isArray(record.options) ? asStringArray(record.options) : null,
  }
}

export function normalizeAnalyzeResult(raw: unknown): AnalyzeResult {
  const record = asRecord(raw)
  const metadata = asRecord(record.project_metadata)

  return {
    project_id: asString(record.project_id),
    project_metadata: {
      working_title: asString(metadata.working_title),
      core_intention: asString(metadata.core_intention),
    },
    actors_entities: asArray(record.actors_entities).map(normalizeActor),
    sensors: asArray(record.sensors).map(normalizeSensorActuator),
    actuators: asArray(record.actuators).map(normalizeSensorActuator),
    states: asArray(record.states).map(normalizeState),
    global_actions: asArray(record.global_actions).map(normalizeTriggerAction),
    open_questions: asArray(record.open_questions).map(normalizeQuestion),
  }
}

// ---------------------------------------------------------------------------
// Endpunkte
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

let mockAnalyzeCalls = 0

/** Setzt den MOCK_MODE-Zähler zurück, damit eine Demo wiederholbar ist. */
export function resetMockState(): void {
  mockAnalyzeCalls = 0
}

/** POST /projects — startet ein Projekt und liefert dessen project_id. */
export async function createProject(name?: string): Promise<string> {
  if (MOCK_MODE) {
    await delay(MOCK_CREATE_DELAY_MS)
    return MOCK_PROJECT_ID
  }

  const body = new FormData()
  if (name) body.append('name', name)

  const data = await request('/projects', { method: 'POST', body })
  const projectId = asRecord(data).project_id

  if (typeof projectId !== 'string' || !projectId) {
    throw new ApiError('parse', 'Antwort von POST /projects enthält keine project_id.')
  }

  return projectId
}

/**
 * POST /analyze — multipart/form-data.
 *
 * Content-Type wird bewusst NICHT gesetzt, damit der Browser die boundary ergänzt.
 */
export async function analyze({
  projectId,
  message,
  imageFile,
}: AnalyzeParams): Promise<AnalyzeResult> {
  if (!projectId) {
    throw new ApiError('client', 'Kein aktives Projekt — bitte zuerst createProject() aufrufen.')
  }
  if (!message.trim() && !imageFile) {
    throw new ApiError('client', 'Bitte eine Beschreibung eingeben oder eine Skizze hochladen.')
  }

  if (MOCK_MODE) {
    await delay(MOCK_ANALYZE_DELAY_MS)
    mockAnalyzeCalls += 1
    return normalizeAnalyzeResult(
      mockAnalyzeCalls <= 1 ? MOCK_ANALYZE_INITIAL : MOCK_ANALYZE_REFINED,
    )
  }

  const form = new FormData()
  form.append('project_id', projectId)
  form.append('message', message)
  if (imageFile) form.append('image', imageFile)

  const data = await request('/analyze', { method: 'POST', body: form })
  return normalizeAnalyzeResult(data)
}

/**
 * Baut aus den Antworten des Nutzers einen lesbaren deutschen Text, der als
 * `message` in den nächsten /analyze-Aufruf geht.
 *
 *
 * Unbeantwortete Fragen werden übersprungen; ohne jede Antwort kommt '' zurück.
 */
export function formatAnswersAsMessage(
  questions: OpenQuestion[],
  answers: AnswersMap,
): string {
  const blocks: string[] = []

  for (const question of questions) {
    const raw = answers[question.id]
    const answer = Array.isArray(raw)
      ? raw.map((entry) => entry.trim()).filter(Boolean).join(', ')
      : (raw ?? '').trim()

    if (!answer) continue

    const reference = question.reference ? ` (bezieht sich auf: ${question.reference})` : ''
    blocks.push(`${blocks.length + 1}. ${question.question}${reference}\n   Antwort: ${answer}`)
  }

  if (blocks.length === 0) return ''

  return `Antworten auf die offenen Fragen:\n\n${blocks.join('\n\n')}`
}
