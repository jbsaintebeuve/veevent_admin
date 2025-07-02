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
    let retryCount = 0;
    const maxRetries = 3;

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

        // Vérification API en arrière-plan avec retry
        const attemptApiCall = async (): Promise<User> => {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Timeout")), 8000); // Augmenté à 8s
          });
          const apiPromise = fetchUserMe(token);
          return (await Promise.race([apiPromise, timeoutPromise])) as User;
        };

        try {
          const freshUserData = await attemptApiCall();

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
          console.warn(
            `❌ Tentative API ${retryCount + 1}/${maxRetries} échouée:`,
            apiError
          );

          // Si on a déjà affiché le cache, on ne fait rien (mode dégradé)
          if (didFallbackToCache) return;

          // Retry si on n'a pas dépassé le nombre max de tentatives
          if (retryCount < maxRetries - 1) {
            retryCount++;
            console.log(
              `🔄 Nouvelle tentative dans 2 secondes... (${retryCount}/${maxRetries})`
            );
            setTimeout(() => checkAuth(), 2000);
            return;
          }

          // Si toutes les tentatives ont échoué, déconnexion
          console.error("❌ Toutes les tentatives API ont échoué, déconnexion");
          cleanupAuth();
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Erreur générale dans checkAuth:", error);
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
