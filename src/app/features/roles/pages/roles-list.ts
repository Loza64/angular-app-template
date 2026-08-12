import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../../core/shared/components/icon/icon';
import { Modal } from '../../../core/shared/components/modal/modal';
import { Table } from '../../../core/shared/components/table/table';
import { TableCellDirective, TableColumn } from '../../../core/shared/components/table/table-column.model';
import { Toolbar } from '../../../core/shared/components/toolbar/toolbar';
import { SearchBox } from '../../../core/shared/components/search-box/search-box';
import { Button } from '../../../core/shared/components/button/button';
import { Badge } from '../../../core/shared/components/badge/badge';
import { injectFindAll } from '../../../core/composables/inject-find-all';
import { injectCrud } from '../../../core/composables/inject-crud';
import { RoleService } from '../services/role';
import { Role } from '../models/role.model';
import { RoleForm } from '../components/role-form/role-form';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [Icon, Modal, Table, TableCellDirective, RoleForm, Toolbar, SearchBox, Button, Badge],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesList {
  private roleService = inject(RoleService);

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

  // Columnas al estilo antd: título + de dónde sacar el valor (dataIndex) o cómo calcularlo (render).
  protected columns: TableColumn<Role>[] = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Permisos', key: 'permissions', render: (_, record) => `${record.permissions?.length ?? 0} permisos` },
    { title: 'Estado', key: 'status' },
    { title: '', key: 'actions', width: '90px' },
  ];

  protected crud = injectCrud<Role>(signal(this.roleService), { queryKey: 'roles' });

  protected modalOpen = signal(false);
  protected editingId = signal<string | number | null>(null);

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.modalOpen.set(true);
  }

  openEdit(role: Role): void {
    this.editingId.set(role.id!);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
  }

  onFormSaved(): void {
    this.closeModal();
  }

  remove(role: Role): void {
    if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return;
    this.crud.delete({ id: role.id! });
  }

  restore(role: Role): void {
    this.crud.restore({ id: role.id! });
  }

  goToPage(page: number): void {
    this.page.set(page);
  }
}
