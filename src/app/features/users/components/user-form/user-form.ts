import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectApi } from '../../../../core/shared/components/select-api/select-api';
import { injectCrud } from '../../../../core/composables/inject-crud';
import { UserService } from '../../services/user';
import { RoleService } from '../../../roles/services/role';
import { User } from '../../models/user.model';
import { Role } from '../../../roles/models/role.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, SelectApi],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.css', '../../../../core/shared/styles/crud.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  protected roleService = inject(RoleService);

  /** null = creando un usuario nuevo; con id = editando ese usuario. */
  userId = input<string | number | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  protected form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    name: [''],
    surname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    blocked: [false],
    role: [null as Role | null],
  });

  protected crud = injectCrud<User>(signal(this.userService), { queryKey: 'users' });
  protected saving = computed(() => this.crud.isCreating() || this.crud.isUpdating());
  protected formError = signal<string | null>(null);

  protected editUserQuery = this.crud.findById(computed(() => ({ id: this.userId() ?? '' })));
  protected loadingEdit = computed(() => !!this.userId() && this.editUserQuery.isLoading());

  constructor() {
    // La contraseña solo es obligatoria al crear un usuario nuevo.
    effect(() => {
      const passwordControl = this.form.get('password');
      if (this.userId()) {
        passwordControl?.clearValidators();
      } else {
        passwordControl?.setValidators(Validators.required);
      }
      passwordControl?.updateValueAndValidity({ emitEvent: false });
    });

    effect(() => {
      const user = this.editUserQuery.data();
      if (user && this.userId() !== null) {
        this.form.patchValue({
          username: user.username,
          name: user.name ?? '',
          surname: user.surname,
          email: user.email,
          password: '',
          blocked: user.blocked,
          role: user.role,
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    const value = this.form.value;
    const payload: Partial<User> & { password?: string } = {
      username: value.username,
      name: value.name,
      surname: value.surname,
      email: value.email,
      blocked: value.blocked,
      role: value.role ? ({ id: value.role.id } as Role) : undefined,
    };
    if (!this.userId() && value.password) payload.password = value.password;

    const id = this.userId();
    const request = id ? this.crud.update({ id, payload }) : this.crud.create({ payload: payload as User });

    request
      .then(() => this.saved.emit())
      .catch(() => this.formError.set('No se pudo guardar el usuario. Revisa los datos e intenta de nuevo.'));
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onRoleChange(value: Role | Role[] | null): void {
    const role = Array.isArray(value) ? (value[0] ?? null) : value;
    this.form.get('role')?.setValue(role);
  }
}
