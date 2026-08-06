import { BaseEntity } from '../../../sdk/entities/base-entity.model';
import { Role } from '../../roles/models/role.model';

export interface User extends BaseEntity {
  username: string;
  surname: string;
  email: string;
  blocked: boolean;
  role: Role;
}