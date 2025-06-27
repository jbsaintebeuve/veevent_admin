// Fonction utilitaire pour récupérer les catégories depuis l'API
import {
  CategoriesApiResponse,
  Category,
  CategoryUpdateRequest,
  CategoryCreateRequest,
} from "@/types/category";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchCategories(
  token?: string
): Promise<CategoriesApiResponse> {
  const res = await fetch(`${API_URL}/categories`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
  return await res.json();
}

export async function createCategory(
  payload: CategoryCreateRequest,
  token?: string
): Promise<Category> {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText}`);
  }

  return res.json();
}

export async function modifyCategory(
  patchUrl: string,
  payload: CategoryUpdateRequest,
  token?: string
) {
  const res = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ modifyCategory - Error Response:", errorText);
    throw new Error(`Erreur ${res.status}: ${errorText}`);
  }

  try {
    const result = await res.json();
    console.log("✅ modifyCategory - Success Response:", result);
    return result;
  } catch {
    console.log("✅ modifyCategory - No JSON response, returning success");
    return { success: true };
  }
}

export async function deleteCategory(deleteUrl: string, token?: string) {
  const res = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}
