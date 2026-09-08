import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { AuthService } from '../../services/auth';
import { FormField } from '../../../../core/shared/components/form-field/form-field';
import { Button } from '../../../../core/shared/components/button/button';
import { getApiErrorMessage } from '../../../../core/shared/utils/api-error.util';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string | undefined;
  const confirmPassword = control.get('confirmPassword')?.value as string | undefined;
  return confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormField, Button],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupPage {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected error = signal<string | null>(null);

  protected form = this.fb.group(
    {
      username: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  private signupMutation = injectMutation(() => ({
    mutationFn: () => {
      const { confirmPassword: _confirmPassword, ...payload } = this.form.getRawValue();
      return this.authService.signup(payload);
    },
    onSuccess: () => { void this.router.navigateByUrl('/dashboard'); },
    onError: (err: unknown) => {
      const message = getApiErrorMessage(err);
      this.error.set(message || 'No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.');
    },
  }));

  protected loading = this.signupMutation.isPending;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.signupMutation.mutate();
  }
}
