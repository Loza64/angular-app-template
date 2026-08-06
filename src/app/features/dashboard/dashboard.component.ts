import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Icon } from '../../core/shared/components/icon/icon';
import { AuthService } from '../auth/services/auth';
import { DASHBOARD_MENU } from './dashboard-menu.config';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  protected readonly menu = DASHBOARD_MENU;
  protected readonly currentUser = this.auth.currentUser;

  protected sidebarOpen = signal(false);

  private navigationEnd = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  );

  protected pageTitle = computed(() => {
    this.navigationEnd();
    const active = this.menu.find((item) => this.router.url.includes(`/${item.route}`));
    return active?.label ?? 'Dashboard';
  });

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
