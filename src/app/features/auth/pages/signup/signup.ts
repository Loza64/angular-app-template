import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { AuthService, SignUpPayload } from '../../services/auth';

type SignUpFormValue = SignUpPayload & { confirmPassword: string };

const EMPTY_FORM: SignUpFormValue = {
  username: '',
  name: '',
  surname: '',
  email: '',
  password: '',
  confirmPassword: '',
};

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: [
    './signup.css',
    '../../../../core/shared/styles/crud.css',
    '../../../../core/shared/styles/auth.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected form = signal<SignUpFormValue>({ ...EMPTY_FORM });
  protected error = signal<string | null>(null);

  protected passwordMismatch = computed(() => {
    const { password, confirmPassword } = this.form();
    return confirmPassword.length > 0 && password !== confirmPassword;
  });

  private signupMutation = injectMutation(() => ({
    mutationFn: () => {
      const { confirmPassword, ...payload } = this.form();
      return firstValueFrom(this.authService.signup(payload));
    },
    onSuccess: () => this.router.navigateByUrl('/dashboard'),
    onError: (err: unknown) => {
      const message = err instanceof HttpErrorResponse ? (err.error?.message as string | undefined) : undefined;
      this.error.set(message || 'No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.');
    },
  }));

  protected loading = this.signupMutation.isPending;

  updateForm<K extends keyof SignUpFormValue>(key: K, value: SignUpFormValue[K]): void {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  submit(): void {
    this.error.set(null);

    if (this.form().password.length < 8) {
      this.error.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (this.passwordMismatch()) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.signupMutation.mutate();
  }
}
