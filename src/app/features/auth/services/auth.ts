import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SessionResponse } from '../../../sdk/responses/session-response.model';
import { User } from '../../users/models/user.model';
import { SdkSettingsService } from '../../../core/services/sdk-settings';

export interface SignUpPayload {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private settings = inject(SdkSettingsService);
  private baseUrl = `${environment.apiOrigin}/api/auth`;

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.settings.token);

  login(username: string, password: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  signup(payload: SignUpPayload): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.baseUrl}/signup`, payload).pipe(
      tap((res) => this.setSession(res)),
    );
  }

  logout(): void {
    this.settings.removeToken();
    this.settings.removeRefreshToken();
    this.currentUser.set(null);
  }

  private setSession(res: SessionResponse): void {
    this.settings.token = res.token;
    this.settings.refreshToken = res.refreshToken;
    this.currentUser.set(res.data);
  }
}