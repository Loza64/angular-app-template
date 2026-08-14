import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-color-field',
  standalone: true,
  templateUrl: './color-field.html',
  styleUrl: './color-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorField {
  label = input.required<string>();
  hint = input('');
  value = input.required<string>();

  valueChange = output<string>();

  onPickerInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  onTextChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
