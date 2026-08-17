import { contrastText } from '../utils/color.util';

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

    '--sidebar-text-active': contrastText(base.sidebarBg),
    '--primary-contrast': contrastText(base.primary),
  };
}
