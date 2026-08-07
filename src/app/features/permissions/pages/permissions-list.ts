import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryClient, injectMutation } from '@tanstack/angular-query-experimental';
import { Icon } from '../../../core/shared/components/icon/icon';
import { Modal } from '../../../core/shared/components/modal/modal';
import { injectFindAll } from '../../../core/composables/inject-find-all';
import { PermissionService } from '../services/permission';
import { Permission } from '../models/permission.model';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, Modal],
  templateUrl: './permissions-list.html',
  styleUrls: ['./permissions-list.css', '../../../core/shared/styles/crud.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsList {
  private permissionService = inject(PermissionService);
  private queryClient = inject(QueryClient);

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
  protected pagination = computed(() => this.permissionsQuery.data()?.pagination);

  protected modalOpen = signal(false);
  protected editingPermission = signal<Permission | null>(null);
  protected titleValue = signal('');
  protected formError = signal<string | null>(null);

  private saveMutation = injectMutation(() => ({
    mutationFn: () => {
      const permission = this.editingPermission();
      if (!permission) return Promise.reject(new Error('No hay permiso seleccionado'));
      return this.permissionService.update({
        id: permission.id!,
        payload: { title: this.titleValue() },
      });
    },
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['permissions'] });
      this.closeModal();
    },
    onError: () => this.formError.set('No se pudo actualizar el permiso. Intenta de nuevo.'),
  }));

  protected saving = this.saveMutation.isPending;

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
    this.saveMutation.mutate();
  }

  goToPage(page: number): void {
    this.page.set(page);
  }
}
