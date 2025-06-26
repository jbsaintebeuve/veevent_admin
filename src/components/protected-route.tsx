"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthWithRoles } from "@/lib/fetch-user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = document.cookie
          .split(";")
          .find((row) => row.trim().startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          return redirectToLogin("No token found");
        }

        const { user, isAuthorized } = await checkAuthWithRoles(token);

        if (!isAuthorized) {
          clearAuthData();
          return router.replace("/auth/login?error=insufficient-permissions");
        }

        console.log("✅ Authentication successful");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Auth check error:", error);
        clearAuthData();
        redirectToLogin("Auth check failed");
      }
    };

    const clearAuthData = () => {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
      localStorage.removeItem("user");
      localStorage.clear();
    };

    const redirectToLogin = (reason: string) => {
      console.log(`❌ ${reason}, redirecting to login`);
      setIsAuthenticated(false);
      router.replace(
        `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
    };

    checkAuth();
  }, [router]);

  // Chargement
  if (isAuthenticated === null) {
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

  // Pas authentifié = redirection en cours
  if (!isAuthenticated) return null;

  // Authentifié = afficher le contenu
  return <>{children}</>;
}
