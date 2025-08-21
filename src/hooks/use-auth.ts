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
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        localStorage.removeItem("user");
      }
    }
    return null;
  };

  const [user, setUser] = useState<User | null>(getInitialUser());
  const [loading, setLoading] = useState(() => {
    const token =
      typeof window !== "undefined"
        ? document.cookie.includes("token=")
        : false;
    const cachedUser = getInitialUser();
    return !(token && cachedUser);
  });

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

  useEffect(() => {
    let didFallbackToCache = false;
    let retryCount = 0;
    const maxRetries = 3;

    const checkAuth = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const token = getToken();
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userStr = localStorage.getItem("user");
        let userData: User | null = null;
        if (userStr) {
          try {
            userData = JSON.parse(userStr);
          } catch (parseError) {
            localStorage.removeItem("user");
            userData = null;
          }
        }

        if (userData && isRoleAllowed(userData.role)) {
          setUser(userData);
          setLoading(false);
          didFallbackToCache = true;
        }

        const attemptApiCall = async (): Promise<User> => {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), 8000);
          });
          const apiPromise = getMe(token);
          return (await Promise.race([apiPromise, timeoutPromise])) as User;
        };

        try {
          const freshUserData = await attemptApiCall();
          if (!isRoleAllowed(freshUserData.role)) {
            clearAuth();
            setUser(null);
            setLoading(false);
            return;
          }
          localStorage.setItem("user", JSON.stringify(freshUserData));
          setUser(freshUserData);
          setLoading(false);
        } catch (apiError) {
          if (didFallbackToCache) return;
          if (retryCount < maxRetries - 1) {
            retryCount++;
            setTimeout(() => checkAuth(), 2000);
            return;
          }
          clearAuth();
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        clearAuth();
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getToken, clearAuth]);

  return {
    user,
    loading,
    isAuthenticated: !!user && !!getToken(),
    token: getToken(),
    login,
    logout,
    clearAuth,
  };
}
