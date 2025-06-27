"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { setTheme, resolvedTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    console.log("❌ NavUser: No authenticated user");
    return null;
  }

  const handleLogout = async () => {
    try {
      console.log("🚪 Déconnexion demandée");
      toast.success("Déconnexion réussie");
      logout(); // Utilise la fonction logout du hook useAuth
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const displayName = `${user.firstName} ${user.lastName}`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.imageUrl || ""} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  @{user.pseudo}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.imageUrl || ""} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/profile" className="cursor-pointer">
                  <IconUserCircle className="mr-2 h-4 w-4" />
                  Mon profil
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/billing" className="cursor-pointer">
                  <IconCreditCard className="mr-2 h-4 w-4" />
                  Facturation
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer"
              >
                {resolvedTheme === "dark" ? (
                  <>
                    <IconMoon className="mr-2 h-4 w-4" />
                    Mode Sombre (actuel)
                  </>
                ) : (
                  <>
                    <IconSun className="mr-2 h-4 w-4" />
                    Mode clair (actuel)
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
            >
              <IconLogout className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
