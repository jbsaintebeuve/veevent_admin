"use client";

import { PlusCircle, Mail, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { CreateEventDialog } from "./create-dialogs/create-event-dialog";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const handleCreateEventClick = () => {
    // Fermer la sidebar mobile quand on ouvre le dialog
    setOpenMobile(false);
  };

  const handleMailClick = () => {
    // Fermer la sidebar mobile
    setOpenMobile(false);
    // Ouvrir l'application de mail avec l'adresse admin@veevent.fr
    window.open("mailto:admin@veevent.fr", "_blank");
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <CreateEventDialog>
              <SidebarMenuButton
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                onClick={handleCreateEventClick}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Créer un événement</span>
              </SidebarMenuButton>
            </CreateEventDialog>
            <Button
              type="button"
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              onClick={handleMailClick}
              title="Contacter l'administrateur"
            >
              <Mail className="h-4 w-4" />
              <span className="sr-only">Contacter l'administrateur</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url} onClick={handleLinkClick}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
