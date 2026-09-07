import { BaseEntity } from '../../../sdk/entities/base-entity.model';

export interface Permission extends BaseEntity {
  title: string;
  name: string;
}