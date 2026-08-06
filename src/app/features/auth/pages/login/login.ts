import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: [
    './login.css',
    '../../../../core/shared/styles/crud.css',
    '../../../../core/shared/styles/auth.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected username = signal('');
  protected password = signal('');
  protected error = signal<string | null>(null);

  private loginMutation = injectMutation(() => ({
    mutationFn: () => firstValueFrom(this.authService.login(this.username(), this.password())),
    onSuccess: () => this.router.navigateByUrl('/dashboard'),
    onError: (err: unknown) => {
      const message = err instanceof HttpErrorResponse ? (err.error?.message as string | undefined) : undefined;
      this.error.set(message || 'Usuario o contraseña incorrectos.');
    },
  }));

  protected loading = this.loginMutation.isPending;

  submit(): void {
    this.error.set(null);
    this.loginMutation.mutate();
  }
}
