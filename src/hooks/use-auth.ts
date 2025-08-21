"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/types/user";
import { authenticate, getMe } from "@/services/auth-service";
import { isRoleAllowed } from "@/utils/auth-roles";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getToken = useCallback(() => {
    if (typeof document === "undefined") return null;
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1] || null
    );
  }, []);

  const clearAuth = useCallback(() => {
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string, redirectUrl = "/dashboard") => {
      try {
        setLoading(true);

        const { token } = await authenticate(email, password);

        const userData = await getMe(token);

        if (!isRoleAllowed(userData.role)) {
          throw new Error(
            `Accès refusé. Rôle "${userData.role}" non autorisé.`
          );
        }

        document.cookie = `token=${token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }; SameSite=Lax`;
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        toast.success(`Bienvenue ${userData.firstName} !`);
        router.push(redirectUrl);
      } catch (err: any) {
        toast.error("Erreur de connexion");
        clearAuth();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router, clearAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    toast.success("Vous avez été déconnecté.");
    router.push("/auth/login");
  }, [router, clearAuth]);

  const checkAuth = useCallback(async () => {
    const token = getToken();

    if (!token) {
      clearAuth();
      setLoading(false);
      return;
    }

    try {
      const userData = await getMe(token);

      if (!isRoleAllowed(userData.role)) {
        throw new Error("Rôle non autorisé");
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [getToken, clearAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    isAuthenticated: !!user && !!getToken(),
    token: getToken(),
    login,
    logout,
    checkAuth,
    clearAuth,
  };
}
