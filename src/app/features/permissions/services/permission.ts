import { Injectable } from '@angular/core';
import { Service } from '../../../sdk/service';
import { Permission } from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class PermissionService extends Service<Permission> {
  constructor() {
    super({ endpoint: 'permissions' });
  }
}