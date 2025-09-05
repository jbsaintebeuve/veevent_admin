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

  const initialUser = getInitialUser();
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(true);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);

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
    setIsAuthenticated(false);
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
        setIsAuthenticated(true);
        setLoginSuccess(redirectUrl);

        toast.success(`Bienvenue ${userData.firstName} !`);
      } catch (err) {
        toast.error("Erreur de connexion");
        clearAuth();
        throw err;
      } finally {
        setLoading(false);
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
        setIsAuthenticated(true);
        setLoginSuccess(redirectUrl);

        toast.success(`Bienvenue ${userData.firstName} !`);
      } catch (err) {
        toast.error("Erreur de connexion");
        clearAuth();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
    toast.success("Vous avez été déconnecté.");
    router.replace("/auth/login");
  }, [clearAuth, router]);

  useEffect(() => {
    const checkAuth = async () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      try {
        const token = getToken();
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        try {
          const freshUser = await getMe(token);
          if (!isRoleAllowed(freshUser.role)) {
            clearAuth();
            setUser(null);
            setIsAuthenticated(false);
          } else {
            localStorage.setItem("user", JSON.stringify(freshUser));
            setUser(freshUser);
            setIsAuthenticated(true);
          }
        } catch {
          const cachedUser = getInitialUser();
          if (!cachedUser) {
            clearAuth();
            setIsAuthenticated(false);
          } else {
            setUser(cachedUser);
            setIsAuthenticated(true);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    return () => abortControllerRef.current?.abort();
  }, [getToken, clearAuth]);

  useEffect(() => {
    if (loginSuccess && user) {
      router.replace(loginSuccess);
      setLoginSuccess(null);
    }
  }, [loginSuccess, router, user]);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!user && !!token);
  }, [user, getToken]);

  return {
    user,
    loading,
    loginSuccess,
    isAuthenticated,
    token: getToken(),
    login,
    loginWithToken,
    logout,
    clearAuth,
  };
}
