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
  selector: 'app-select-multiple-api',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <ng-select
      class="ant-select-skin"
      dropdownClass="ant-select-skin-panel"
      [items]="options()"
      [multiple]="true"
      [closeOnSelect]="false"
      [hideSelected]="false"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
      [compareWith]="compareById"
      [loading]="loaded() && query.isFetching()"
      [placeholder]="placeholder()"
      [notFoundText]="notFoundText()"
      [searchable]="true"
      [clearable]="true"
      (search)="onSearch($event.term)"
      (open)="onOpen()"
      (close)="onClose()"
    >
      <ng-template ng-option-tmp let-item="item">
        {{ renderOption() ? renderOption()!(item) : (item.name ?? item.id) }}
      </ng-template>
      <ng-template ng-label-tmp let-item="item">
        {{ renderOption() ? renderOption()!(item) : (item.name ?? item.id) }}
      </ng-template>
    </ng-select>
    @if (hasError()) {
      <small class="select-api-error">No se pudo cargar la lista. Intenta nuevamente.</small>
    }
  `,
  styleUrl: './select-multiple-api.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMultipleApi<T extends BaseEntity> {
  service = input.required<Service<T>>();
  queryKey = input<string | string[]>([]);
  querySearch = input<(search: string) => Record<string, unknown>>();
  queryParams = input<Record<string, unknown>>({});
  placeholder = input('Selecciona...');
  notFoundText = input('No se encontraron resultados');
  renderOption = input<(item: T) => string>();

  value = model<T[]>([]);
  loaded = signal(false);
  private search = signal('');
  private searchTerms = new Subject<string>();

  private key = computed(() => Array.isArray(this.queryKey()) ? (this.queryKey() as string[]) : [this.queryKey() as string]);

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

  compareById = (a: T | null | undefined, b: T | null | undefined): boolean => {
    if (!a || !b) return false;
    return a.id === b.id;
  };
}