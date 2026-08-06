import "@wokwi/elements";
import { SchematicCanvas } from "./SchematicCanvas";
import { sampleProject } from "./sampleProject";

export function Step5Quellcode() {
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <div>Schritt 5 · Quellcode</div>

      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>
          {sampleProject.title}
        </h1>

        <p style={{ color: "#666", marginBottom: 16 }}>
          Beispiel-Rendering aus einem Projekt-JSON, wie es der LLM-Assistent
          Schritt für Schritt erzeugen würde.
        </p>

        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            height: 500,
            minWidth: 0,
            overflow: "hidden",
            border: "1px solid #ded5c8",
            borderRadius: 12,
            boxSizing: "border-box",
          }}
        >
          <SchematicCanvas project={sampleProject} />
        </div>
      </div>
    </div>
  );
}