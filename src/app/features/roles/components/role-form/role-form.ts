import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectApi } from '../../../../core/shared/components/select-api/select-api';
import { FormField } from '../../../../core/shared/components/form-field/form-field';
import { Button } from '../../../../core/shared/components/button/button';
import { injectCrud } from '../../../../core/composables/inject-crud';
import { RoleService } from '../../services/role';
import { PermissionService } from '../../../permissions/services/permission';
import { Role } from '../../models/role.model';
import { Permission } from '../../../permissions/models/permission.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule, SelectApi, FormField, Button],
  templateUrl: './role-form.html',
  styleUrl: './role-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleForm {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  protected permissionService = inject(PermissionService);

  roleId = input<string | number | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  protected form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    active: [true],
    permissions: [[] as Permission[]],
  });

  protected crud = injectCrud<Role>(signal(this.roleService), { queryKey: 'roles' });
  protected saving = computed(() => this.crud.isCreating() || this.crud.isUpdating());
  protected formError = signal<string | null>(null);

  protected editRoleQuery = this.crud.findById(computed(() => ({ id: this.roleId() ?? '' })));
  protected loadingEdit = computed(() => !!this.roleId() && this.editRoleQuery.isLoading());

  constructor() {
    effect(() => {
      const role = this.editRoleQuery.data();
      if (role && this.roleId() !== null) {
        this.form.patchValue({
          name: role.name ?? '',
          active: role.active,
          permissions: role.permissions ?? [],
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    const value = this.form.value;
    const payload: Partial<Role> = {
      name: value.name,
      active: value.active,
      permissions: (value.permissions ?? []).map((permission: Permission) => ({ id: permission.id }) as Permission),
    };

    const id = this.roleId();
    const request = id ? this.crud.update({ id, payload }) : this.crud.create({ payload: payload as Role });

    request
      .then(() => this.saved.emit())
      .catch(() => this.formError.set('No se pudo guardar el rol. Revisa los datos e intenta de nuevo.'));
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onPermissionsChange(value: Permission | Permission[] | null): void {
    const permissions = Array.isArray(value) ? value : value ? [value] : [];
    this.form.get('permissions')?.setValue(permissions);
  }

  renderPermission = (item: Permission): string => `${item.title ?? `${item.method.toUpperCase()} ${item.path}`}`;
}
