

import * as React from "react"



import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

import {NavUser} from "@/components/admin-dashboard/nav-user.tsx";
import {NavPages} from "@/components/admin-dashboard/nav-pages.tsx";


// This is sample data.
const data = {
    user: {
        name: "",
        email: "",
        avatar: "/avatars/shadcn.jpg",
    },


}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className={' text-amber-100xl, font-bold'}>
                Academic Scheduler
            </SidebarHeader>
            <SidebarContent>
                <NavPages/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
