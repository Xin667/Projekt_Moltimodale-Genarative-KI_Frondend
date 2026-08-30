import type { CircuitDiagram } from '@/features/step5-quellcode/types';

/**
 * Beispieldaten für den Schaltplan, solange der Backend-Endpoint
 * `/circuit-diagram` noch nicht angebunden ist.
 *
 * Entspricht exakt dem vom Backend gelieferten Beispiel (ESP32-Bodenfeuchte-
 * anzeige) und kann direkt an `CircuitDiagramView` übergeben werden.
 */
export const sampleCircuitDiagram: CircuitDiagram = {
  title: 'ESP32-Bodenfeuchteanzeige mit LEDs und OLED-Display',
  summary:
    'Der ESP32 liest zwei Bodenfeuchtesensoren ein und zeigt den Zustand über ein OLED-Display und zwei LEDs an. Alle Bauteile werden so verdrahtet, dass der Aufbau mit 3,3V und GND vom ESP32 funktioniert.',
  components: [
    {
      id: 'component_bodenfeuchtesensor_trocken',
      name: 'DFRobot Gravity: Capacitive Soil Moisture Sensor v1.2',
      category: 'Sensor',
      description:
        'Dieser Sensor misst, wie feucht oder trocken die Erde ist. Das Signal geht als Analogwert an den ESP32, damit er den Zustand auslesen kann.',
      pins: [
        {
          id: 'vcc',
          label: 'VCC',
          signal_type: 'power',
          description: 'Hier kommt die 3,3V-Versorgung für den Sensor an.',
        },
        {
          id: 'gnd',
          label: 'GND',
          signal_type: 'ground',
          description: 'Hier wird der Minuspol bzw. die gemeinsame Masse angeschlossen.',
        },
        {
          id: 'aout',
          label: 'AOUT',
          signal_type: 'analog',
          description: 'Hier gibt der Sensor seinen Messwert als Analogsignal an den ESP32 aus.',
        },
      ],
    },
    {
      id: 'component_bodenfeuchtesensor_feucht',
      name: 'DFRobot Gravity: Capacitive Soil Moisture Sensor v1.2',
      category: 'Sensor',
      description:
        'Dieser Sensor misst ebenfalls die Feuchtigkeit der Erde. Der ESP32 nutzt das zweite Signal, um zwei Messpunkte getrennt zu vergleichen.',
      pins: [
        {
          id: 'vcc',
          label: 'VCC',
          signal_type: 'power',
          description: 'Hier kommt die 3,3V-Versorgung für den Sensor an.',
        },
        {
          id: 'gnd',
          label: 'GND',
          signal_type: 'ground',
          description: 'Hier wird die gemeinsame Masse angeschlossen.',
        },
        {
          id: 'aout',
          label: 'AOUT',
          signal_type: 'analog',
          description: 'Hier gibt der Sensor seinen Messwert als Analogsignal an den ESP32 aus.',
        },
      ],
    },
    {
      id: 'component_rotes_blinklicht',
      name: '5mm diffuse rote LED',
      category: 'Actuator',
      description:
        'Diese LED leuchtet rot, wenn der ESP32 sie einschaltet. Sie kann zum Beispiel eine Warnung oder einen trockenen Zustand zeigen.',
      pins: [
        {
          id: 'anode',
          label: 'Anode',
          signal_type: 'digital',
          description:
            'Dieser Anschluss wird mit einem GPIO des ESP32 verbunden, damit die LED eingeschaltet werden kann.',
        },
        {
          id: 'cathode',
          label: 'Kathode',
          signal_type: 'ground',
          description:
            'Dieser Anschluss kommt an GND, damit der Strom durch die LED zurückfließen kann.',
        },
      ],
    },
    {
      id: 'component_gruen_leuchten',
      name: '5mm diffuse grüne LED',
      category: 'Actuator',
      description:
        'Diese LED leuchtet grün, wenn der ESP32 sie einschaltet. Sie kann zum Beispiel einen guten oder feuchten Zustand anzeigen.',
      pins: [
        {
          id: 'anode',
          label: 'Anode',
          signal_type: 'digital',
          description:
            'Dieser Anschluss wird mit einem GPIO des ESP32 verbunden, damit die LED eingeschaltet werden kann.',
        },
        {
          id: 'cathode',
          label: 'Kathode',
          signal_type: 'ground',
          description:
            'Dieser Anschluss kommt an GND, damit der Strom durch die LED zurückfließen kann.',
        },
      ],
    },
    {
      id: 'component_display_sprechblase',
      name: '0,96" OLED Display SSD1306, 128x64, I2C',
      category: 'Actuator',
      description:
        'Dieses kleine Display zeigt Text und Werte an. Der ESP32 sendet die Informationen über I2C an das Display.',
      pins: [
        {
          id: 'gnd',
          label: 'GND',
          signal_type: 'ground',
          description: 'Hier wird die gemeinsame Masse angeschlossen.',
        },
        {
          id: 'vcc',
          label: 'VCC',
          signal_type: 'power',
          description: 'Hier bekommt das Display die Versorgungsspannung vom ESP32.',
        },
        {
          id: 'scl',
          label: 'SCL',
          signal_type: 'i2c',
          description: 'Hier läuft die I2C-Taktleitung vom ESP32 zum Display.',
        },
        {
          id: 'sda',
          label: 'SDA',
          signal_type: 'i2c',
          description: 'Hier läuft die I2C-Datenleitung vom ESP32 zum Display.',
        },
      ],
    },
    {
      id: 'controller_main',
      name: 'ESP32-DevKitC V4',
      category: 'Microcontroller',
      description:
        'Der ESP32 ist die Steuerzentrale des Projekts. Er liest die Sensoren ein und schaltet die LEDs sowie das Display.',
      pins: [
        {
          id: 'vin',
          label: '5V',
          signal_type: 'power',
          description: 'Hier kann der ESP32 über USB oder eine passende 5V-Quelle versorgt werden.',
        },
        {
          id: 'gnd',
          label: 'GND',
          signal_type: 'ground',
          description: 'Hier wird die gemeinsame Masse für alle Bauteile angeschlossen.',
        },
        {
          id: '3v3',
          label: '3V3',
          signal_type: 'power',
          description: 'Von hier werden Sensoren und das Display mit 3,3V versorgt.',
        },
        {
          id: 'gpio34',
          label: 'GPIO34',
          signal_type: 'analog',
          description: 'Dieser Eingang liest den Messwert des ersten Bodenfeuchtesensors ein.',
        },
        {
          id: 'gpio35',
          label: 'GPIO35',
          signal_type: 'analog',
          description: 'Dieser Eingang liest den Messwert des zweiten Bodenfeuchtesensors ein.',
        },
        {
          id: 'gpio18',
          label: 'GPIO18',
          signal_type: 'digital',
          description: 'Dieser Ausgang schaltet die rote LED ein oder aus.',
        },
        {
          id: 'gpio19',
          label: 'GPIO19',
          signal_type: 'digital',
          description: 'Dieser Ausgang schaltet die grüne LED ein oder aus.',
        },
        {
          id: 'gpio22',
          label: 'GPIO22',
          signal_type: 'i2c',
          description: 'Diese Leitung ist die I2C-Taktleitung für das OLED-Display.',
        },
        {
          id: 'gpio21',
          label: 'GPIO21',
          signal_type: 'i2c',
          description: 'Diese Leitung ist die I2C-Datenleitung für das OLED-Display.',
        },
      ],
    },
  ],
  connections: [
    {
      id: 'conn_01',
      from_component_id: 'controller_main',
      from_pin_id: '3v3',
      to_component_id: 'component_bodenfeuchtesensor_trocken',
      to_pin_id: 'vcc',
      signal_type: 'power',
      wire_color: 'red',
      description: 'Versorgt den ersten Bodenfeuchtesensor mit 3,3V Betriebsspannung.',
    },
    {
      id: 'conn_02',
      from_component_id: 'controller_main',
      from_pin_id: 'gnd',
      to_component_id: 'component_bodenfeuchtesensor_trocken',
      to_pin_id: 'gnd',
      signal_type: 'ground',
      wire_color: 'black',
      description: 'Verbindet den ersten Bodenfeuchtesensor mit der gemeinsamen Masse.',
    },
    {
      id: 'conn_03',
      from_component_id: 'controller_main',
      from_pin_id: 'gpio34',
      to_component_id: 'component_bodenfeuchtesensor_trocken',
      to_pin_id: 'aout',
      signal_type: 'analog',
      wire_color: 'yellow',
      description: 'Leitet den Messwert des ersten Bodenfeuchtesensors zum ESP32 weiter.',
    },
    {
      id: 'conn_04',
      from_component_id: 'controller_main',
      from_pin_id: '3v3',
      to_component_id: 'component_bodenfeuchtesensor_feucht',
      to_pin_id: 'vcc',
      signal_type: 'power',
      wire_color: 'red',
      description: 'Versorgt den zweiten Bodenfeuchtesensor mit 3,3V Betriebsspannung.',
    },
    {
      id: 'conn_05',
      from_component_id: 'controller_main',
      from_pin_id: 'gnd',
      to_component_id: 'component_bodenfeuchtesensor_feucht',
      to_pin_id: 'gnd',
      signal_type: 'ground',
      wire_color: 'black',
      description: 'Verbindet den zweiten Bodenfeuchtesensor mit der gemeinsamen Masse.',
    },
    {
      id: 'conn_06',
      from_component_id: 'controller_main',
      from_pin_id: 'gpio35',
      to_component_id: 'component_bodenfeuchtesensor_feucht',
      to_pin_id: 'aout',
      signal_type: 'analog',
      wire_color: 'green',
      description: 'Leitet den Messwert des zweiten Bodenfeuchtesensors zum ESP32 weiter.',
    },
    {
      id: 'conn_07',
      from_component_id: 'controller_main',
      from_pin_id: 'gpio18',
      to_component_id: 'component_rotes_blinklicht',
      to_pin_id: 'anode',
      signal_type: 'digital',
      wire_color: 'orange',
      description: 'Steuert die rote LED direkt über einen digitalen Ausgang des ESP32.',
    },
    {
      id: 'conn_08',
      from_component_id: 'controller_main',
      from_pin_id: 'gnd',
      to_component_id: 'component_rotes_blinklicht',
      to_pin_id: 'cathode',
      signal_type: 'ground',
      wire_color: 'black',
      description: 'Schließt die rote LED an Masse an, damit sie leuchten kann.',
    },
    {
      id: 'conn_09',
      from_component_id: 'controller_main',
      from_pin_id: 'gpio19',
      to_component_id: 'component_gruen_leuchten',
      to_pin_id: 'anode',
      signal_type: 'digital',
      wire_color: 'blue',
      description: 'Steuert die grüne LED direkt über einen digitalen Ausgang des ESP32.',
    },
    {
      id: 'conn_10',
      from_component_id: 'controller_main',
      from_pin_id: 'gnd',
      to_component_id: 'component_gruen_leuchten',
      to_pin_id: 'cathode',
      signal_type: 'ground',
      wire_color: 'black',
      description: 'Schließt die grüne LED an Masse an, damit sie leuchten kann.',
    },
    {
      id: 'conn_11',
      from_component_id: 'controller_main',
      from_pin_id: '3v3',
      to_component_id: 'component_display_sprechblase',
      to_pin_id: 'vcc',
      signal_type: 'power',
      wire_color: 'red',
      description: 'Versorgt das OLED-Display mit 3,3V Betriebsspannung.',
    },
    {
      id: 'conn_12',
      from_component_id: 'controller_main',
      from_pin_id: 'gnd',
      to_component_id: 'component_display_sprechblase',
      to_pin_id: 'gnd',
      signal_type: 'ground',
      wire_color: 'black',
      description: 'Verbindet das OLED-Display mit der gemeinsamen Masse.',
    },
    {
      id: 'conn_13',
      from_component_id: 'controller_main',
      from_pin_id: 'gpio22',
      to_component_id: 'component_display_sprechblase',
      to_pin_id: 'scl',
      signal_type: 'i2c',
      wire_color: 'purple',
      description: 'Verbindet die I2C-Taktleitung zwischen ESP32 und Display.',
    },
    {
      id: 'conn_14',
      from_component_id: 'controller_main',
      from_pin_id: 'gpio21',
      to_component_id: 'component_display_sprechblase',
      to_pin_id: 'sda',
      signal_type: 'i2c',
      wire_color: 'white',
      description: 'Verbindet die I2C-Datenleitung zwischen ESP32 und Display.',
    },
  ],
  assembly_steps: [
    {
      step_number: 1,
      instruction: 'Verbinde den 3,3V-Pin des ESP32 mit VCC vom ersten Bodenfeuchtesensor.',
      connection_ids: ['conn_01'],
    },
    {
      step_number: 2,
      instruction: 'Verbinde GND des ESP32 mit GND vom ersten Bodenfeuchtesensor.',
      connection_ids: ['conn_02'],
    },
    {
      step_number: 3,
      instruction: 'Verbinde den Analogausgang AOUT des ersten Bodenfeuchtesensors mit GPIO34 am ESP32.',
      connection_ids: ['conn_03'],
    },
    {
      step_number: 4,
      instruction: 'Verbinde den 3,3V-Pin des ESP32 mit VCC vom zweiten Bodenfeuchtesensor.',
      connection_ids: ['conn_04'],
    },
    {
      step_number: 5,
      instruction: 'Verbinde GND des ESP32 mit GND vom zweiten Bodenfeuchtesensor.',
      connection_ids: ['conn_05'],
    },
    {
      step_number: 6,
      instruction: 'Verbinde den Analogausgang AOUT des zweiten Bodenfeuchtesensors mit GPIO35 am ESP32.',
      connection_ids: ['conn_06'],
    },
    {
      step_number: 7,
      instruction: 'Verbinde die Anode der roten LED mit GPIO18 am ESP32.',
      connection_ids: ['conn_07'],
    },
    {
      step_number: 8,
      instruction: 'Verbinde die Kathode der roten LED mit GND des ESP32.',
      connection_ids: ['conn_08'],
    },
    {
      step_number: 9,
      instruction: 'Verbinde die Anode der grünen LED mit GPIO19 am ESP32.',
      connection_ids: ['conn_09'],
    },
    {
      step_number: 10,
      instruction: 'Verbinde die Kathode der grünen LED mit GND des ESP32.',
      connection_ids: ['conn_10'],
    },
    {
      step_number: 11,
      instruction: 'Verbinde den 3,3V-Pin des ESP32 mit VCC des OLED-Displays.',
      connection_ids: ['conn_11'],
    },
    {
      step_number: 12,
      instruction: 'Verbinde GND des ESP32 mit GND des OLED-Displays.',
      connection_ids: ['conn_12'],
    },
    {
      step_number: 13,
      instruction: 'Verbinde GPIO22 des ESP32 mit SCL des OLED-Displays.',
      connection_ids: ['conn_13'],
    },
    {
      step_number: 14,
      instruction: 'Verbinde GPIO21 des ESP32 mit SDA des OLED-Displays.',
      connection_ids: ['conn_14'],
    },
  ],
  power_requirements: [
    {
      component_id: 'component_bodenfeuchtesensor_trocken',
      voltage: '3,3V',
      note: 'Kann direkt vom 3,3V-Pin des ESP32 versorgt werden.',
    },
    {
      component_id: 'component_bodenfeuchtesensor_feucht',
      voltage: '3,3V',
      note: 'Kann direkt vom 3,3V-Pin des ESP32 versorgt werden.',
    },
    {
      component_id: 'component_rotes_blinklicht',
      voltage: '3,3V GPIO-Signal',
      note: 'Die LED wird direkt über einen ESP32-GPIO geschaltet; für sicheren Betrieb wäre normalerweise ein Vorwiderstand nötig.',
    },
    {
      component_id: 'component_gruen_leuchten',
      voltage: '3,3V GPIO-Signal',
      note: 'Die LED wird direkt über einen ESP32-GPIO geschaltet; für sicheren Betrieb wäre normalerweise ein Vorwiderstand nötig.',
    },
    {
      component_id: 'component_display_sprechblase',
      voltage: '3,3V',
      note: 'Das OLED-Display läuft direkt über 3,3V und passt damit zum ESP32.',
    },
    {
      component_id: 'controller_main',
      voltage: '5V über USB',
      note: 'Der ESP32-DevKitC wird typischerweise über USB mit 5V versorgt.',
    },
  ],
  safety_notes: [
    'Der ESP32 arbeitet nur mit 3,3V an seinen Eingängen. Verbinde die Bodenfeuchtesensoren deshalb mit 3,3V und nicht mit 5V, damit der Analogwert sicher bleibt.',
    'Die roten und grünen LEDs sind hier direkt an GPIO-Pins angeschlossen. In einem robusten Aufbau sollte normalerweise ein Vorwiderstand verwendet werden, damit die LEDs und der ESP32 geschont werden.',
    'Achte beim OLED-Display auf die richtige Verdrahtung von SDA und SCL. Werden diese Leitungen vertauscht, funktioniert die Anzeige nicht.',
  ],
};
