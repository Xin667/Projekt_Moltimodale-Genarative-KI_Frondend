/**
 * Typen für den Backend-Vertrag (FastAPI, http://localhost:8000).
 *
 */

export type ActorType = 'Human' | 'Object' | 'Animal' | 'Other'
export type TriggerType = 'Sensor' | 'User-Interaction' | 'Time/Timer' | 'Other'
export type QuestionType = 'SingleChoice' | 'MultipleChoice' | 'Text'

export interface ProjectMetadata {
  working_title: string
  core_intention: string
}

export interface ActorEntity {
  id: string
  name: string
  type: ActorType
  description: string
}

export interface SensorActuator {
  id: string
  concept_term: string
  category: string
}

export interface TriggerAction {
  id: string
  trigger: string
  trigger_type: TriggerType
  actions: string[]
  /** null = Übergang bleibt im selben Zustand. */
  target_state_id: string | null
}

/** Ein Zustand des Zustandsautomaten. Nicht "State", um Verwechslung mit UI-State zu vermeiden. */
export interface MachineState {
  id: string
  name: string
  description: string
  is_initial_state: boolean
  entry_actions: string[]
  trigger_actions: TriggerAction[]
}

export interface OpenQuestion {
  id: string
  question: string
  /** id eines Elements aus states / sensors / actuators / actors_entities. */
  reference: string
  type: QuestionType
  /** null bei type === 'Text'. */
  options: string[] | null
}

/** Antwort von POST /analyze. Alle Arrays können leer sein. */
export interface AnalyzeResult {
  project_id: string
  project_metadata: ProjectMetadata
  actors_entities: ActorEntity[]
  sensors: SensorActuator[]
  actuators: SensorActuator[]
  states: MachineState[]
  global_actions: TriggerAction[]
  open_questions: OpenQuestion[]
}

export interface AnalyzeParams {
  projectId: string
  message: string
  imageFile?: File | null
}

/** Antworten des Nutzers, indiziert nach OpenQuestion.id. */
export type AnswersMap = Record<string, string | string[]>
