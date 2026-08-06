import { BaseEntity } from '../../../sdk/entities/base-entity.model';

export interface Permission extends BaseEntity {
  path: string;
  method: string;
  title: string;
}