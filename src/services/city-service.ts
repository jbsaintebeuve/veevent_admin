import {
  City,
  CitiesApiResponse,
  CityUpdateRequest,
  CityCreateRequest,
} from "@/types/city";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// CITY FETCHING
// ============================================================================

export async function fetchCities(
  token?: string,
  page = 0,
  size = 10
): Promise<CitiesApiResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const res = await fetch(`${API_URL}/cities?${params}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des villes");
  return await res.json();
}

// ============================================================================
// CITY MANAGEMENT
// ============================================================================

export async function createCity(payload: any, token?: string) {
  const res = await fetch(`${API_URL}/cities`, {
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
  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}

export async function modifyCity(
  patchUrl: string,
  payload: CityUpdateRequest,
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
    throw new Error(`Erreur ${res.status}: ${errorText}`);
  }

  try {
    return await res.json();
  } catch {
    return { success: true };
  }
}

export async function deleteCity(deleteUrl: string, token?: string) {
  const res = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    let errorMessage = "Erreur lors de la suppression";

    try {
      const errorData = await res.text();
      if (errorData) {
        errorMessage = `Erreur ${res.status}: ${errorData}`;
      }
    } catch {
      errorMessage = `Erreur ${res.status}: ${res.statusText}`;
    }

    throw new Error(errorMessage);
  }
}