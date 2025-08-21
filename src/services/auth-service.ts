import { User } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Authentifie un utilisateur et retourne le token
 */
export async function authenticate(
  email: string,
  password: string
): Promise<{ token: string }> {
  const res = await fetch(`${API_URL}/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Email ou mot de passe incorrect");
  }

  return res.json();
}

/**
 * Récupère les infos de l'utilisateur connecté
 */
export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Impossible de charger l’utilisateur");
  }

  return res.json();
}
