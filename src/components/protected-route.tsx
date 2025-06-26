"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

        const response = await fetch("http://localhost:8090/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          clearAuthData();
          return redirectToLogin("Token invalid");
        }

        const userData = await response.json();
        const allowedRoles = ["ADMIN", "ORGANIZER", "Admin", "Organizer"];

        if (!allowedRoles.includes(userData.role)) {
          clearAuthData();
          return router.replace("/login?error=insufficient-permissions");
        }

        console.log("✅ Authentication successful");
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Auth check error:", error);
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
