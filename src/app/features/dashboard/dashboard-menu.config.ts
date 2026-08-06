import { IconName } from '../../core/shared/components/icon/icon';

export interface MenuItem {
  label: string;
  route: string;
  icon: IconName;
}

export const DASHBOARD_MENU: MenuItem[] = [
  { label: 'Usuarios', route: 'users', icon: 'users' },
  { label: 'Roles', route: 'roles', icon: 'shield' },
  { label: 'Permisos', route: 'permissions', icon: 'lock' },
];
