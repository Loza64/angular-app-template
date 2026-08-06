import { Injectable } from '@angular/core';
import { Service } from '../../../sdk/service';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService extends Service<Role> {
  constructor() {
    super({ endpoint: 'roles' });
  }
}