import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule, Icon, Modal, Table],
  templateUrl: './permissions-list.html',
  styleUrls: ['./permissions-list.css', '../../../core/shared/styles/crud.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsList {
  private fb = inject(FormBuilder);
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

  protected crud = injectCrud<Permission>(signal(this.permissionService), { queryKey: 'permissions' });
  protected saving = this.crud.isUpdating;

  protected modalOpen = signal(false);
  protected editingPermission = signal<Permission | null>(null);
  protected formError = signal<string | null>(null);

  protected form: FormGroup = this.fb.group({ title: ['', [Validators.required, Validators.minLength(2)]] });

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  openEdit(permission: Permission): void {
    this.editingPermission.set(permission);
    this.form.reset({ title: permission.title });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    const permission = this.editingPermission();
    if (!permission) return;

    this.crud
      .update({ id: permission.id!, payload: { title: this.form.value.title } })
      .then(() => this.closeModal())
      .catch(() => this.formError.set('No se pudo actualizar el permiso. Intenta de nuevo.'));
  }

  goToPage(page: number): void {
    this.page.set(page);
  }
}
