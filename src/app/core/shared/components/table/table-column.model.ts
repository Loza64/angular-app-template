import { Directive, TemplateRef, inject, input } from '@angular/core';
import { BaseEntity } from '../../../../sdk/entities/base-entity.model';

type ColumnKey<T> = keyof T | string;

export interface TableColumn<T extends BaseEntity, K extends keyof T = keyof T> {
  title: string;
  dataIndex?: K;
  key: ColumnKey<T>;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (
    value: unknown,
    record: T,
    index: number
  ) => string;
}

@Directive({ selector: '[appTableCell]', standalone: true })
export class TableCellDirective {
  appTableCell = input.required<string>();
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}