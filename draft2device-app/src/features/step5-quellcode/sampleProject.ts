import type { Project } from "./types";

/**
 * Beispiel: "Taster schaltet LED" – ein klassisches erstes ESP32-Projekt.
 * In echt würde dieses Objekt (bzw. sein JSON) vom LLM Schritt für Schritt
 * erzeugt/erweitert werden, z.B. erst nur das Board, dann die LED, dann
 * den Taster samt Verkabelung.
 */
export const sampleProject: Project = {
  id: "blink-with-button",
  title: "Taster schaltet LED",
  parts: [
    { id: "esp32", type: "wokwi-esp32-devkit-v1", x: 60, y: 80 },
    { id: "led1", type: "wokwi-led", x: 420, y: 60, attrs: { color: "red" } },
    { id: "resistor1", type: "wokwi-resistor", x: 420, y: 180, rotation: 90 },
    { id: "button1", type: "wokwi-pushbutton", x: 420, y: 320 },
  ],
  connections: [
    { from: "esp32:D2", to: "led1:A", color: "#e07b39" },
    { from: "led1:C", to: "resistor1:1" },
    { from: "resistor1:2", to: "esp32:GND.1" },
    { from: "esp32:D4", to: "button1:1.l" },
    { from: "button1:2.l", to: "esp32:GND.2" },
  ],
};
