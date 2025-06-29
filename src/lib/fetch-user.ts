import { User } from "@/types/user";
import { isRoleAllowed } from "@/lib/auth-roles";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function authenticateUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errors: Record<number, string> = {
      401: "Email ou mot de passe incorrect",
      403: "Accès interdit",
      500: "Erreur serveur. Veuillez réessayer plus tard.",
    };
    throw new Error(
      errors[res.status] || `Erreur d'authentification (${res.status})`
    );
  }

  return res.json();
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

  return res.json();
}

export async function checkAuthWithRoles(
  token: string
): Promise<{ user: User; isAuthorized: boolean }> {
  try {
    const user = await fetchUserMe(token);
    const isAuthorized = isRoleAllowed(user.role);
    return { user, isAuthorized };
  } catch (error) {
    throw error;
  }
}

interface UserProfileData {
  description?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  note?: number | null;
  socials?: string | Array<{ name: string; url: string }> | null; // JSON string ou tableau d'objets
  categoryKeys?: string[];
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  email?: string;
  password?: string;
  description?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  note?: number | null;
  socials?: string | null; // JSON string
  categoryKeys?: string[];
}

export async function fetchUserProfile(
  userId: number,
  token?: string
): Promise<UserProfileData> {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement du profil (${res.status})`);
  }

  const userData = await res.json();

  // Extraire les données de profil
  return {
    description: userData.description || null,
    phone: userData.phone || null,
    imageUrl: userData.imageUrl || null,
    bannerUrl: userData.bannerUrl || null,
    note: userData.note || null,
    socials: userData.socials || null,
    categoryKeys: userData.categoryKeys || [],
  };
}

export async function updateUserProfile(
  userId: number,
  profileData: UpdateProfileRequest,
  token?: string
): Promise<void> {
  // D'abord récupérer l'utilisateur pour obtenir le HAL link
  const userRes = await fetch(`${API_URL}/users/${userId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!userRes.ok) {
    throw new Error(
      `Erreur lors de la récupération de l'utilisateur (${userRes.status})`
    );
  }

  const userData = await userRes.json();
  const patchUrl = userData._links?.self?.href;

  if (!patchUrl) {
    throw new Error("Lien de modification HAL manquant");
  }

  console.log("🔧 Update Profile - Patch URL:", patchUrl);
  console.log("🔧 Update Profile - Payload:", profileData);

  const res = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
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
