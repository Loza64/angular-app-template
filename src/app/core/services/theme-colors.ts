import { Injectable, effect, inject, signal } from '@angular/core';
import { ThemeService, Theme } from './theme';
import {
  DEFAULT_DARK_COLORS,
  DEFAULT_LIGHT_COLORS,
  ThemeBaseColors,
  buildThemeBaseVars,
} from '../shared/models/theme-palette.model';
import { normalizeHex } from '../shared/utils/color.util';

const STORAGE_KEY = 'theme-colors';

interface StoredPalettes {
  light: ThemeBaseColors;
  dark: ThemeBaseColors;
}

function loadStoredPalettes(): StoredPalettes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { light: { ...DEFAULT_LIGHT_COLORS }, dark: { ...DEFAULT_DARK_COLORS } };
    }
    const parsed = JSON.parse(raw) as Partial<StoredPalettes>;
    return {
      light: { ...DEFAULT_LIGHT_COLORS, ...parsed.light },
      dark: { ...DEFAULT_DARK_COLORS, ...parsed.dark },
    };
  } catch {
    // localStorage corrupto o inaccesible: se cae a los valores por defecto
    // sin romper el arranque de la app.
    return { light: { ...DEFAULT_LIGHT_COLORS }, dark: { ...DEFAULT_DARK_COLORS } };
  }
}

/**
 * Administra los colores personalizados del tema (uno por modo claro/oscuro),
 * los persiste en localStorage y los aplica como variables CSS en <html>
 * cada vez que cambian o cuando cambia el modo activo.
 */
@Injectable({ providedIn: 'root' })
export class ThemeColorsService {
  private themeService = inject(ThemeService);

  private readonly initial = loadStoredPalettes();

  readonly lightColors = signal<ThemeBaseColors>(this.initial.light);
  readonly darkColors = signal<ThemeBaseColors>(this.initial.dark);

  constructor() {
    // Aplica las variables CSS base del modo activo cada vez que cambian
    // los colores o el usuario alterna entre claro/oscuro. El resto del
    // tema (hover, "soft", bordes, etc.) lo resuelve CSS con color-mix()
    // a partir de estas variables, ver styles.css.
    effect(() => {
      const mode = this.themeService.theme();
      const base = mode === 'dark' ? this.darkColors() : this.lightColors();
      this.applyCssVars(base);
    });

    // Persiste ambas paletas en localStorage ante cualquier cambio.
    effect(() => {
      const payload: StoredPalettes = { light: this.lightColors(), dark: this.darkColors() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    });
  }

  private applyCssVars(base: ThemeBaseColors): void {
    const vars = buildThemeBaseVars(base);
    const root = document.documentElement.style;
    for (const [name, value] of Object.entries(vars)) {
      root.setProperty(name, value);
    }
  }

  /** Señal de solo lectura con la paleta del modo indicado. */
  palette(mode: Theme) {
    return mode === 'dark' ? this.darkColors : this.lightColors;
  }

  setColor(mode: Theme, key: keyof ThemeBaseColors, value: string): void {
    const fallback = mode === 'dark' ? DEFAULT_DARK_COLORS[key] : DEFAULT_LIGHT_COLORS[key];
    const hex = normalizeHex(value, fallback);
    const target = mode === 'dark' ? this.darkColors : this.lightColors;
    target.update((current) => ({ ...current, [key]: hex }));
  }

  resetMode(mode: Theme): void {
    if (mode === 'dark') {
      this.darkColors.set({ ...DEFAULT_DARK_COLORS });
    } else {
      this.lightColors.set({ ...DEFAULT_LIGHT_COLORS });
    }
  }

  resetAll(): void {
    this.lightColors.set({ ...DEFAULT_LIGHT_COLORS });
    this.darkColors.set({ ...DEFAULT_DARK_COLORS });
  }
}
