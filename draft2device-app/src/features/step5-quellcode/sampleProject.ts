import type { Project } from "./types";

export const sampleProject: Project = {
  id: "esp32-soil-moisture",
  title: "ESP32-Bodenfeuchteanzeige mit LEDs und OLED-Display",
  parts: [
    { id: "esp32", type: "board-esp32-devkit-c-v4", x: 60, y: 100 },
    { id: "sensor_trocken", type: "wokwi-soil-moisture-sensor", x: 420, y: 40 },
    { id: "sensor_feucht", type: "wokwi-soil-moisture-sensor", x: 420, y: 160 },
    { id: "led_rot", type: "wokwi-led", x: 420, y: 280, attrs: { color: "red" } },
    { id: "led_gruen", type: "wokwi-led", x: 420, y: 360, attrs: { color: "green" } },
    { id: "display", type: "board-ssd1306", x: 420, y: 440 }
  ],
  connections: [
    { from: "esp32:3V3", to: "sensor_trocken:VCC", color: "red" },
    { from: "esp32:GND.1", to: "sensor_trocken:GND", color: "black" },
    { from: "esp32:34", to: "sensor_trocken:AOUT", color: "yellow" },
    { from: "esp32:3V3", to: "sensor_feucht:VCC", color: "red" },
    { from: "esp32:GND.1", to: "sensor_feucht:GND", color: "black" },
    { from: "esp32:35", to: "sensor_feucht:AOUT", color: "green" },
    { from: "esp32:18", to: "led_rot:A", color: "orange" },
    { from: "esp32:GND.1", to: "led_rot:C", color: "black" },
    { from: "esp32:19", to: "led_gruen:A", color: "blue" },
    { from: "esp32:GND.1", to: "led_gruen:C", color: "black" },
    { from: "esp32:3V3", to: "display:VCC", color: "red" },
    { from: "esp32:GND.1", to: "display:GND", color: "black" },
    { from: "esp32:22", to: "display:SCL", color: "purple" },
    { from: "esp32:21", to: "display:SDA", color: "white" }
  ]
};