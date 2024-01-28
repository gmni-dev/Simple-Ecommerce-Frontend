import { Theme } from '../types/theme';

export function generateStylesheet(
  lightTheme: Theme,
  darkTheme: Theme
): string {
  let stylesheet = ":root[data-theme='light'] {\n";

  for (const [key, value] of Object.entries(lightTheme.properties)) {
    stylesheet += `${key}: ${value};\n`;
  }
  stylesheet += '}\n';

  stylesheet += ":root[data-theme='dark'] {\n";
  for (const [key, value] of Object.entries(darkTheme.properties)) {
    stylesheet += `${key}: ${value};\n`;
  }
  stylesheet += '}\n}\n';

  return stylesheet;
}

export function applyThemeStylesheet(stylesheet: string) {
  const styleTag = document.createElement('style');
  styleTag.textContent = stylesheet;
  document.head.appendChild(styleTag);
}
