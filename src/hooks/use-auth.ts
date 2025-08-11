"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/types/user";
import { isRoleAllowed } from "@/lib/auth-roles";
import { fetchUserMe } from "@/lib/fetch-user-me";
import { clearLocalStoragePreservingTheme } from "@/lib/utils";

export interface UseAuthLoginOptions {
  showToast?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

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
  const clearAuth = useCallback(() => {
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

  // ✅ NOUVELLE FONCTIONNALITÉ : Fonction de login (fusionnée depuis use-login)
  const storeAuthAndRedirect = useCallback(
    async (
      token: string,
      userData: User,
      redirectUrl: string,
      options: UseAuthLoginOptions = {}
    ) => {
      const { showToast = true } = options;

      // Vérifier si l'utilisateur a les permissions nécessaires
      if (!isRoleAllowed(userData.role)) {
        throw new Error(
          `Accès refusé. Votre rôle "${userData.role}" ne permet pas d'accéder à cette interface.`
        );
      }

      // Nettoyer les données d'authentification précédentes
      clearAuth();

      // Stockage des données utilisateur AVANT le cookie pour éviter les problèmes de race condition
      localStorage.setItem("user", JSON.stringify(userData));

      // Définition du cookie
      document.cookie = `token=${token}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; SameSite=Lax`;

      // Mettre à jour l'état immédiatement
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);

      // Déclencher un événement personnalisé pour forcer la re-vérification de l'auth
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-refresh"));
      }

      // Afficher le toast de bienvenue si l'option est activée
      if (showToast) {
        toast.success(`Bienvenue ${userData.firstName} !`, {
          duration: 4000, // Toast visible pendant 4 secondes
        });
      }

      // Attendre un peu pour que les données soient synchronisées
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Navigation SPA (garde le toast actif)
      await router.push(redirectUrl);
    },
    [clearAuth, router]
  );

  // Fonction de logout avec useCallback pour éviter les re-renders
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    // Navigation SPA pour garder les toasts actifs
    router.push("/auth/login");
  }, [clearAuth, router]);

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
            clearAuth();
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
          clearAuth();
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Erreur générale dans checkAuth:", error);
        clearAuth();
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();

    // Écouter les événements personnalisés pour forcer la re-vérification
    const handleAuthRefresh = () => {
      console.log("🔄 Événement auth-refresh reçu, re-vérification...");
      checkAuth();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth-refresh", handleAuthRefresh);
    }

    // Cleanup function pour annuler la requête si le hook se démonte
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-refresh", handleAuthRefresh);
      }
    };
  }, [getToken, clearAuth]);

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    getToken,
    storeAuthAndRedirect,
    clearAuth,
  };
}
