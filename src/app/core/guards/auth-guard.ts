import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SdkSettingsService } from '../services/sdk-settings';

export const authGuard: CanActivateFn = () => {
  const settings = inject(SdkSettingsService);
  const router = inject(Router);

  if (settings.token) return true;

  return router.parseUrl('/login');
};