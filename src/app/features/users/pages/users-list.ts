import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../../../core/shared/components/icon/icon';
import { Modal } from '../../../core/shared/components/modal/modal';
import { ConfirmModal } from '../../../core/shared/components/confirm-modal/confirm-modal';
import { Table } from '../../../core/shared/components/table/table';
import { TableCellDirective, TableColumn } from '../../../core/shared/components/table/table-column.model';
import { Toolbar } from '../../../core/shared/components/toolbar/toolbar';
import { SearchBox } from '../../../core/shared/components/search-box/search-box';
import { Button } from '../../../core/shared/components/button/button';
import { Badge } from '../../../core/shared/components/badge/badge';
import { injectFindAll } from '../../../core/composables/inject-find-all';
import { injectCrud } from '../../../core/composables/inject-crud';
import { UserService } from '../services/user';
import { User } from '../models/user.model';
import { UserForm } from '../components/user-form/user-form';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [Icon, Modal, ConfirmModal, Table, TableCellDirective, UserForm, Toolbar, SearchBox, Button, Badge],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersList {
  private userService = inject(UserService);

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

  protected usersQuery = injectFindAll<User>({
    service: signal(this.userService),
    queryKey: signal(['users']),
    queryParams: this.queryParams,
  });

  protected users = computed(() => this.usersQuery.data()?.data ?? []);
  protected pagination = computed(() => {
    const p = this.usersQuery.data()?.pagination;
    return p ? { ...p, itemsLabel: 'usuarios' } : null;
  });

  protected columns: TableColumn<User>[] = [
    { title: 'Usuario', dataIndex: 'username', key: 'username' },
    { title: 'Nombre', key: 'fullname', render: (_, record) => `${record.name ?? ''} ${record.surname ?? ''}`.trim() },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Rol', key: 'role', render: (_, record) => record.role?.name ?? '—' },
    { title: 'Estado', key: 'status' },
    { title: '', key: 'actions', width: '90px' },
  ];

  protected crud = injectCrud<User>(signal(this.userService), { queryKey: 'users' });

  protected modalOpen = signal(false);
  protected editingId = signal<string | number | null>(null);
  protected userToDelete = signal<User | null>(null);

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.modalOpen.set(true);
  }

  openEdit(user: User): void {
    this.editingId.set(user.id!);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
  }

  onFormSaved(): void {
    this.closeModal();
  }

  remove(user: User): void {
    this.userToDelete.set(user);
  }

  async confirmDelete(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;
    await this.crud.delete({ id: user.id! });
    this.userToDelete.set(null);
  }

  cancelDelete(): void {
    this.userToDelete.set(null);
  }

  restore(user: User): void {
    this.crud.restore({ id: user.id! });
  }

  goToPage(page: number): void {
    this.page.set(page);
  }
}
