import { BaseEntity } from '../../../sdk/entities/base-entity.model';
import { Permission } from '../../permissions/models/permission.model';

export interface Role extends BaseEntity {
  active: boolean;
  permissions: Permission[];
}