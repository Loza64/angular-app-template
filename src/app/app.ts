import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private auth = inject(AuthService);

  protected readonly title = signal('admin-panel');

  protected readonly bootstrapping = computed(
    () => this.auth.isAuthenticated() && this.auth.profileLoading(),
  );
}
