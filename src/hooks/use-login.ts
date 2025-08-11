/*
 * ⚠️ FICHIER OBSOLÈTE - À SUPPRIMER ⚠️
 *
 * Ce hook a été fusionné dans use-auth.ts
 * Toutes les fonctionnalités sont maintenant disponibles dans useAuth()
 *
 * Migration effectuée :
 * - storeAuthAndRedirect() -> useAuth().storeAuthAndRedirect()
 * - clearAuth() -> useAuth().clearAuth()
 *
 * Ce fichier peut être supprimé en toute sécurité.
 */

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isRoleAllowed } from "@/lib/auth-roles";
import { clearLocalStoragePreservingTheme } from "@/lib/utils";
import { User } from "@/types/user";

export interface UseLoginOptions {
  showToast?: boolean;
}

export function useLogin(options: UseLoginOptions = {}) {
  const router = useRouter();
  const { showToast = true } = options;

  const clearAuth = () => {
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    clearLocalStoragePreservingTheme();
  };

  const storeAuthAndRedirect = async (
    token: string,
    userData: User,
    redirectUrl: string
  ) => {
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
  };

  return {
    storeAuthAndRedirect,
    clearAuth,
  };
}
