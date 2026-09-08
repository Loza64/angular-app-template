import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../services/auth';
import { FormField } from '../../../../core/shared/components/form-field/form-field';
import { Button } from '../../../../core/shared/components/button/button';
import { getApiErrorMessage } from '../../../../core/shared/utils/api-error.util';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormField, Button],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected error = signal<string | null>(null);

  protected form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  private loginMutation = injectMutation(() => ({
    mutationFn: () => this.authService.login(this.form.controls.username.value, this.form.controls.password.value),
    onSuccess: () => { void this.router.navigateByUrl('/dashboard'); },
    onError: (err: unknown) => {
      const message = getApiErrorMessage(err);
      this.error.set(message || 'Usuario o contraseña incorrectos.');
    },
  }));

  protected loading = this.loginMutation.isPending;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.loginMutation.mutate();
  }
}
