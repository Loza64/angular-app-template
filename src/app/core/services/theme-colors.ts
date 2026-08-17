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
    return { light: { ...DEFAULT_LIGHT_COLORS }, dark: { ...DEFAULT_DARK_COLORS } };
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeColorsService {
  private themeService = inject(ThemeService);

  private readonly initial = loadStoredPalettes();

  readonly lightColors = signal<ThemeBaseColors>(this.initial.light);
  readonly darkColors = signal<ThemeBaseColors>(this.initial.dark);

  constructor() {
    effect(() => {
      const mode = this.themeService.theme();
      const base = mode === 'dark' ? this.darkColors() : this.lightColors();
      this.applyCssVars(base);
    });

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
