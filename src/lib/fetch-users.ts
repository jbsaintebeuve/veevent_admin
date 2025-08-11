import { User, UsersApiResponse } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchUsers(
  token?: string,
  page = 0,
  size = 10
): Promise<UsersApiResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const res = await fetch(`${API_URL}/users?${params}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
  return await res.json();
}

export async function fetchUserById(
  userId: number,
  token?: string
): Promise<User> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    throw new Error(
      `Erreur lors du chargement de l'utilisateur (${res.status})`
    );
  }

  const userData = await res.json();

  // Normaliser les socials pour l'UI
  if (userData.socials) {
    try {
      if (typeof userData.socials === "string") {
        userData.socials = JSON.parse(userData.socials);
      }
    } catch (e) {
      console.warn("⚠️ Erreur parsing socials:", userData.socials);
      userData.socials = [];
    }
  } else {
    userData.socials = [];
  }

  return userData;
}

export async function banOrUnbanUser(
  userId: number,
  role: string,
  token?: string
): Promise<void> {
  // Récupérer l'utilisateur pour obtenir le HAL link
  const userData = await fetchUserById(userId, token);
  const patchUrl = userData._links?.self?.href;

  if (!patchUrl) {
    throw new Error("Lien de modification HAL manquant");
  }

  const res = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText}`);
  }
}
