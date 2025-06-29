import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Nettoie le localStorage tout en préservant le thème
 * Utilisé lors de la déconnexion pour maintenir les préférences de thème
 */
export function clearLocalStoragePreservingTheme() {
  try {
    if (typeof window === "undefined") return;

    // Sauvegarder le thème actuel
    const currentTheme = localStorage.getItem("theme");

    // Nettoyer le localStorage mais préserver le thème
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== "theme") {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Restaurer le thème s'il existait
    if (currentTheme) {
      localStorage.setItem("theme", currentTheme);
    }
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage du localStorage:", error);
  }
}
