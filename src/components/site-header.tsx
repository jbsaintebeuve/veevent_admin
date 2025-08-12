"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Sun, Moon, User, Globe2 } from "lucide-react";
import React from "react";

// Mapping des paths vers les labels
const pathConfig = {
  "/": "Tableau de bord",
  "/dashboard": "Tableau de bord",
  "/users": "Utilisateurs",
  "/events": "Événements",
  "/my-events": "Mes événements",
  "/places": "Lieux",
  "/categories": "Catégories",
  "/cities": "Villes",
  "/profile": "Profil",
  "/reports": "Signalements",
  "/invitations": "Invitations",
  "/scan": "Scanner Tickets",
};

export function SiteHeader() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction pour générer le breadcrumb
  const generateBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);

    // Si on est sur l'accueil, afficher "Tableau de bord"
    if (segments.length === 0) {
      return [
        {
          href: "/",
          label: pathConfig["/"],
          isLast: true,
        },
      ];
    }

    // Pour les autres pages, afficher seulement le nom de la page actuelle
    const currentPath = "/" + segments.join("/");
    const label = pathConfig[currentPath as keyof typeof pathConfig];

    if (label) {
      return [
        {
          href: currentPath,
          label,
          isLast: true,
        },
      ];
    }

    // Fallback si la page n'est pas dans pathConfig
    return [
      {
        href: currentPath,
        label:
          segments[segments.length - 1].charAt(0).toUpperCase() +
          segments[segments.length - 1].slice(1),
        isLast: true,
      },
    ];
  };

  const breadcrumbItems = generateBreadcrumb();

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={`breadcrumb-${index}`}>
              <BreadcrumbItem key={item.href}>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator key={`separator-${index}`} />
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title={resolvedTheme === "dark" ? "Mode clair" : "Mode sombre"}
          onClick={toggleTheme}
          disabled={!mounted}
        >
          {!mounted ? (
            <div className="h-4 w-4 animate-pulse bg-muted rounded" />
          ) : resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Basculer le thème</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Profil"
          asChild
        >
          <Link href="/profile">
            <User className="h-4 w-4" />
            <span className="sr-only">Profil</span>
          </Link>
        </Button>

        <Separator orientation="vertical" className="h-4" />

        <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
          <a
            href="https://veevent.vercel.app/"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2"
          >
            <Globe2 className="h-4 w-4" />
            <span className="hidden lg:inline">Site web</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
