import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
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

/** Query key bajo el que se cachea el perfil de la sesión activa. */
export const SESSION_QUERY_KEY = ['session-profile'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private settings = inject(SdkSettingsService);
  private queryClient = inject(QueryClient);
  private baseUrl = `${environment.apiOrigin}/api/auth`;

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.settings.token);

  private profileQuery = injectQuery(() => ({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => this.profile(),
    enabled: !!this.settings.token,
    retry: false,
  }));

  profileLoading = this.profileQuery.isLoading;

  constructor() {
    effect(() => {
      const data = this.profileQuery.data();
      if (data) this.currentUser.set(data);
    });
  }

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

  profile(): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${this.baseUrl}/profile`));
  }

  logout(): void {
    this.settings.removeToken();
    this.settings.removeRefreshToken();
    this.currentUser.set(null);
    this.queryClient.removeQueries({ queryKey: SESSION_QUERY_KEY });
  }

  private setSession(res: SessionResponse): void {
    this.settings.token = res.token;
    this.settings.refreshToken = res.refreshToken;
    this.currentUser.set(res.data);
    this.queryClient.setQueryData(SESSION_QUERY_KEY, res.data);
  }
}
