import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUsers,
  faShieldHalved,
  faLock,
  faBars,
  faXmark,
  faChevronLeft,
  faRightFromBracket,
  faPlus,
  faPenToSquare,
  faTrash,
  faMagnifyingGlass,
  faRotateRight,
  faCheck,
  faInbox,
  faSun,
  faMoon,
  faPalette,
  faRotateLeft,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

export type IconName =
  | 'users'
  | 'shield'
  | 'lock'
  | 'menu'
  | 'close'
  | 'chevron-left'
  | 'logout'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'search'
  | 'restore'
  | 'check'
  | 'x'
  | 'inbox'
  | 'sun'
  | 'moon'
  | 'palette'
  | 'undo';

const ICONS: Record<IconName, IconDefinition> = {
  users: faUsers,
  shield: faShieldHalved,
  lock: faLock,
  menu: faBars,
  close: faXmark,
  'chevron-left': faChevronLeft,
  logout: faRightFromBracket,
  plus: faPlus,
  edit: faPenToSquare,
  trash: faTrash,
  search: faMagnifyingGlass,
  restore: faRotateRight,
  check: faCheck,
  x: faXmark,
  inbox: faInbox,
  sun: faSun,
  moon: faMoon,
  palette: faPalette,
  undo: faRotateLeft,
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <fa-icon [icon]="iconDefinition()" [style.font-size.px]="size()"></fa-icon>
  `,
  styles: [
    ':host { display: inline-flex; line-height: 0; align-items: center; justify-content: center; }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  name = input.required<IconName>();
  size = input(20);
  iconDefinition = computed<IconDefinition>(() => ICONS[this.name()]);
}