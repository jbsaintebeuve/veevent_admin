"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/user";
import { isRoleAllowed } from "@/lib/auth-roles";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("❌ Erreur lors du nettoyage:", error);
    }
  }, []);

  // Fonction de logout avec useCallback pour éviter les re-renders
  const logout = useCallback(() => {
    console.log("🚪 Déconnexion en cours...");

    cleanupAuth();

    setUser(null);
    setIsAuthenticated(false);

    console.log("✅ Déconnexion terminée, redirection...");

    // Forcer la redirection
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, [cleanupAuth]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        console.log("🔍 Vérification auth - Token:", !!token);

        if (!token) {
          console.log("❌ Pas de token trouvé");
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Récupérer les données utilisateur depuis localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            console.log("✅ Données utilisateur trouvées:", userData.pseudo);

            // Vérification du rôle (sécurité supplémentaire)
            if (!isRoleAllowed(userData.role)) {
              console.log("❌ Rôle non autorisé détecté, nettoyage");
              cleanupAuth();
              setUser(null);
              setIsAuthenticated(false);
            }

            setUser(userData);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("❌ Erreur parsing user data:", parseError);
            cleanupAuth();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("❌ Pas de données utilisateur en localStorage");
          // Token présent mais pas de données utilisateur -> nettoyer
          cleanupAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la vérification de l'authentification:",
          error
        );
        cleanupAuth();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [getToken, cleanupAuth]);

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    getToken,
  };
}
