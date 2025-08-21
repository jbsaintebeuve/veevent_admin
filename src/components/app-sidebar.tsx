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
  User,
  PlaneTakeoff,
  Shield,
  QrCode,
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
import { routePermissions } from "@/utils/route-permissions";
import { useAuth } from "@/hooks/use-auth";

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
      title: "Mes événements",
      url: "/my-events",
      icon: Calendar,
    },
    {
      title: "Utilisateurs",
      url: "/users",
      icon: Users,
    },
    {
      title: "Signalements",
      url: "/reports",
      icon: Shield,
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
    {
      title: "Invitations",
      url: "/invitations",
      icon: PlaneTakeoff,
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
      title: "Scanner Tickets",
      url: "/scan",
      icon: QrCode,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const filteredNavMain = data.navMain.filter((item) => {
    if (!user?.role) return false;
    const matched = Object.entries(routePermissions).find(([prefix]) =>
      item.url.startsWith(prefix)
    );
    const allowedRoles = matched ? matched[1] : [];
    return allowedRoles.includes(user.role.toLowerCase());
  });
  const filteredNavSecondary = data.navSecondary.filter((item) => {
    if (!user?.role) return false;
    const matched = Object.entries(routePermissions).find(([prefix]) =>
      item.url.startsWith(prefix)
    );
    const allowedRoles = matched ? matched[1] : [];
    return allowedRoles.includes(user.role.toLowerCase());
  });
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
        <NavMain items={filteredNavMain} />
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
