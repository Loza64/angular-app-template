import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../core/shared/components/icon/icon';
import { Modal } from '../../../core/shared/components/modal/modal';
import { Table } from '../../../core/shared/components/table/table';
import { injectFindAll } from '../../../core/composables/inject-find-all';
import { injectCrud } from '../../../core/composables/inject-crud';
import { PermissionService } from '../services/permission';
import { Permission } from '../models/permission.model';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, Modal, Table],
  templateUrl: './permissions-list.html',
  styleUrls: ['./permissions-list.css', '../../../core/shared/styles/crud.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsList {
  private permissionService = inject(PermissionService);

  protected search = signal('');
  protected page = signal(1);
  protected pageSize = 10;

  private queryParams = computed(() => ({
    page: this.page(),
    pageSize: this.pageSize,
    ...(this.search() ? { search: this.search() } : {}),
  }));

  protected permissionsQuery = injectFindAll<Permission>({
    service: signal(this.permissionService),
    queryKey: signal(['permissions']),
    queryParams: this.queryParams,
  });

  protected permissions = computed(() => this.permissionsQuery.data()?.data ?? []);
  protected pagination = computed(() => {
    const p = this.permissionsQuery.data()?.pagination;
    return p ? { ...p, itemsLabel: 'permisos' } : null;
  });

  // Solo se puede listar y actualizar el título: no hay creación ni eliminación de permisos,
  // ya que se generan automáticamente escaneando los endpoints del backend.
  protected crud = injectCrud<Permission>(signal(this.permissionService), { queryKey: 'permissions' });
  protected saving = this.crud.isUpdating;

  protected modalOpen = signal(false);
  protected editingPermission = signal<Permission | null>(null);
  protected titleValue = signal('');
  protected formError = signal<string | null>(null);

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  openEdit(permission: Permission): void {
    this.editingPermission.set(permission);
    this.titleValue.set(permission.title);
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  submit(): void {
    this.formError.set(null);
    const permission = this.editingPermission();
    if (!permission) return;

    this.crud
      .update({ id: permission.id!, payload: { title: this.titleValue() } })
      .then(() => this.closeModal())
      .catch(() => this.formError.set('No se pudo actualizar el permiso. Intenta de nuevo.'));
  }

  goToPage(page: number): void {
    this.page.set(page);
  }
}
