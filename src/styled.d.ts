import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    font: {
      family: string;
    };
    colors: {
      text: {
        primary: string;
        secondary: string;
        muted: string;
        inverse: string;
      };
      brand: {
        indigo: string;
        violet: string;
        cyan: string;
        pink: string;
      };
      border: {
        soft: string;
        strong: string;
      };
    };
    background: {
      app: string;
      appLight: string;
      glowA: string;
      glowB: string;
      glowC: string;
    };
    radius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    glass: {
      blur: string;
      saturation: string;
      background: string;
      backgroundHover: string;
      backgroundStrong: string;
      border: string;
      borderStrong: string;
      highlight: string;
    };
    shadow: {
      soft: string;
      lift: string;
      glow: string;
      neuOuter: string;
      neuInner: string;
    };
    control: {
      focusRing: string;
    };
  }
}
