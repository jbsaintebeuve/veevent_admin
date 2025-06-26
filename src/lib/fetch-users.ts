export interface User {
  id: number;
  lastName: string;
  firstName: string;
  pseudo: string;
  email: string;
  role: string;
  imageUrl?: string;
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("http://localhost:8090/users");
  if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
  const data = await res.json();
  if (data._embedded && Array.isArray(data._embedded.userResponses)) {
    return data._embedded.userResponses;
  }
  return [];
} 