import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth';
import { FormField } from '../../../../core/shared/components/form-field/form-field';
import { Button } from '../../../../core/shared/components/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormField, Button],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected error = signal<string | null>(null);

  // Definición del FormGroup con validaciones nativas
  protected form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  private loginMutation = injectMutation(() => ({
    mutationFn: () => this.authService.login(this.form.value.username, this.form.value.password),
    onSuccess: () => this.router.navigateByUrl('/dashboard'),
    onError: (err: unknown) => {
      const message = err instanceof HttpErrorResponse ? (err.error?.message as string | undefined) : undefined;
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
