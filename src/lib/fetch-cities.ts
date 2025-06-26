import {
  City,
  CitiesApiResponse,
  CityUpdateRequest,
  CityCreateRequest,
} from "@/types/city";

export async function fetchCities(token?: string): Promise<CitiesApiResponse> {
  const res = await fetch("http://localhost:8090/api/v1/cities", {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des villes");
  return await res.json();
}

export async function createCity(payload: CityCreateRequest, token?: string) {
  const res = await fetch("http://localhost:8090/api/v1/cities", {
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
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}
