import { User } from "@/types/user";

export async function fetchUsers(token?: string): Promise<User[]> {
  const res = await fetch("http://localhost:8090/api/v1/users", {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
  const data = await res.json();
  if (data._embedded && Array.isArray(data._embedded.userResponses)) {
    return data._embedded.userResponses;
  }
  return [];
}
