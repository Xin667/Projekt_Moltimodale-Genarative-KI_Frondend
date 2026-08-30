/**
 * Typen für den Schaltplan (Circuit Diagram).
 *
 * Spiegeln 1:1 das Pydantic-Schema des Backend-Endpoints `/circuit-diagram`
 * (CircuitDiagram / CircuitDiagramResponse) wider. Die Feldnamen bleiben
 * bewusst snake_case, damit die JSON-Antwort ohne Umbau direkt zugeordnet
 * werden kann.
 */

/** Bestimmt u.a. die Farbe des Pin-Punkts und dient als Fallback-Farbe für Kabel. */
export type SignalType =
  | 'power'
  | 'ground'
  | 'digital'
  | 'analog'
  | 'pwm'
  | 'i2c'
  | 'spi'
  | 'uart'
  | 'other';

export type ComponentCategory =
  | 'Microcontroller'
  | 'Sensor'
  | 'Actuator'
  | 'Power Supply'
  | 'Passive Component'
  | 'Other';

/** Feste Kabelfarbe (echter CSS-Farbname), direkt als `stroke` nutzbar. */
export type WireColor =
  | 'red'
  | 'black'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'orange'
  | 'purple'
  | 'brown'
  | 'gray'
  | 'white';

export interface ComponentPin {
  /** Referenz aus `connections` heraus, z. B. "gpio34". */
  id: string;
  /** Kurzes, aufgedrucktes Label, z. B. "3V3", "GND", "AOUT". */
  label: string;
  signal_type: SignalType;
  description: string;
}

export interface CircuitComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  pins: ComponentPin[];
}

export interface Connection {
  id: string;
  from_component_id: string;
  from_pin_id: string;
  to_component_id: string;
  to_pin_id: string;
  signal_type: SignalType;
  wire_color: WireColor;
  description: string;
}

export interface AssemblyStep {
  step_number: number;
  instruction: string;
  /** Verbindungen, die in diesem Schritt hergestellt werden. */
  connection_ids: string[];
}

export interface PowerRequirement {
  component_id: string;
  voltage: string;
  note: string;
}

export interface CircuitDiagram {
  title: string;
  summary: string;
  components: CircuitComponent[];
  connections: Connection[];
  assembly_steps: AssemblyStep[];
  power_requirements: PowerRequirement[];
  safety_notes: string[];
}

/** HTTP-Antwort des Endpoints: Schaltplan plus Meta-Felder. */
export interface CircuitDiagramResponse extends CircuitDiagram {
  project_id: string;
  /** true = es wurde mit Platzhalter-Bauteilen gearbeitet (Endpunkt noch nicht angebunden). */
  used_dummy_hardware_input: boolean;
  hardware_components_input: unknown;
}
