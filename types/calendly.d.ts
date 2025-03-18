interface CalendlyWidgetOptions {
  url: string;
  parentElement: HTMLElement;
  prefill?: {
    name?: string;
    email?: string;
    [key: string]: any;
  };
  utm?: {
    [key: string]: string;
  };
}

declare namespace Calendly {
  function initInlineWidget(options: CalendlyWidgetOptions): void;
  function initPopupWidget(options: CalendlyWidgetOptions): void;
}

interface Window {
  Calendly?: typeof Calendly;
} 