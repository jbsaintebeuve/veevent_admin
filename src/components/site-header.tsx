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
import { Sun, Moon, Github, User } from "lucide-react";

// Mapping des paths vers les labels
const pathConfig = {
  "/": "Tableau de bord",
  "/users": "Utilisateurs",
  "/events": "Événements",
  "/places": "Lieux",
  "/categories": "Catégories",
  "/cities": "Villes",
  "/profile": "Profil",
};

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter les erreurs d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction pour générer le breadcrumb
  const generateBreadcrumb = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems = [];

    // Si on n'est pas sur l'accueil, ajouter l'accueil
    if (segments.length > 0) {
      breadcrumbItems.push({
        href: "/",
        label: pathConfig["/"],
        isLast: false,
      });
    }

    // Ajouter les segments suivants
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = pathConfig[currentPath as keyof typeof pathConfig];

      if (label) {
        breadcrumbItems.push({
          href: currentPath,
          label,
          isLast: index === segments.length - 1,
        });
      }
    });

    // Si on est sur l'accueil, afficher juste "Tableau de bord"
    if (segments.length === 0) {
      breadcrumbItems.push({
        href: "/",
        label: pathConfig["/"],
        isLast: true,
      });
    }

    return breadcrumbItems;
  };

  const breadcrumbItems = generateBreadcrumb();

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Si pas encore monté, ne pas afficher l'icône de thème
  if (!mounted) {
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
              <>
                <BreadcrumbItem
                  key={item.href}
                  className={
                    index === 0 && breadcrumbItems.length > 1
                      ? "hidden md:block"
                      : ""
                  }
                >
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!item.isLast && (
                  <BreadcrumbSeparator
                    key={`separator-${index}`}
                    className={
                      index === 0 && breadcrumbItems.length > 1
                        ? "hidden md:block"
                        : ""
                    }
                  />
                )}
              </>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Right side actions - skeleton pendant le chargement */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
            <div className="h-4 w-4 animate-pulse bg-muted rounded" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
            <Link href="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/jbsaintebeuve/veevent_admin"
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              <span className="hidden lg:inline">GitHub</span>
            </a>
          </Button>
        </div>
      </header>
    );
  }

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
            <>
              <BreadcrumbItem
                key={item.href}
                className={
                  index === 0 && breadcrumbItems.length > 1
                    ? "hidden md:block"
                    : ""
                }
              >
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!item.isLast && (
                <BreadcrumbSeparator
                  key={`separator-${index}`}
                  className={
                    index === 0 && breadcrumbItems.length > 1
                      ? "hidden md:block"
                      : ""
                  }
                />
              )}
            </>
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
        >
          {resolvedTheme === "dark" ? (
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
            href="https://github.com/jbsaintebeuve/veevent_admin"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2"
          >
            <Github className="h-4 w-4" />
            <span className="hidden lg:inline">GitHub</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
