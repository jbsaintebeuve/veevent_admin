"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { routePermissions } from "@/utils/route-permissions";
import { clearLocalStoragePreservingTheme } from "@/utils/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading, authChecked, isAuthenticated, loginSuccess } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    // Attendre que l'auth soit vérifiée
    if (loading || !authChecked) return;

    // Ne pas vérifier les permissions sur la page callback
    if (pathname === "/auth/callback") return;

    if (!isAuthenticated || !user) {
      setIsAuthorized(false);
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Vérification des permissions pour la route courante
    const matched = Object.entries(routePermissions).find(([prefix]) =>
      pathname.startsWith(prefix)
    );
    const allowedRoles = matched ? matched[1] : [];
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
      localStorage.removeItem("user");
      clearLocalStoragePreservingTheme();

      setIsAuthorized(false);
      router.replace("/auth/login?error=insufficient-permissions");
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, authChecked, isAuthenticated, router, pathname]);

  if (loading || !authChecked || pathname === "/auth/callback") {
    return (
      fallback || (
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Vérification des autorisations...
            </p>
          </div>
        </div>
      )
    );
  }

  // Si pas autorisé après vérification, ne rien afficher
  if (!isAuthorized) return null;

  return <>{children}</>;
}
