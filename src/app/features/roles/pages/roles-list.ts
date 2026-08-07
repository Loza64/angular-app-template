import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Icon } from '../../../core/shared/components/icon/icon';
import { Modal } from '../../../core/shared/components/modal/modal';
import { Table } from '../../../core/shared/components/table/table';
import { injectFindAll } from '../../../core/composables/inject-find-all';
import { injectCrud } from '../../../core/composables/inject-crud';
import { RoleService } from '../services/role';
import { PermissionService } from '../../permissions/services/permission';
import { Role } from '../models/role.model';
import { Permission } from '../../permissions/models/permission.model';

type RoleFormValue = {
  name: string;
  active: boolean;
  permissions: Permission[];
};

const EMPTY_FORM: RoleFormValue = {
  name: '',
  active: true,
  permissions: [],
};

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, Icon, Modal, Table],
  templateUrl: './roles-list.html',
  styleUrls: ['./roles-list.css', '../../../core/shared/styles/crud.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesList {
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);

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
  protected form = signal<RoleFormValue>({ ...EMPTY_FORM });
  protected formError = signal<string | null>(null);

  // Opciones de permisos para el multi-select del formulario (se cargan una sola vez al abrir el modal).
  protected permissionsOptionsQuery = injectFindAll<Permission>({
    service: signal(this.permissionService),
    queryKey: signal(['permissions-options']),
    queryParams: signal({ pageSize: 200 }),
    enabled: computed(() => this.modalOpen()),
  });
  protected permissionOptions = computed(() => this.permissionsOptionsQuery.data()?.data ?? []);

  protected crud = injectCrud<Role>(signal(this.roleService), { queryKey: 'roles' });
  protected saving = computed(() => this.crud.isCreating() || this.crud.isUpdating());

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.set({ ...EMPTY_FORM });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(role: Role): void {
    this.editingId.set(role.id!);
    this.form.set({
      name: role.name ?? '',
      active: role.active,
      permissions: role.permissions ?? [],
    });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  submit(): void {
    this.formError.set(null);
    const value = this.form();
    const payload: Partial<Role> = {
      name: value.name,
      active: value.active,
      permissions: value.permissions,
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

  updateForm<K extends keyof RoleFormValue>(key: K, value: RoleFormValue[K]): void {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  comparePermissions = (a: Permission, b: Permission): boolean => a?.id === b?.id;

  goToPage(page: number): void {
    this.page.set(page);
  }
}
