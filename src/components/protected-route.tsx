"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { routePermissions } from "@/utils/route-permissions";
import { isRoleAllowed } from "@/utils/auth-roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!isRoleAllowed(user.role)) {
      logout();
      return;
    }

    const matched = Object.entries(routePermissions).find(([prefix]) =>
      pathname.startsWith(prefix)
    );
    if (matched && !matched[1].includes(user.role.toLowerCase())) {
      logout();
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, isAuthenticated, router, pathname, logout]);

  if (loading) {
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
