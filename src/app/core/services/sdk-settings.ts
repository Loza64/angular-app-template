import { ErrorHandler, Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SdkSettingsService {
  private errorHandler = inject(ErrorHandler);
  private storage = localStorage;

  get token(): string | null { return this.storage.getItem('token'); }

  set token(value: string) {
    try { this.storage.setItem('token', value); } catch (err) { this.errorHandler.handleError(err); }
  }

  removeToken(): void {
    try { this.storage.removeItem('token'); } catch (err) { this.errorHandler.handleError(err); }
  }

  get refreshToken(): string | null { return this.storage.getItem('refreshToken'); }

  set refreshToken(value: string) {
    try { this.storage.setItem('refreshToken', value); } catch (err) { this.errorHandler.handleError(err); }
  }

  removeRefreshToken(): void {
    try { this.storage.removeItem('refreshToken'); } catch (err) { this.errorHandler.handleError(err); }
  }
}