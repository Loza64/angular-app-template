/**
 * Utilidades de color sin dependencias externas.
 *
 * Las mezclas de color (hover, "soft", bordes, etc.) ahora se calculan en
 * CSS puro con `color-mix()` (ver styles.css), así que este archivo solo se
 * encarga de lo que CSS no puede decidir por sí solo: elegir un color de
 * texto legible (blanco o casi-negro) sobre un color de fondo arbitrario
 * elegido por el usuario, y validar/normalizar los códigos hex que escribe.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Convierte "#RGB" o "#RRGGBB" a componentes RGB (0-255). Tolera valores sin "#". */
export function hexToRgb(hex: string): Rgb {
  let value = hex.trim().replace('#', '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(value, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function clamp255(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => clamp255(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Luminancia relativa aproximada (0 = negro, 1 = blanco). */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Devuelve un color de texto legible (blanco o casi-negro) sobre `bgHex`. */
export function contrastText(bgHex: string): string {
  return luminance(bgHex) > 0.6 ? '#14161f' : '#ffffff';
}

/** Valida que el string sea un color hex de 3 o 6 dígitos. */
export function isValidHex(value: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

/** Normaliza a formato "#rrggbb" en minúsculas; devuelve el fallback si no es válido. */
export function normalizeHex(value: string, fallback: string): string {
  if (!isValidHex(value)) return fallback;
  return rgbToHex(hexToRgb(value));
}
