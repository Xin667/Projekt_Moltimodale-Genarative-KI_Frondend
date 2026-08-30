import { useMemo, useState } from 'react';
import type { CircuitDiagram, SignalType } from './types';
import { pinColor, SIGNAL_COLORS, wireColor } from './layout';
import { SchematicCanvas, type SchematicSelection } from './SchematicCanvas';

interface CircuitDiagramViewProps {
  data: CircuitDiagram;
}

export function CircuitDiagramView({ data }: CircuitDiagramViewProps) {
  const [selection, setSelection] = useState<SchematicSelection | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  const componentById = useMemo(
    () => new Map(data.components.map((c) => [c.id, c])),
    [data.components],
  );

  // Welcher Montageschritt gehört zu welcher Verbindung? (fürs Detail-Panel)
  const stepByConnection = useMemo(() => {
    const map = new Map<string, number>();
    for (const step of data.assembly_steps) {
      for (const id of step.connection_ids) map.set(id, step.step_number);
    }
    return map;
  }, [data.assembly_steps]);

  const highlightedConnectionIds = useMemo(() => {
    if (activeStepIndex < 0) return null;
    const step = data.assembly_steps[activeStepIndex];
    return step ? new Set(step.connection_ids) : null;
  }, [activeStepIndex, data.assembly_steps]);

  // Signalfarben, die im Diagramm tatsächlich vorkommen (für die Legende).
  const signalTypesInUse = useMemo(() => {
    const inUse = new Set<SignalType>();
    for (const conn of data.connections) inUse.add(conn.signal_type);
    for (const comp of data.components) {
      for (const pin of comp.pins) inUse.add(pin.signal_type);
    }
    return (Object.keys(SIGNAL_COLORS) as SignalType[]).filter((t) => inUse.has(t));
  }, [data.components, data.connections]);

  const stepCount = data.assembly_steps.length;
  const currentStep = activeStepIndex >= 0 ? (data.assembly_steps[activeStepIndex] ?? null) : null;

  function goPrev() {
    setActiveStepIndex((i) => (i > 0 ? i - 1 : i));
  }

  function goNext() {
    setActiveStepIndex((i) => (i < stepCount - 1 ? i + 1 : i));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="font-sans text-2xl font-bold text-[#1E2430]">Schritt 5 · Schaltplan</h2>
        <p className="mt-1 text-sm text-[#5A6172]">{data.summary}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        {/* Schaltplan-Canvas */}
        <div className="min-h-[520px] overflow-hidden rounded-xl border border-[#D9D3C7]">
          <SchematicCanvas
            data={data}
            highlightedConnectionIds={highlightedConnectionIds}
            onSelect={setSelection}
          />
        </div>

        {/* Seitenleiste */}
        <div className="flex flex-col gap-4">
          {/* Montageschritte */}
          <section className="rounded-xl border border-[#D9D3C7] bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#1E2430]">Montageschritte</h3>
              {stepCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-[#5A6172]">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={activeStepIndex <= 0}
                    className="rounded border border-[#D9D3C7] px-1.5 py-0.5 hover:bg-[#FAF8F4] disabled:opacity-40"
                    aria-label="Vorheriger Schritt"
                  >
                    ←
                  </button>
                  <span className="min-w-[44px] text-center tabular-nums">
                    {currentStep ? `${currentStep.step_number}/${stepCount}` : 'alle'}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={activeStepIndex >= stepCount - 1}
                    className="rounded border border-[#D9D3C7] px-1.5 py-0.5 hover:bg-[#FAF8F4] disabled:opacity-40"
                    aria-label="Nächster Schritt"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStepIndex(-1)}
                    className="rounded border border-[#D9D3C7] px-1.5 py-0.5 hover:bg-[#FAF8F4]"
                  >
                    alle
                  </button>
                </div>
              )}
            </div>

            <ol className="mt-3 flex flex-col gap-1">
              {data.assembly_steps.map((step, i) => (
                <li key={step.step_number}>
                  <button
                    type="button"
                    onClick={() => setActiveStepIndex(i === activeStepIndex ? -1 : i)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      i === activeStepIndex
                        ? 'border-[#C46A2B] bg-orange-50/40 font-semibold text-[#1E2430]'
                        : 'border-transparent text-[#1E2430]/80 hover:bg-[#FAF8F4]'
                    }`}
                  >
                    <span className="mr-1 font-mono text-[#C46A2B]">{step.step_number}.</span>
                    {step.instruction}
                  </button>
                </li>
              ))}
            </ol>
          </section>

          {/* Detail-Panel */}
          <section className="rounded-xl border border-[#D9D3C7] bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#1E2430]">Details</h3>
            {selection ? (
              <SelectionDetails selection={selection} resolveName={resolveName(componentById)} stepByConnection={stepByConnection} />
            ) : (
              <p className="text-xs text-[#5A6172]">
                Klicke auf ein Bauteil, einen Pin oder eine Leitung im Schaltplan, um Details zu
                sehen.
              </p>
            )}
          </section>

          {/* Legende */}
          <section className="rounded-xl border border-[#D9D3C7] bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#1E2430]">Signalfarben</h3>
            <ul className="flex flex-col gap-1">
              {signalTypesInUse.map((type) => (
                <li key={type} className="flex items-center gap-2 text-xs text-[#1E2430]">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: SIGNAL_COLORS[type] }}
                  />
                  {type}
                </li>
              ))}
            </ul>
          </section>

          {/* Stromversorgung */}
          {data.power_requirements.length > 0 && (
            <section className="rounded-xl border border-[#D9D3C7] bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-[#1E2430]">Stromversorgung</h3>
              <ul className="flex flex-col gap-2">
                {data.power_requirements.map((req, i) => (
                  <li key={i} className="text-xs">
                    <div className="font-medium text-[#1E2430]">
                      {componentById.get(req.component_id)?.name ?? req.component_id}{' '}
                      <span className="font-mono text-[#C46A2B]">{req.voltage}</span>
                    </div>
                    <div className="text-[#5A6172]">{req.note}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Sicherheitshinweise */}
          {data.safety_notes.length > 0 && (
            <section className="rounded-xl border border-[#D9D3C7] bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-[#1E2430]">Sicherheitshinweise</h3>
              <ul className="flex list-disc flex-col gap-1 pl-4">
                {data.safety_notes.map((note, i) => (
                  <li key={i} className="text-xs text-[#5A6172]">
                    {note}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function resolveName(
  componentById: Map<string, CircuitDiagram['components'][number]>,
): (id: string) => string {
  return (id) => componentById.get(id)?.name ?? id;
}

interface SelectionDetailsProps {
  selection: SchematicSelection;
  resolveName: (id: string) => string;
  stepByConnection: Map<string, number>;
}

function SelectionDetails({ selection, resolveName, stepByConnection }: SelectionDetailsProps) {
  if (selection.kind === 'component') {
    const comp = selection.component;
    return (
      <div className="text-xs">
        <div className="font-semibold text-[#1E2430]">
          {comp.name} <span className="font-normal text-[#5A6172]">({comp.category})</span>
        </div>
        <p className="mt-1 text-[#5A6172]">{comp.description}</p>
        <ul className="mt-2 flex flex-col gap-1">
          {comp.pins.map((pin) => (
            <li key={pin.id} className="flex items-start gap-1.5">
              <span
                className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: pinColor(pin.signal_type) }}
              />
              <span className="text-[#1E2430]">
                <span className="font-medium">{pin.label}</span>
                <span className="text-[#5A6172]"> ({pin.signal_type}) — {pin.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (selection.kind === 'connection') {
    const conn = selection.connection;
    const stepNumber = stepByConnection.get(conn.id);
    return (
      <div className="text-xs">
        <div className="font-semibold text-[#1E2430]">
          {resolveName(conn.from_component_id)}.{conn.from_pin_id} →{' '}
          {resolveName(conn.to_component_id)}.{conn.to_pin_id}
        </div>
        <p className="mt-1 text-[#5A6172]">{conn.description}</p>
        <div className="mt-1 flex items-center gap-1.5 text-[#5A6172]">
          Signal: {conn.signal_type} · Kabel:
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: wireColor(conn) }}
          />
          {conn.wire_color}
        </div>
        {stepNumber !== undefined && (
          <div className="mt-1 text-[#5A6172]">Gehört zu Montageschritt {stepNumber}.</div>
        )}
      </div>
    );
  }

  const { component, pin } = selection;
  return (
    <div className="text-xs">
      <div className="font-semibold text-[#1E2430]">
        {component.name} / {pin.label}
      </div>
      <p className="mt-1 text-[#5A6172]">{pin.description}</p>
      <div className="mt-1 text-[#5A6172]">Signal: {pin.signal_type}</div>
    </div>
  );
}
