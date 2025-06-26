import { User } from "@/types/user";

export async function fetchUserMe(token: string): Promise<User> {
  const res = await fetch("http://localhost:8090/users/me", {
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
