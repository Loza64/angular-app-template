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
import { PermissionService } from '../services/permission';
import { Permission } from '../models/permission.model';
import { PermissionForm } from '../components/permission-form/permission-form';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [Icon, Modal, Table, TableCellDirective, PermissionForm, Toolbar, SearchBox, Button, Badge],
  templateUrl: './permissions-list.html',
  styleUrl: './permissions-list.css',
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

  protected columns: TableColumn<Permission>[] = [
    { title: 'Título', dataIndex: 'title', key: 'title', render: (value) => value ?? 'N/A' },
    { title: 'Método', dataIndex: 'method', key: 'method' },
    { title: 'Ruta', dataIndex: 'path', key: 'path' },
    { title: '', key: 'actions', width: '60px' },
  ];

  protected modalOpen = signal(false);
  protected editingPermission = signal<Permission | null>(null);

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  openEdit(permission: Permission): void {
    this.editingPermission.set(permission);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingPermission.set(null);
  }

  onFormSaved(): void {
    this.closeModal();
  }

  goToPage(page: number): void {
    this.page.set(page);
  }
}
