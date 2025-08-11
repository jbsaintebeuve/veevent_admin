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

    // Définition du cookie
    document.cookie = `token=${token}; path=/; max-age=${
      7 * 24 * 60 * 60
    }; SameSite=Lax`;

    // Stockage des données utilisateur
    localStorage.setItem("user", JSON.stringify(userData));

    // Attendre un peu pour s'assurer que le navigateur a traité les changements
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Afficher le toast de bienvenue si l'option est activée
    if (showToast) {
      toast.success(`Bienvenue ${userData.firstName} !`);
    }

    // Redirection avec await pour s'assurer qu'elle est initiée
    await router.push(redirectUrl);
  };

  return {
    storeAuthAndRedirect,
    clearAuth,
  };
}
