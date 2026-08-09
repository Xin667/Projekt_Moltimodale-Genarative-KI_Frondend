import "@wokwi/elements";
import { SchematicCanvas } from "./SchematicCanvas";
import { sampleProject } from "./sampleProject";

export function Step5Quellcode() {
  return (
    <div className="w-full min-w-0">
      <div>
      <section className="panel" id="p4">
        <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-sans text-[#1E2430]">
          Schritt 5: Quellcode
        </h2>
        <p className="text-sm text-[#5A6172] mt-1 mb-4">
          Klicke auf ein Bauteil für Details.
        </p>
      </div>
      </div>

      <div className="p-5 w-full min-w-0 boxSizing-border">
        <h1 className="text-xl font-sans mb-4">
          {sampleProject.title}
        </h1>

        <p className="text-sm text-[#666] mb-4">
          Beispiel-Rendering aus einem Projekt-JSON, wie es der LLM-Assistent
          Schritt für Schritt erzeugen würde.
        </p>

        <div className="w-full max-w-full min-w-0 boxSizing-border h-[500px] overflow-hidden border border-[#ded5c8] rounded-xl">
          <SchematicCanvas project={sampleProject} />
        </div>
      </div>
      </section>
      </div>
    </div>
  );
}