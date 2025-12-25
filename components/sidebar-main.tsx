"use client"
import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconHelp,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SwordIcon } from "@phosphor-icons/react/dist/ssr"
import { SidebarUser } from "@/types/common"
const data = {
  navMain: [
    {
      title: "Arena",
      url: "/arena",
      icon: IconDashboard,
    },
    {
      title: "Prompts",
      url: "/prompts",
      icon: IconFileAi,
    },
    {
      title: "Leaderboard",
      url: "/leaderboard",
      icon: IconChartBar,
    },
  ],
  projects: [
    {
      name: "Shared Links",
      url: "/shared",
      icon: IconSearch,
    },
    {
      name: "Input Data",
      url: "/data",
      icon: IconDatabase,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: IconHelp,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  fetchedUser: SidebarUser | null;
}

export function AppSidebar({ fetchedUser, ...props }: AppSidebarProps) {

  const user = fetchedUser || {
    name: "Guest",
    email: "Please sign in",
    avatar: ""
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <SwordIcon className="size-5!" />
                <span className="text-base font-semibold">PromptDuel</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
