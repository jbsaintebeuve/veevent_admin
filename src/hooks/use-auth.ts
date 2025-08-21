"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/types/user";
import { authenticate, getMe } from "@/services/auth-service";
import { isRoleAllowed } from "@/utils/auth-roles";

export function useAuth() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const getInitialUser = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(getInitialUser());
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

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

        setLoginSuccess(redirectUrl);
      } catch (err) {
        toast.error("Erreur de connexion");
        clearAuth();
        throw err;
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    },
    [clearAuth]
  );

  const loginWithToken = useCallback(
    async (token: string, redirectUrl = "/dashboard") => {
      try {
        setLoading(true);

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

        setLoginSuccess(redirectUrl);
      } catch (err) {
        toast.error("Erreur de connexion");
        clearAuth();
        throw err;
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    },
    [clearAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    toast.success("Vous avez été déconnecté.");
    router.replace("/auth/login");
  }, [clearAuth, router]);

  // Vérification initiale de l'auth
  useEffect(() => {
    const checkAuth = async () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        const token = getToken();
        if (!token) {
          setUser(null);
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        // Vérification API
        try {
          const freshUser = await getMe(token);
          if (!isRoleAllowed(freshUser.role)) {
            clearAuth();
            setUser(null);
          } else {
            localStorage.setItem("user", JSON.stringify(freshUser));
            setUser(freshUser);
          }
        } catch {
          const cachedUser = getInitialUser();
          if (!cachedUser) clearAuth();
          else setUser(cachedUser);
        }
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
    return () => abortControllerRef.current?.abort();
  }, [getToken, clearAuth]);

  useEffect(() => {
    if (loginSuccess) {
      setTimeout(() => {
        router.replace(loginSuccess);
        setLoginSuccess(null);
      }, 100);
    }
  }, [loginSuccess, router]);

  return {
    user,
    loading,
    authChecked,
    loginSuccess,
    isAuthenticated: !!user && !!getToken(),
    token: getToken(),
    login,
    loginWithToken,
    logout,
    clearAuth,
  };
}
