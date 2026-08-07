import { ChangeDetectionStrategy, Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Icon } from '../../../core/shared/components/icon/icon';
import { Modal } from '../../../core/shared/components/modal/modal';
import { Table } from '../../../core/shared/components/table/table';
import { injectFindAll } from '../../../core/composables/inject-find-all';
import { injectCrud } from '../../../core/composables/inject-crud';
import { RoleService } from '../services/role';
import { PermissionService } from '../../permissions/services/permission';
import { Role } from '../models/role.model';
import { Permission } from '../../permissions/models/permission.model';
import { SelectMultipleApi } from "../../../core/shared/components/select-multiple-api/select-multiple-api";

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Icon, Modal, Table, SelectMultipleApi],
  templateUrl: './roles-list.html',
  styleUrls: ['./roles-list.css', '../../../core/shared/styles/crud.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesList {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  protected permissionService = inject(PermissionService);

  protected search = signal('');
  protected page = signal(1);
  protected pageSize = 10;
  protected deleted = signal(false);

  private queryParams = computed(() => ({
    page: this.page(),
    pageSize: this.pageSize,
    ...(this.search() ? { search: this.search() } : {}),
    ...(this.deleted() ? { deleted: true } : {}),
  }));

  protected rolesQuery = injectFindAll<Role>({
    service: signal(this.roleService),
    queryKey: signal(['roles']),
    queryParams: this.queryParams,
  });

  protected roles = computed(() => this.rolesQuery.data()?.data ?? []);
  protected pagination = computed(() => {
    const p = this.rolesQuery.data()?.pagination;
    return p ? { ...p, itemsLabel: 'roles' } : null;
  });

  protected modalOpen = signal(false);
  protected editingId = signal<string | number | null>(null);
  protected formError = signal<string | null>(null);

  // Definición del FormGroup con validaciones nativas
  protected form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    active: [true],
    permissions: [[]],
  });

  protected crud = injectCrud<Role>(signal(this.roleService), { queryKey: 'roles' });
  protected saving = computed(() => this.crud.isCreating() || this.crud.isUpdating());

  protected editRoleQuery = this.crud.findById(
    computed(() => ({ id: this.editingId() ?? '' }))
  );

  constructor() {
    // Sincronización automática con effect() cuando se obtienen los datos para editar
    effect(() => {
      const role = this.editRoleQuery.data();
      if (role && this.editingId() !== null) {
        this.form.patchValue({
          name: role.name ?? '',
          active: role.active,
          permissions: role.permissions ?? [],
        });
      }
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', active: true, permissions: [] });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(role: Role): void {
    this.editingId.set(role.id!);
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
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

    const id = this.editingId();
    const request = id
      ? this.crud.update({ id, payload })
      : this.crud.create({ payload: payload as Role });

    request
      .then(() => this.closeModal())
      .catch(() => this.formError.set('No se pudo guardar el rol. Revisa los datos e intenta de nuevo.'));
  }

  remove(role: Role): void {
    if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return;
    this.crud.delete({ id: role.id! });
  }

  restore(role: Role): void {
    this.crud.restore({ id: role.id! });
  }

  onPermissionsChange(value: Permission | Permission[] | null): void {
    const permissions = Array.isArray(value) ? value : value ? [value] : [];
    this.form.get('permissions')?.setValue(permissions);
  }

  renderPermission = (item: Permission): string => `${item.title ?? `${item.method.toUpperCase()} ${item.path}`}`;

  goToPage(page: number): void {
    this.page.set(page);
  }
}