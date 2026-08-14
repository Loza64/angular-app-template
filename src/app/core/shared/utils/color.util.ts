export interface Rgb {
  r: number;
  g: number;
  b: number;
}

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

/**
 * Mezcla dos colores al estilo `mix()` de Sass: `weight` es el porcentaje
 * (0-100) del primer color en la mezcla resultante.
 */
export function mix(colorA: string, colorB: string, weight: number): string {
  const w = Math.min(100, Math.max(0, weight)) / 100;
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  return rgbToHex({
    r: a.r * w + b.r * (1 - w),
    g: a.g * w + b.g * (1 - w),
    b: a.b * w + b.b * (1 - w),
  });
}

export function lighten(hex: string, amount: number): string {
  return mix('#ffffff', hex, amount);
}

export function darken(hex: string, amount: number): string {
  return mix('#000000', hex, amount);
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
