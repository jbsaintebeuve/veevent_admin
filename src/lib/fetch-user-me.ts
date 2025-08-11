import { User, UserUpdateRequest } from "@/types/user";
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
