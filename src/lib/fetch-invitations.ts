import { InvitationsApiResponse } from "@/types/invitation";
import { fetchUserMe } from "@/lib/fetch-user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchInvitations(
  token?: string
): Promise<InvitationsApiResponse> {
  const res = await fetch(`${API_URL}/invitations`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des invitations");
  return await res.json();
}

export async function fetchUserInvitations(
  token?: string
): Promise<InvitationsApiResponse> {
  if (!token)
    throw new Error(
      "Token requis pour récupérer les invitations de l'utilisateur"
    );
  // 1. Récupérer l'utilisateur courant
  const user = await fetchUserMe(token);
  // 2. Récupérer le lien HAL pour les invitations
  const invitationsLink = user?._links?.invitations?.href;
  if (!invitationsLink)
    throw new Error("Lien invitations HAL manquant pour l'utilisateur");
  // 3. Fetch les invitations de l'utilisateur
  const res = await fetch(invitationsLink, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok)
    throw new Error(
      "Erreur lors du chargement des invitations de l'utilisateur"
    );
  return await res.json();
}
