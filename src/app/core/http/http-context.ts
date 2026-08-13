import { HttpContextToken } from '@angular/common/http';

export const ON_UNAUTHORIZED = new HttpContextToken<(() => void) | undefined>(() => undefined);
export const ON_FORBIDDEN = new HttpContextToken<(() => void) | undefined>(() => undefined);
export const IS_RETRY_AFTER_REFRESH = new HttpContextToken<boolean>(() => false);
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
