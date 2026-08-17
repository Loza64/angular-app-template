import { IconName } from '../components/icon/icon';

export interface MenuItem {
  label: string;
  route?: string;
  icon: IconName;
  children?: MenuItem[];
}
