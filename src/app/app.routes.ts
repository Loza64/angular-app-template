import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      {
        path: 'users',
        loadComponent: () => import('./features/users/pages/users-list').then((m) => m.UsersList),
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/pages/roles-list').then((m) => m.RolesList),
      },
      {
        path: 'permissions',
        loadComponent: () =>
          import('./features/permissions/pages/permissions-list').then((m) => m.PermissionsList),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];