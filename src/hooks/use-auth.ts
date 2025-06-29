"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { User } from "@/types/user";
import { isRoleAllowed } from "@/lib/auth-roles";
import { fetchUserMe } from "@/lib/fetch-user";
import { clearLocalStoragePreservingTheme } from "@/lib/utils";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fonction pour récupérer le token depuis les cookies
  const getToken = useCallback(() => {
    try {
      if (typeof document === "undefined") return null;
      return (
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || null
      );
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du token:", error);
      return null;
    }
  }, []);

  // Fonction de nettoyage sécurisée
  const cleanupAuth = useCallback(() => {
    try {
      if (typeof document !== "undefined") {
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
        localStorage.removeItem("user");
        clearLocalStoragePreservingTheme();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("❌ Erreur lors du nettoyage:", error);
    }
  }, []);

  // Fonction de logout avec useCallback pour éviter les re-renders
  const logout = useCallback(() => {
    cleanupAuth();
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, [cleanupAuth]);

  useEffect(() => {
    let didFallbackToCache = false;
    const checkAuth = async () => {
      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      try {
        const token = getToken();
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        // Lire le cache localStorage
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
        // UX instantanée : si cache valide, on l'utilise tout de suite
        if (userData && isRoleAllowed(userData.role)) {
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          didFallbackToCache = true;
        }
        // Vérification API en arrière-plan (timeout 5s)
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), 5000);
          });
          const apiPromise = fetchUserMe(token);
          const freshUserData = (await Promise.race([
            apiPromise,
            timeoutPromise,
          ])) as User;
          if (!isRoleAllowed(freshUserData.role)) {
            cleanupAuth();
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          // Mettre à jour le cache et l'état
          localStorage.setItem("user", JSON.stringify(freshUserData));
          setUser(freshUserData);
          setIsAuthenticated(true);
          setLoading(false);
        } catch (apiError) {
          // Si l'API échoue mais qu'on a déjà affiché le cache, on ne fait rien (mode dégradé)
          if (didFallbackToCache) return;
          // Sinon, déconnexion
          cleanupAuth();
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (error) {
        cleanupAuth();
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };
    checkAuth();
    // Cleanup function pour annuler la requête si le hook se démonte
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [getToken, cleanupAuth]);

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    getToken,
  };
}
