import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

export interface TablePagination {
  page: number;
  pageCount: number;
  total: number;
  itemsLabel?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [Icon],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table {
  loading = input(false);
  empty = input(false);
  emptyText = input('No se encontraron resultados.');
  loadingText = input('Cargando...');
  pagination = input<TablePagination | null>(null);
  pageChange = output<number>();
}
