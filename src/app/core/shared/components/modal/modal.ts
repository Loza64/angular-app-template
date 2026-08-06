import { ChangeDetectionStrategy, Component, output, input } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [Icon],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  open = input.required<boolean>();
  title = input('');
  widthPx = input(520);

  closed = output<void>();

  onBackdropClick(): void {
    this.closed.emit();
  }
}
