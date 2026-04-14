//Icons
import {
  LayoutGrid,
  Boxes,
  Calendar,
  ClipboardList,
  Search,
  Bell,
  BarChart3,
} from 'lucide-react';

export const iconSize = 16;

export const tabs = [
  {
    id: 0,
    label: 'Inicio',
    tooltip: 'Panel de Control',
    path: '/dashboard',
    icon: <LayoutGrid className='icon-size' />,
  },
  {
    id: 1,
    label: 'Activos',
    tooltip: 'Gestión de Activos',
    path: '/dashboard/assets',
    icon: <Boxes className='icon-size' />,
  },
  {
    id: 'plans',
    label: 'Planes-PM',
    tooltip: 'Ver Planes',
    path: '/dashboard/plans',
    icon: <Calendar className='icon-size' />,
  },
  {
    id: 'workorders',
    label: 'Ordenes de Trabajo',
    tooltip: 'Ver Ordenes de Trabajo',
    path: '/dashboard/workorders',
    icon: <ClipboardList className='icon-size' />,
  },
  {
    id: 'inspecciones',
    label: 'Inspecciones',
    tooltip: 'Ver Inspecciones',
    path: '/dashboard/inspecciones',
    icon: <Search className='icon-size' />,
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    tooltip: 'Revisar Notificaciones',
    path: '/dashboard/notifications',
    icon: <Bell className='icon-size' />,
  },
  {
    id: 'reports',
    label: 'Reportes y KPIs',
    tooltip: 'Ver KPIs e información útil',
    path: '/dashboard/reports',
    icon: <BarChart3 className='icon-size' />,
  },
];
