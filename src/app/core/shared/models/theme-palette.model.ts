import { contrastText } from '../utils/color.util';

/**
 * Colores "base" que el usuario puede personalizar desde la pantalla de
 * ajustes. El resto de variables del tema (hover, "soft", bordes, texto
 * apagado, etc.) se derivan automáticamente de estas usando `color-mix()`
 * directamente en CSS (ver `styles.css`), así que aquí solo vive lo que
 * CSS no puede resolver por sí solo: el color de texto legible sobre un
 * fondo elegido por el usuario.
 */
export interface ThemeBaseColors {
  primary: string;
  bg: string;
  surface: string;
  text: string;
  sidebarBg: string;
  danger: string;
  success: string;
  warning: string;
}

export interface ThemeColorField {
  key: keyof ThemeBaseColors;
  label: string;
  hint: string;
}

/** Metadatos para pintar cada campo de color en la UI, en el orden deseado. */
export const THEME_COLOR_FIELDS: ThemeColorField[] = [
  { key: 'primary', label: 'Color primario', hint: 'Botones, enlaces y acentos' },
  { key: 'bg', label: 'Fondo general', hint: 'Fondo detrás del contenido' },
  { key: 'surface', label: 'Superficie', hint: 'Tarjetas, tablas y paneles' },
  { key: 'text', label: 'Texto', hint: 'Texto principal' },
  { key: 'sidebarBg', label: 'Barra lateral', hint: 'Fondo del menú lateral' },
  { key: 'danger', label: 'Peligro', hint: 'Errores y acciones destructivas' },
  { key: 'success', label: 'Éxito', hint: 'Confirmaciones y estados activos' },
  { key: 'warning', label: 'Advertencia', hint: 'Alertas y estados pendientes' },
];

export const DEFAULT_LIGHT_COLORS: ThemeBaseColors = {
  primary: '#4338ca',
  bg: '#f5f6f8',
  surface: '#ffffff',
  text: '#1a1d24',
  sidebarBg: '#14161f',
  danger: '#dc2626',
  success: '#16794f',
  warning: '#b45309',
};

export const DEFAULT_DARK_COLORS: ThemeBaseColors = {
  primary: '#6366f1',
  bg: '#0f1117',
  surface: '#171a23',
  text: '#e8e9ed',
  sidebarBg: '#0b0c11',
  danger: '#f87171',
  success: '#4ade80',
  warning: '#fbbf24',
};

/**
 * Variables CSS "base" que hay que fijar en el elemento (inline) para que
 * las fórmulas `color-mix()` de styles.css calculen el resto del tema.
 * Solo incluye lo que el usuario elige más los 2 colores de texto de
 * contraste automático (no se pueden resolver con `color-mix()` puro,
 * porque dependen de la luminancia del color elegido).
 */
export function buildThemeBaseVars(base: ThemeBaseColors): Record<string, string> {
  return {
    '--bg': base.bg,
    '--surface': base.surface,
    '--text': base.text,
    '--primary': base.primary,
    '--danger': base.danger,
    '--success': base.success,
    '--warning': base.warning,
    '--sidebar-bg': base.sidebarBg,

    // Contraste automático: decide texto blanco o casi-negro según el
    // color de fondo elegido, para que cualquier color siga siendo legible.
    '--sidebar-text-active': contrastText(base.sidebarBg),
    '--primary-contrast': contrastText(base.primary),
  };
}
