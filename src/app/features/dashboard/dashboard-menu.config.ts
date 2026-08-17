import { MenuItem } from '../../core/shared/models/menu-item.model';

export const DASHBOARD_MENU: MenuItem[] = [
  { label: 'Usuarios', route: 'users', icon: 'users' },
  {
    label: 'Control de acceso',
    icon: 'shield',
    children: [
      { label: 'Roles', route: 'roles', icon: 'shield' },
      { label: 'Permisos', route: 'permissions', icon: 'lock' },
    ],
  },
  { label: 'Apariencia', route: 'settings', icon: 'palette' },
];
