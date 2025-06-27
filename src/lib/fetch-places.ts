import { Place, PlacesApiResponse, PlaceCreateRequest } from "@/types/place";
import { PlaceUpdateRequest } from "@/types/place";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchPlaces(token?: string): Promise<PlacesApiResponse> {
  const res = await fetch(`${API_URL}/places`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des lieux");
  return await res.json();
}

export async function fetchPlacesByCity(
  cityId: string,
  token?: string
): Promise<Place[]> {
  if (!cityId) return [];

  try {
    const res = await fetch(`${API_URL}/cities/${cityId}/places`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!res.ok) throw new Error("Erreur lors du chargement des lieux");
    const data = await res.json();

    // Adaptation selon la structure API
    if (data._embedded?.placeResponses) {
      return data._embedded.placeResponses;
    }
    if (Array.isArray(data)) {
      return data;
    }
    if (data.places && Array.isArray(data.places)) {
      return data.places;
    }

    return [];
  } catch (error) {
    console.error(`Erreur fetch places for city ${cityId}:`, error);
    return [];
  }
}

export async function createPlace(payload: PlaceCreateRequest, token?: string) {
  const res = await fetch(`${API_URL}/places`, {
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

export async function modifyPlace(
  patchUrl: string,
  payload: PlaceUpdateRequest,
  token?: string
) {
  console.log("🔧 modifyPlace - URL:", patchUrl);
  console.log("🔧 modifyPlace - Payload:", payload);
  console.log("🔧 modifyPlace - Token:", token ? "Présent" : "Manquant");

  const res = await fetch(patchUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });

  console.log("🔧 modifyPlace - Response status:", res.status);
  console.log(
    "🔧 modifyPlace - Response headers:",
    Object.fromEntries(res.headers.entries())
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ modifyPlace - Error Response:", errorText);
    throw new Error(`Erreur ${res.status}: ${errorText}`);
  }

  try {
    const result = await res.json();
    console.log("✅ modifyPlace - Success Response:", result);
    return result;
  } catch {
    console.log("✅ modifyPlace - No JSON response, returning success");
    return { success: true };
  }
}

export async function deletePlace(deleteUrl: string, token?: string) {
  const res = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}
