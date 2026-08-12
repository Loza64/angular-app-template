import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './features/auth/services/auth';
import { ThemeService } from './core/services/theme';
import { Button } from './core/shared/components/button/button';
import { Icon } from './core/shared/components/icon/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Button, Icon],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private auth = inject(AuthService);
  protected theme = inject(ThemeService);

  protected readonly title = signal('admin-panel');

  protected readonly bootstrapping = computed(
    () => this.auth.isAuthenticated() && this.auth.profileLoading(),
  );
}
