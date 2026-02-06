import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: ${(p) => p.theme.font.family};
    color: ${(p) => p.theme.colors.text.primary};
    overflow: hidden;
    background: ${(p) => p.theme.background.app};
  }

  #root {
    width: 100%;
    height: 100%;
  }

  body::before {
    content: '';
    position: fixed;
    inset: -30vh -30vw;
    background:
      ${(p) => p.theme.background.glowA},
      ${(p) => p.theme.background.glowB},
      ${(p) => p.theme.background.glowC};
    filter: blur(0px);
    opacity: 1;
    pointer-events: none;
    z-index: -1;
  }

  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(1200px 800px at 30% 20%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 55%),
      radial-gradient(900px 650px at 80% 15%, rgba(34, 211, 238, 0.08) 0%, rgba(34, 211, 238, 0) 60%),
      radial-gradient(800px 700px at 70% 85%, rgba(139, 92, 246, 0.10) 0%, rgba(139, 92, 246, 0) 65%);
    mix-blend-mode: screen;
    pointer-events: none;
    z-index: -1;
  }

  ::selection {
    background: rgba(34, 211, 238, 0.25);
  }

  a {
    color: ${(p) => p.theme.colors.brand.cyan};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  button, input, textarea, select {
    font-family: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  :focus-visible {
    outline: none;
    box-shadow: ${(p) => p.theme.control.focusRing};
  }

  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  *::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 999px;
  }

  *::-webkit-scrollbar-thumb {
    background:
      linear-gradient(180deg, rgba(34, 211, 238, 0.35) 0%, rgba(139, 92, 246, 0.35) 100%);
    border-radius: 999px;
    border: 2px solid rgba(0, 0, 0, 0.15);
  }

  *::-webkit-scrollbar-thumb:hover {
    background:
      linear-gradient(180deg, rgba(34, 211, 238, 0.45) 0%, rgba(139, 92, 246, 0.45) 100%);
  }
`;

export default GlobalStyle;
