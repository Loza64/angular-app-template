import { Injectable } from '@angular/core';
import { Service } from '../../../sdk/service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService extends Service<User> {
  constructor() {
    super({ endpoint: 'users' });
  }
}