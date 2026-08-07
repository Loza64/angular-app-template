import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../../core/shared/components/icon/icon';
import { Modal } from '../../../core/shared/components/modal/modal';
import { SelectApi } from '../../../core/shared/components/select-api/select-api';
import { Table } from '../../../core/shared/components/table/table';
import { injectFindAll } from '../../../core/composables/inject-find-all';
import { injectCrud } from '../../../core/composables/inject-crud';
import { UserService } from '../services/user';
import { RoleService } from '../../roles/services/role';
import { User } from '../models/user.model';
import { Role } from '../../roles/models/role.model';

type UserFormValue = {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  blocked: boolean;
  role: Role | null;
};

const EMPTY_FORM: UserFormValue = {
  username: '',
  name: '',
  surname: '',
  email: '',
  password: '',
  blocked: false,
  role: null,
};

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, Modal, SelectApi, Table],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css', '../../../core/shared/styles/crud.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersList {
  private userService = inject(UserService);
  protected roleService = inject(RoleService);

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

  protected crud = injectCrud<User>(signal(this.userService), { queryKey: 'users' });
  protected saving = computed(() => this.crud.isCreating() || this.crud.isUpdating());

  protected modalOpen = signal(false);
  protected editingId = signal<string | number | null>(null);
  protected form = signal<UserFormValue>({ ...EMPTY_FORM });
  protected formError = signal<string | null>(null);

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

  openEdit(user: User): void {
    this.editingId.set(user.id!);
    this.form.set({
      username: user.username,
      name: user.name ?? '',
      surname: user.surname,
      email: user.email,
      password: '',
      blocked: user.blocked,
      role: user.role ?? null,
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
    const payload: Partial<User> & { password?: string } = {
      username: value.username,
      name: value.name,
      surname: value.surname,
      email: value.email,
      blocked: value.blocked,
      role: value.role ? ({ id: value.role.id } as Role) : undefined,
    };
    if (!this.editingId() && value.password) payload.password = value.password;

    const id = this.editingId();
    const request = id
      ? this.crud.update({ id, payload })
      : this.crud.create({ payload: payload as User });

    request
      .then(() => this.closeModal())
      .catch(() => this.formError.set('No se pudo guardar el usuario. Revisa los datos e intenta de nuevo.'));
  }

  remove(user: User): void {
    if (!confirm(`¿Eliminar al usuario "${user.username}"?`)) return;
    this.crud.delete({ id: user.id! });
  }

  restore(user: User): void {
    this.crud.restore({ id: user.id! });
  }

  updateForm<K extends keyof UserFormValue>(key: K, value: UserFormValue[K]): void {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  onRoleChange(value: Role | Role[] | null): void {
    const role = Array.isArray(value) ? (value[0] ?? null) : value;
    this.updateForm('role', role);
  }

  goToPage(page: number): void {
    this.page.set(page);
  }
}