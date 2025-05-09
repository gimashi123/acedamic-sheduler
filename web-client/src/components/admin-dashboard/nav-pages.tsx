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
import { useAuth } from '@/context/auth/auth-context.tsx';

const pages = [
  {
    name: 'Time Table Management',
    url: '/admin/dashboard/timetable',
    icon: CalendarRange,
  },
  {
    name: 'Group Management',
    url: '/admin/dashboard/groups',
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
  const { currentUser } = useAuth();

  useEffect(() => {
    const pathname = location.pathname;
    setCurrentPath(pathname);
  }, [location.pathname]);

  const isStudent = currentUser?.role === 'Student';

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {pages
          .filter((item) =>
            isStudent ? item.name === 'Time Table Management' : true
          )
          .map((item) => (
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
