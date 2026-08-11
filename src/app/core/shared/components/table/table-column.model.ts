import { Directive, TemplateRef, input } from '@angular/core';
import { BaseEntity } from '../../../../sdk/entities/base-entity.model';

type ColumnKey<T> = keyof T | string;

export interface TableColumn<T extends BaseEntity, K extends keyof T = keyof T> {
  title: string;
  dataIndex?: K;
  key: ColumnKey<T>;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (
    value: K extends keyof T ? T[K] : unknown,
    record: T,
    index: number
  ) => string;
}

@Directive({ selector: '[appTableCell]', standalone: true })
export class TableCellDirective {
  appTableCell = input.required<string>();
  constructor(public template: TemplateRef<any>) { }
}