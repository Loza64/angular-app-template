import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ThemeService, Theme } from '../../../core/services/theme';
import { ThemeColorsService } from '../../../core/services/theme-colors';
import {
  THEME_COLOR_FIELDS,
  ThemeBaseColors,
  buildThemeBaseVars,
} from '../../../core/shared/models/theme-palette.model';
import { Button } from '../../../core/shared/components/button/button';
import { Icon } from '../../../core/shared/components/icon/icon';
import { Badge } from '../../../core/shared/components/badge/badge';
import { ColorField } from '../../../core/shared/components/color-field/color-field';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [Button, Icon, Badge, ColorField],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private themeService = inject(ThemeService);
  private themeColorsService = inject(ThemeColorsService);

  protected readonly fields = THEME_COLOR_FIELDS;
  protected readonly activeTheme = this.themeService.theme;

  protected activeTab = signal<Theme>(this.themeService.theme());

  protected currentPalette = computed<ThemeBaseColors>(() =>
    this.activeTab() === 'dark' ? this.themeColorsService.darkColors() : this.themeColorsService.lightColors(),
  );

  protected previewStyles = computed(() => buildThemeBaseVars(this.currentPalette()));

  selectTab(tab: Theme): void {
    this.activeTab.set(tab);
  }

  onColorChange(key: keyof ThemeBaseColors, value: string): void {
    this.themeColorsService.setColor(this.activeTab(), key, value);
  }

  resetTab(): void {
    this.themeColorsService.resetMode(this.activeTab());
  }

  resetAll(): void {
    this.themeColorsService.resetAll();
  }

  applyAsActiveTheme(): void {
    this.themeService.set(this.activeTab());
  }
}
