import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormField } from '../../../../core/shared/components/form-field/form-field';
import { Button } from '../../../../core/shared/components/button/button';
import { injectCrud } from '../../../../core/composables/inject-crud';
import { PermissionService } from '../../services/permission';
import { Permission } from '../../models/permission.model';

@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormField, Button],
  templateUrl: './permission-form.html',
  styleUrl: './permission-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionForm {
  private fb = inject(FormBuilder);
  private permissionService = inject(PermissionService);

  permission = input<Permission | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  protected form: FormGroup = this.fb.group({ title: ['', [Validators.required, Validators.minLength(2)]] });
  protected crud = injectCrud<Permission>(signal(this.permissionService), { queryKey: 'permissions' });
  protected saving = this.crud.isUpdating;
  protected formError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const permission = this.permission();
      if (permission) {
        this.form.patchValue({ title: permission.title });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const permission = this.permission();
    if (!permission) return;

    this.formError.set(null);
    this.crud
      .update({ id: permission.id!, payload: { title: this.form.value.title } })
      .then(() => this.saved.emit())
      .catch(() => this.formError.set('No se pudo actualizar el permiso. Intenta de nuevo.'));
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
