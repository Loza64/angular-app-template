import { ChangeDetectionStrategy, Component, computed, contentChildren, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';
import { TableCellDirective, TableColumn } from './table-column.model';
import { BaseEntity } from '../../../../sdk/entities/base-entity.model';

export interface TablePagination {
  page: number;
  pageCount: number;
  total: number;
  itemsLabel?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [Icon, NgTemplateOutlet],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table<T extends BaseEntity> {
  columns = input<TableColumn<T>[]>([]);
  data = input<T[]>([]);
  rowKey = input<string | ((record: T) => string | number)>('id');

  loading = input(false);
  emptyText = input('No se encontraron resultados.');
  loadingText = input('Cargando...');
  pagination = input<TablePagination | null>(null);
  pageChange = output<number>();

  protected cellTemplates = contentChildren(TableCellDirective);
  protected empty = computed(() => this.data().length === 0);

  templateFor(key: keyof T | string) {
    return this.cellTemplates().find((t) => t.appTableCell() === key)?.template ?? null;
  }

  cellValue(column: TableColumn<T>, record: T): unknown {
    return column.dataIndex ? (record as Record<string, unknown>)[column.dataIndex as string] : undefined;
  }

  cellText(column: TableColumn<T>, record: T, index: number): string {
    const value = this.cellValue(column, record);
    if (column.render) return column.render(value, record, index);
    return value == null ? '' : String(value);
  }

  trackByRow = (index: number, record: T): string | number => {
    const key = this.rowKey();
    if (typeof key === 'function') return key(record);
    const value = (record as Record<string, unknown>)[key];
    return value as string | number ?? index;
  };
}
