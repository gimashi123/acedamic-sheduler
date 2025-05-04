import { PieChart, Map, CalendarRange, Users } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const pages = [
  {
    name: 'Time Table Management',
    url: '/admin/dashboard/timetable',
    icon: CalendarRange,
  },
  {
    name: 'Group Management',
    url: '/admin/dashboard/user',
    icon: PieChart,
  },
  {
    name: 'Subject Management',
    url: '/admin/dashboard/subject',
    icon: Map,
  },
  {
    name: 'Venue Management',
    url: '/admin/dashboard/venues',
    icon: Map,
  },

  {
    name: 'User Management',
    url: '/admin/dashboard/user',
    icon: Users,
  },
];

export function NavPages() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    setCurrentPath(pathname);
  }, [location.pathname]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {pages.map((item) => (
          <SidebarMenuItem
            key={item.name}
            className={
              currentPath === item.url
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : ''
            }
          >
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
