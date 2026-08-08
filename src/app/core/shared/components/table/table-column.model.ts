import { Directive, TemplateRef, input } from '@angular/core';
import { BaseEntity } from '../../../../sdk/entities/base-entity.model';

export interface TableColumn<T extends BaseEntity> {
  title: string;
  dataIndex?: keyof T;
  key: keyof T | string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => string;
}

@Directive({ selector: '[appTableCell]', standalone: true })
export class TableCellDirective {
  appTableCell = input.required<string>();
  constructor(public template: TemplateRef<any>) { }
}
