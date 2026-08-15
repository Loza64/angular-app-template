import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'ghost' | 'icon' | 'icon-danger' | 'icon-success';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  /** Ancho completo, usado en formularios de auth (login/signup). */
  fullWidth = input(false);
  /** Tooltip nativo, principalmente para variantes icon-*. */
  tooltip = input('');

  clicked = output<void>();
}
