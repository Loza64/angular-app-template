import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { Button, ButtonVariant } from '../button/button';

export type ConfirmModalTone = 'danger' | 'warning' | 'primary' | 'success';

const ANIMATION_MS = 160;

const TONE_ICON_CLASS: Record<ConfirmModalTone, string> = {
  danger: 'icon-wrap-danger',
  warning: 'icon-wrap-warning',
  primary: 'icon-wrap-primary',
  success: 'icon-wrap-success',
};

const TONE_CONFIRM_VARIANT: Record<ConfirmModalTone, ButtonVariant> = {
  danger: 'danger',
  warning: 'primary',
  primary: 'primary',
  success: 'primary',
};

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [Icon, Button],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModal {
  open = input.required<boolean>();
  title = input.required<string>();
  tone = input<ConfirmModalTone>('danger');
  confirmText = input('Confirmar');
  cancelText = input('Cancelar');
  loading = input(false);

  confirmed = output<void>();
  cancelled = output<void>();

  protected mounted = signal(false);
  protected closing = signal(false);

  constructor() {
    effect((onCleanup) => {
      if (this.open()) {
        this.mounted.set(true);
        this.closing.set(false);
        return;
      }
      if (!this.mounted()) return;
      this.closing.set(true);
      const timeout = setTimeout(() => {
        this.mounted.set(false);
        this.closing.set(false);
      }, ANIMATION_MS);
      onCleanup(() => clearTimeout(timeout));
    });
  }

  protected iconWrapClass(): string {
    return TONE_ICON_CLASS[this.tone()];
  }

  protected confirmVariant(): ButtonVariant {
    return TONE_CONFIRM_VARIANT[this.tone()];
  }

  onCancel(): void {
    if (this.loading()) return;
    this.cancelled.emit();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }
}
