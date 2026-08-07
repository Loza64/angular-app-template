import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseEntity } from '../../../../sdk/entities/base-entity.model';
import { injectFindAll } from '../../../composables/inject-find-all';
import { Service } from '../../../../sdk/service';

@Component({
  selector: 'app-select-api',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './select-api.html',
  styleUrl: './select-api.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectApi<T extends BaseEntity> {
  service = input.required<Service<T>>();
  queryKey = input.required<string | string[]>();
  querySearch = input<(search: string) => Record<string, unknown>>();
  queryParams = input<Record<string, unknown>>({});
  placeholder = input('Selecciona...');
  notFoundText = input('No se encontraron resultados');
  renderOption = input<(item: T) => string>();

  value = model<T | null>(null);
  loaded = signal(false);
  private search = signal('');
  private searchTerms = new Subject<string>();

  // finalQueryKey ya distingue por término de búsqueda (se serializa dentro de queryParams).
  private key = computed(() =>
    Array.isArray(this.queryKey()) ? (this.queryKey() as string[]) : [this.queryKey() as string],
  );

  private params = computed<Record<string, unknown>>(() => ({
    ...(this.querySearch()?.(this.search()) ?? {}),
    ...this.queryParams(),
  }));

  protected query = injectFindAll<T>({
    service: this.service,
    queryKey: this.key,
    queryParams: this.params,
    enabled: this.loaded,
  });

  options = computed(() => this.query.data()?.data ?? []);
  hasError = computed(() => this.query.isError());

  constructor() {
    this.searchTerms
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.search.set(term));
  }

  onSearch(term: string): void {
    this.searchTerms.next(term);
  }

  onOpen(): void {
    this.loaded.set(true);
  }

  onClose(): void {
    this.search.set('');
  }

  compareById = (a: T, b: T): boolean => a?.id === b?.id;
}
