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
    path: '/',
    icon: <LayoutGrid className='icon-size' />,
  },
  {
    id: 1,
    label: 'Activos',
    tooltip: 'Gestión de Activos',
    path: '/assets',
    icon: <Boxes className='icon-size' />,
  },
  {
    id: 'plans',
    label: 'Planes-PM',
    tooltip: 'Ver Planes',
    path: '/plans',
    icon: <Calendar className='icon-size' />,
  },
  {
    id: 'workorders',
    label: 'Ordenes de Trabajo',
    tooltip: 'Ver Ordenes de Trabajo',
    path: '/workorders',
    icon: <ClipboardList className='icon-size' />,
  },
  {
    id: 'inspecciones',
    label: 'Inspecciones',
    tooltip: 'Ver Inspecciones',
    path: '/inspecciones',
    icon: <Search className='icon-size' />,
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    tooltip: 'Revisar Notificaciones',
    path: '/notifications',
    icon: <Bell className='icon-size' />,
  },
  {
    id: 'reports',
    label: 'Reportes y KPIs',
    tooltip: 'Ver KPIs e información útil',
    path: '/reports',
    icon: <BarChart3 className='icon-size' />,
  },
];
