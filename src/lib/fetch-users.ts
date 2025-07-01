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
