import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorResponse {
  status: number;
  message: string;
}

export function getApiErrorMessage(error: unknown): string | undefined {
  if (!(error instanceof HttpErrorResponse) || typeof error.error !== 'object' || error.error === null) {
    return undefined;
  }

  const response = error.error as Partial<ApiErrorResponse>;
  return typeof response.message === 'string' && response.message.trim()
    ? response.message
    : undefined;
}
