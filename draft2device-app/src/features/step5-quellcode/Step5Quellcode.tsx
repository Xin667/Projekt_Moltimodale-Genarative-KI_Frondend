import { CircuitDiagramView } from './CircuitDiagramView';
import { sampleCircuitDiagram } from '@/mock/circuitDiagram';

/**
 * Schritt 5: Schaltplan-Visualisierung.
 *
 * TODO: Sobald der Backend-Endpoint `/circuit-diagram` steht, hier die echten
 * Daten laden (z. B. per fetch/TanStack Query) statt der Beispieldaten.
 */
export function Step5Quellcode() {
  return <CircuitDiagramView data={sampleCircuitDiagram} />;
}
