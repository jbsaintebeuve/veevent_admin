/**
 * Utilitaire pour générer des messages d'erreur contextuels lors des suppressions
 */
export function getDeleteErrorMessage(
  error: Error,
  entityType: string
): string {
  const errorMessage = error.message || "Erreur lors de la suppression";

  // Messages spécifiques selon le code d'erreur
  if (errorMessage.includes("409") || errorMessage.includes("Conflict")) {
    return `Impossible de supprimer : ${entityType} est utilisé(e) par des événements ou d'autres entités`;
  }

  if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
    return `Vous n'avez pas les droits pour supprimer ${entityType}`;
  }

  if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
    return `${entityType} n'existe plus`;
  }

  if (errorMessage.includes("400") || errorMessage.includes("Bad Request")) {
    return `Demande invalide pour la suppression de ${entityType}`;
  }

  if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
    return "Session expirée, veuillez vous reconnecter";
  }

  if (
    errorMessage.includes("500") ||
    errorMessage.includes("Internal Server Error")
  ) {
    return "Erreur serveur, veuillez réessayer plus tard";
  }

  // Message d'erreur brut du serveur s'il est informatif
  return errorMessage;
}

/**
 * Types d'entités pour les messages d'erreur
 */
export const EntityTypes = {
  CITY: "cette ville",
  EVENT: "cet événement",
  CATEGORY: "cette catégorie",
  PLACE: "ce lieu",
  USER: "cet utilisateur",
  REPORT: "ce signalement",
} as const;
