import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  label = input('');
  /** Debe coincidir con el [id] del control proyectado, para el label. */
  for = input('');
  hint = input('');
  error = input('');
}
