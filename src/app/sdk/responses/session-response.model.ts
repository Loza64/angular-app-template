import { User } from '../../features/users/models/user.model';

export interface SessionResponse {
  token: string;
  refreshToken: string;
  data: User;
}