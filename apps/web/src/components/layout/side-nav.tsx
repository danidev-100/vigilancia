import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  HardHat,
  Car,
  LogIn,
  AlertTriangle,
  Bell,
  FileText,
  Search,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

export const navItems: NavItem[] = [
  {
    title: 'Panel',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Propiedades',
    href: '/properties',
    icon: Building2,
  },
  {
    title: 'Visitantes',
    href: '/visitors',
    icon: Users,
  },
  {
    title: 'Empleados',
    href: '/employees',
    icon: Briefcase,
  },
  {
    title: 'Contratistas',
    href: '/contractors',
    icon: HardHat,
  },
  {
    title: 'Vehículos',
    href: '/vehicles',
    icon: Car,
  },
  {
    title: 'Control de Acceso',
    href: '/entries',
    icon: LogIn,
  },
  {
    title: 'Accesos Activos',
    href: '/entries/active',
    icon: LogIn,
    roles: ['admin', 'guard'],
  },
  {
    title: 'Incidentes',
    href: '/incidents',
    icon: AlertTriangle,
  },
  {
    title: 'Notificaciones',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: FileText,
    roles: ['admin', 'manager'],
  },
  {
    title: 'Búsqueda',
    href: '/search',
    icon: Search,
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

export function getNavItems(role?: string): NavItem[] {
  return navItems.filter((item) => {
    if (!item.roles) return true;
    return role ? item.roles.includes(role) : true;
  });
}
