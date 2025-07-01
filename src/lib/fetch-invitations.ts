import { InvitationsApiResponse } from "@/types/invitation";
import { fetchUserMe } from "@/lib/fetch-user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export async function fetchUserInvitations(
  token?: string,
  page = 0,
  size = 10
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

  // 3. Ajouter les paramètres de pagination au lien
  const url = new URL(invitationsLink);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("size", size.toString());

  // 4. Fetch les invitations de l'utilisateur avec pagination
  const res = await fetch(url.toString(), {
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
