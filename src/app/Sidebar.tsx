"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { Menu, Home, Users, Map, Calendar, Tag, LogOut, Settings, Search, FileText, BookOpen, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { href: "/events", label: "Événements", icon: <Calendar className="w-5 h-5" /> },
  { href: "/cities", label: "Villes", icon: <Map className="w-5 h-5" /> },
  { href: "/places", label: "Lieux", icon: <Map className="w-5 h-5" /> },
  { href: "/categories", label: "Catégories", icon: <Tag className="w-5 h-5" /> },
  { href: "/users", label: "Utilisateurs", icon: <Users className="w-5 h-5" /> },
];
const docLinks = [
  { href: "/data-library", label: "Data Library", icon: <BookOpen className="w-5 h-5" /> },
  { href: "/reports", label: "Reports", icon: <FileText className="w-5 h-5" /> },
  { href: "/word-assistant", label: "Word Assistant", icon: <MoreHorizontal className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Sidebar desktop */}
      <aside className={`hidden md:flex h-screen ${collapsed ? "w-20" : "w-64"} bg-white border-r flex-col py-4 px-2 fixed transition-all duration-200 z-30 shadow-sm`}> 
        {/* Logo + bouton collapse */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} mb-8 px-1`}> 
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/veevent.svg" alt="Veevent" width={collapsed ? 0 : 175} height={collapsed ? 32 : 40} className="transition-all" />
            {/* {!collapsed && <span className="font-bold text-xl tracking-tight">Veevent</span>} */}
          </Link>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setCollapsed(v => !v)}>
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          <TooltipProvider>
            {mainLinks.map(link => (
              <Tooltip key={link.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                    className={`w-full justify-start font-normal px-2 ${collapsed ? "flex items-center justify-center" : "flex items-center"}`}
                    asChild
                  >
                    <Link href={link.href} className="flex items-center gap-3">
                      {link.icon}
                      {!collapsed && link.label}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
              </Tooltip>
            ))}
          </TooltipProvider>
          <div className={`mt-6 mb-2 text-xs text-muted-foreground px-2 ${collapsed ? "hidden" : "block"}`}>Documents</div>
          <TooltipProvider>
            {docLinks.map(link => (
              <Tooltip key={link.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                    className={`w-full justify-start font-normal px-2 ${collapsed ? "flex items-center justify-center" : "flex items-center"}`}
                    asChild
                  >
                    <Link href={link.href} className="flex items-center gap-3">
                      {link.icon}
                      {!collapsed && link.label}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        {/* Bas de sidebar */}
        <div className="mt-auto flex flex-col gap-2 pb-2">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" className={`w-full justify-start ${collapsed ? "flex items-center justify-center" : ""}`} asChild>
                  <Link href="/settings"><Settings className="w-5 h-5" />{!collapsed && <span className="ml-2">Paramètres</span>}</Link>
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Paramètres</TooltipContent>}
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" className={`w-full justify-start ${collapsed ? "flex items-center justify-center" : ""}`} asChild>
                  <Link href="/search"><Search className="w-5 h-5" />{!collapsed && <span className="ml-2">Recherche</span>}</Link>
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Recherche</TooltipContent>}
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  className={`w-full justify-start mt-2 ${collapsed ? "flex items-center justify-center" : ""}`}
                  onClick={() => {
                    document.cookie = "token=; Max-Age=0; path=/";
                    window.location.href = "/login";
                  }}
                >
                  <LogOut className="w-5 h-5" />{!collapsed && <span className="ml-2">Déconnexion</span>}
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Déconnexion</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Avatar utilisateur */}
        <div className={`flex items-center gap-2 mt-6 px-2 text-xs text-muted-foreground ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="h-7 w-7" />
          {!collapsed && <div>
            <div className="font-medium">shadcn</div>
            <div className="text-xs">m@example.com</div>
          </div>}
        </div>
      </aside>
      {/* Sidebar mobile (Sheet) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="h-full flex flex-col py-6 px-4 bg-white border-r">
              <div className="flex items-center gap-3 mb-8 px-2">
                <Image src="/veevent.svg" alt="Veevent" width={40} height={40} />
                <div>
                  <div className="font-bold text-lg">Veevent</div>
                  <div className="text-xs text-muted-foreground">admin@example.com</div>
                </div>
              </div>
              <nav className="flex-1 flex flex-col gap-2">
                {mainLinks.map(link => (
                  <Button
                    key={link.href}
                    variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href={link.href} className="flex items-center gap-3">{link.icon}{link.label}</Link>
                  </Button>
                ))}
                <div className="mt-6 mb-2 text-xs text-muted-foreground px-2">Documents</div>
                {docLinks.map(link => (
                  <Button
                    key={link.href}
                    variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                    className="w-full justify-start font-normal"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href={link.href} className="flex items-center gap-3">{link.icon}{link.label}</Link>
                  </Button>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/settings"><Settings className="w-5 h-5 mr-2" />Paramètres</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/search"><Search className="w-5 h-5 mr-2" />Recherche</Link>
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start mt-2"
                  onClick={() => {
                    document.cookie = "token=; Max-Age=0; path=/";
                    window.location.href = "/login";
                  }}
                >
                  <LogOut className="w-5 h-5 mr-2" />Déconnexion
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-6 px-2 text-xs text-muted-foreground">
                <Avatar className="h-7 w-7" />
                <div>
                  <div className="font-medium">shadcn</div>
                  <div className="text-xs">m@example.com</div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
} 