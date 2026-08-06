import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SdkSettingsService {
  private storage = localStorage;

  get token(): string | null { return this.storage.getItem('token'); }

  set token(value: string) {
    try { this.storage.setItem('token', value); } catch (err) { console.warn('Failed to set token', err); }
  }

  removeToken(): void {
    try { this.storage.removeItem('token'); } catch (err) { console.warn('Failed to remove token', err); }
  }

  get refreshToken(): string | null { return this.storage.getItem('refreshToken'); }

  set refreshToken(value: string) {
    try { this.storage.setItem('refreshToken', value); } catch (err) { console.warn('Failed to set refreshToken', err); }
  }

  removeRefreshToken(): void {
    try { this.storage.removeItem('refreshToken'); } catch (err) { console.warn('Failed to remove refreshToken', err); }
  }
}