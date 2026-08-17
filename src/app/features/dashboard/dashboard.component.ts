import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Icon } from '../../core/shared/components/icon/icon';
import { SidebarMenu } from '../../core/shared/components/sidebar-menu/sidebar-menu';
import { MenuItem } from '../../core/shared/models/menu-item.model';
import { AuthService } from '../auth/services/auth';
import { DASHBOARD_MENU } from './dashboard-menu.config';

function findActiveLabel(items: MenuItem[], currentUrl: string): string | undefined {
  for (const item of items) {
    if (item.route && currentUrl.includes(`/${item.route}`)) return item.label;
    if (item.children) {
      const childLabel = findActiveLabel(item.children, currentUrl);
      if (childLabel) return childLabel;
    }
  }
  return undefined;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, Icon, SidebarMenu],
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
    return findActiveLabel(this.menu, this.router.url) ?? 'Dashboard';
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
