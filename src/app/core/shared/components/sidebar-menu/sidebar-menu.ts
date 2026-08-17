import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { Icon } from '../icon/icon';
import { MenuItem } from '../../models/menu-item.model';

export function menuItemIsActive(item: MenuItem, currentUrl: string): boolean {
  if (item.route && currentUrl.includes(`/${item.route}`)) return true;
  return item.children?.some((child) => menuItemIsActive(child, currentUrl)) ?? false;
}

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon, SidebarMenu],
  templateUrl: './sidebar-menu.html',
  styleUrl: './sidebar-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarMenu {
  items = input.required<MenuItem[]>();
  depth = input(0);

  navigate = output<void>();

  private router = inject(Router);
  private navigationEnd = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd)));

  protected currentUrl = computed(() => {
    this.navigationEnd();
    return this.router.url;
  });

  private openOverrides = signal<Record<string, boolean>>({});

  protected indent(): number {
    return 12 + this.depth() * 16;
  }

  protected isBranch(item: MenuItem): boolean {
    return !!item.children?.length;
  }

  protected isActive(item: MenuItem): boolean {
    return menuItemIsActive(item, this.currentUrl());
  }

  protected isOpen(item: MenuItem): boolean {
    const overrides = this.openOverrides();
    if (item.label in overrides) return overrides[item.label];
    return this.isActive(item);
  }

  protected toggle(item: MenuItem): void {
    const next = !this.isOpen(item);
    this.openOverrides.update((state) => ({ ...state, [item.label]: next }));
  }

  protected onNavigate(): void {
    this.navigate.emit();
  }
}
