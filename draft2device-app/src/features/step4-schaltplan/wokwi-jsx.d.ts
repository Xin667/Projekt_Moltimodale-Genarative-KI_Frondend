import "react";

/**
 * @wokwi/elements sind native Web Components (LitElement), keine React-Komponenten.
 * Damit TypeScript/JSX sie trotzdem als Tags akzeptiert (<wokwi-led ... />),
 * deklarieren wir sie hier als generische intrinsic elements.
 *
 * Für strengere Typisierung könnte man hier pro Element die konkreten
 * Properties eintragen (siehe @wokwi/elements Typdefinitionen im Paket).
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-esp32-devkit-v1": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "wokwi-led": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "wokwi-pushbutton": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "wokwi-resistor": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "wokwi-dht22": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
