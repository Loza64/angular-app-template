import { Theme } from '../../services/theme';
import { contrastText, lighten, darken, mix } from '../utils/color.util';

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

/**
 * Calcula el mapa completo de variables CSS del tema a partir de los
 * colores base elegidos por el usuario y el modo (claro/oscuro) activo.
 */
export function buildThemeCssVars(base: ThemeBaseColors, mode: Theme): Record<string, string> {
  const surfaceMuted = mix(base.surface, base.bg, 50);
  const border = mix(base.text, base.surface, mode === 'dark' ? 14 : 10);
  const textMuted = mix(base.text, base.surface, 55);

  const primaryHover = mode === 'dark' ? lighten(base.primary, 12) : darken(base.primary, 10);
  const softWeight = mode === 'dark' ? 24 : 10;

  const sidebarTextActive = contrastText(base.sidebarBg);
  const sidebarText = mix(sidebarTextActive, base.sidebarBg, 65);

  const ngSelectedBg = mode === 'dark' ? base.primary : base.sidebarBg;
  const ngSelectedText = contrastText(ngSelectedBg);
  const selectSelectedHoverBg = lighten(ngSelectedBg, 15);

  return {
    '--bg': base.bg,
    '--surface': base.surface,
    '--surface-muted': surfaceMuted,
    '--border': border,
    '--text': base.text,
    '--text-muted': textMuted,

    '--primary': base.primary,
    '--primary-hover': primaryHover,
    '--primary-soft': mix(base.primary, base.surface, softWeight),
    '--primary-color': base.primary,

    '--danger': base.danger,
    '--danger-soft': mix(base.danger, base.surface, softWeight),
    '--success': base.success,
    '--success-soft': mix(base.success, base.surface, softWeight),
    '--warning': base.warning,
    '--warning-soft': mix(base.warning, base.surface, softWeight),

    '--sidebar-bg': base.sidebarBg,
    '--sidebar-text': sidebarText,
    '--sidebar-text-active': sidebarTextActive,

    '--ng-selected-color-bg': ngSelectedBg,
    '--ng-selected-color-text': ngSelectedText,
    '--select-selected-hover-bg': selectSelectedHoverBg,

    '--select-bg': base.surface,
    '--select-border': border,
    '--select-option-text': base.text,
    '--select-option-hover-bg': surfaceMuted,
    '--select-option-hover-text': base.text,
  };
}
