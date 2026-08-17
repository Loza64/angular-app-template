import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/signup/signup').then((m) => m.SignupPage),
  },

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
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings-page').then((m) => m.SettingsPage),
      },
    ],
  },

  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
