import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function clearLocalStoragePreservingTheme() {
  try {
    if (typeof window === "undefined") return;

    const currentTheme = localStorage.getItem("theme");

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== "theme") {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    if (currentTheme) {
      localStorage.setItem("theme", currentTheme);
    }
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage du localStorage:", error);
  }
}
