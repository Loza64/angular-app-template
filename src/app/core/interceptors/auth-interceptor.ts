import { HttpClient, HttpContext, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, catchError, firstValueFrom, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ON_FORBIDDEN, ON_UNAUTHORIZED, IS_RETRY_AFTER_REFRESH, SKIP_AUTH } from '../http/http-context';
import { SdkSettingsService } from '../services/sdk-settings';
import { getApiErrorMessage } from '../shared/utils/api-error.util';

interface RefreshResponse { token: string; refreshToken: string; }

let refreshPromise: Promise<RefreshResponse> | null = null;

function refreshAccessToken(http: HttpClient, settings: SdkSettingsService): Promise<RefreshResponse> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = settings.refreshToken;
  if (!refreshToken) return Promise.reject(new Error('No refresh token available'));

  refreshPromise = firstValueFrom(
    http.post<RefreshResponse>(
      `${environment.apiOrigin}/api/auth/refresh`,
      { refreshToken },
      { context: new HttpContext().set(SKIP_AUTH, true) },
    ),
  ).finally(() => { refreshPromise = null; });

  return refreshPromise;
}

function handleUnauthorized(req: HttpRequest<unknown>, originalError: HttpErrorResponse, next: HttpHandlerFn, http: HttpClient, settings: SdkSettingsService, router: Router, toastr: ToastrService): Observable<HttpEvent<unknown>> {
  return from(refreshAccessToken(http, settings)).pipe(
    switchMap((res) => {
      settings.token = res.token;
      settings.refreshToken = res.refreshToken;
      const retryReq = req.clone({
        setHeaders: { Authorization: `Bearer ${res.token}` },
        context: req.context.set(IS_RETRY_AFTER_REFRESH, true),
      });
      return next(retryReq);
    }),
    catchError((refreshError: unknown) => {
      const onUnauthorized = req.context.get(ON_UNAUTHORIZED);
      settings.removeToken();
      settings.removeRefreshToken();
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        const message = getApiErrorMessage(originalError) ?? getApiErrorMessage(refreshError) ?? 'Tu sesión expiró. Inicia sesión nuevamente.';
        toastr.error(message, 'Sesión no autorizada');
        void router.navigateByUrl('/login');
      }
      return throwError(() => refreshError);
    }),
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) return next(req);

  const settings = inject(SdkSettingsService);
  const http = inject(HttpClient);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const token = settings.token;
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);

      if (error.status === 401 && !req.context.get(IS_RETRY_AFTER_REFRESH)) {
        return handleUnauthorized(authReq, error, next, http, settings, router, toastr);
      }
      if (error.status === 403) {
        const onForbidden = req.context.get(ON_FORBIDDEN);
        const message = getApiErrorMessage(error) ?? 'No tienes permiso para realizar esta petición.';
        if (onForbidden) {
          onForbidden();
        } else {
          toastr.warning(message, 'Acceso denegado');
        }
      }
      return throwError(() => error);
    }),
  );
};