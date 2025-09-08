import { User, UsersApiResponse, UserUpdateRequest } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// USER FETCHING
// ============================================================================

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

export async function fetchUserMe(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "Token invalide"
        : `Erreur utilisateur (${res.status})`
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

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function updateUserProfile(
  profileData: UserUpdateRequest,
  token: string
): Promise<void> {
  // On peut directement faire la requête PATCH sur /users/me
  const patchUrl = `${API_URL}/users/me`;

  console.log("🔧 Update Profile - Patch URL:", patchUrl);
  console.log("🔧 Update Profile - Payload:", profileData);

  const res = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Erreur PATCH profil:", res.status, errorText);
    throw new Error(`Erreur ${res.status}: ${errorText}`);
  }

  console.log("✅ Profil mis à jour avec succès");
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

export async function updateUserRole(
  userId: number,
  newRole: string,
  token: string
): Promise<void> {
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
    body: JSON.stringify({ role: newRole }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText}`);
  }
}
