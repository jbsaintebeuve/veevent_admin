import { InvitationsApiResponse, Invitation } from "@/types/invitation";
import { User } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =============================================================================
// RÉCUPÉRATION DES INVITATIONS
// =============================================================================

/**
 * Récupère toutes les invitations avec pagination
 */
export async function fetchInvitations(
  token?: string,
  page = 0,
  size = 10
): Promise<InvitationsApiResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const res = await fetch(`${API_URL}/invitations?${params}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!res.ok) throw new Error("Erreur lors du chargement des invitations");
  return await res.json();
}

/**
 * Récupère les invitations reçues par l'utilisateur connecté
 */
export async function fetchUserInvitations(
  token?: string,
  page = 0,
  size = 10
): Promise<InvitationsApiResponse> {
  if (!token) {
    throw new Error(
      "Token requis pour récupérer les invitations de l'utilisateur"
    );
  }

  // Utiliser directement la route HATEOAS pour les invitations reçues
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const res = await fetch(
    `${API_URL}/users/me/received-invitations?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      "Erreur lors du chargement des invitations de l'utilisateur"
    );
  }
  return await res.json();
}

// =============================================================================
// GESTION DES INVITATIONS
// =============================================================================

/**
 * Accepte une invitation
 */
export async function acceptInvitation(
  invitation: Invitation,
  token?: string
): Promise<void> {
  if (!token) throw new Error("Token requis pour accepter une invitation");

  const selfLink = invitation._links?.self?.href;
  if (!selfLink) {
    throw new Error("Lien HATEOAS self manquant pour l'invitation");
  }

  const res = await fetch(selfLink, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "ACCEPTED" }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(
        errorData?.message || `Erreur ${res.status}: ${res.statusText}`
      );
    } catch (parseError) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }
}

/**
 * Refuse une invitation
 */
export async function declineInvitation(
  invitation: Invitation,
  token?: string
): Promise<void> {
  if (!token) throw new Error("Token requis pour refuser une invitation");

  const selfLink = invitation._links?.self?.href;
  if (!selfLink) {
    throw new Error("Lien HATEOAS self manquant pour l'invitation");
  }

  const res = await fetch(selfLink, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "REJECTED" }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(
        errorData?.message || `Erreur ${res.status}: ${res.statusText}`
      );
    } catch (parseError) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }
}

// =============================================================================
// PARTICIPANTS DES INVITATIONS
// =============================================================================

/**
 * Récupère les détails d'un participant d'invitation via son lien HATEOAS
 */
export async function fetchInvitationParticipant(
  selfHref: string,
  token?: string
): Promise<User> {
  const res = await fetch(`${selfHref}/user`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!res.ok) throw new Error("Erreur lors du chargement du participant");
  return await res.json();
}