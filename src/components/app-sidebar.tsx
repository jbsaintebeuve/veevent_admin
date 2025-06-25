"use client";

import * as React from "react";
import {
  Calendar,
  Users,
  MapPin,
  Building2,
  Tag,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  User,
  PlaneTakeoff,
  Earth,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IconInnerShadowTop } from "@tabler/icons-react";

const data = {
  user: {
    name: "Admin VEvent",
    email: "admin@veevent.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Événements",
      url: "/events",
      icon: Calendar,
    },
    {
      title: "Utilisateurs",
      url: "/users",
      icon: Users,
    },
    {
      title: "Catégories",
      url: "/categories",
      icon: Tag,
    },
    {
      title: "Villes",
      url: "/cities",
      icon: MapPin,
    },
    {
      title: "Lieux",
      url: "/places",
      icon: Building2,
    },
  ],
  navSecondary: [
    {
      title: "Profil",
      url: "/profile",
      icon: User,
    },
    {
      title: "Paramètres",
      url: "/settings",
      icon: Settings,
    },

    {
      title: "Site web",
      url: "https://veevent.vercel.app/",
      icon: Earth,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Veevent</span>
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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
