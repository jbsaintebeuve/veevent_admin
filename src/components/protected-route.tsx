"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { routePermissions } from "@/lib/route-permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    // Vérifier les permissions pour la route courante
    const matched = Object.entries(routePermissions).find(([prefix]) =>
      pathname.startsWith(prefix)
    );
    const allowedRoles = matched ? matched[1] : [];
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
      localStorage.removeItem("user");
      localStorage.clear();
      router.replace("/auth/login?error=insufficient-permissions");
      return;
    }
    setIsAuthorized(true);
  }, [user, loading, isAuthenticated, router, pathname]);

  if (loading || isAuthorized === null) {
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
  if (!isAuthorized) return null;
  return <>{children}</>;
}
