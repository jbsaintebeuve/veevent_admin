import {
  Event,
  EventsApiResponse,
  EventCreateRequest,
  EventUpdateRequest,
} from "@/types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchEvents(
  token?: string,
  page = 0,
  size = 10
): Promise<EventsApiResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const res = await fetch(`${API_URL}/events?${params}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des événements");
  return await res.json();
}

export async function createEvent(
  eventData: EventCreateRequest,
  token?: string
): Promise<Event> {
  const res = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    const statusErrors: Record<number, string> = {
      401: "Token expiré. Reconnectez-vous.",
      403: "Permissions insuffisantes.",
      400: "Données invalides.",
    };
    throw new Error(
      statusErrors[res.status] || `Erreur ${res.status}: ${errorText}`
    );
  }

  return res.json();
}

export async function modifyEvent(
  patchUrl: string,
  payload: EventUpdateRequest,
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

export async function fetchEventDetails(
  eventId: number,
  token?: string
): Promise<any> {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok)
    throw new Error("Erreur lors du chargement des détails de l'événement");
  return await res.json();
}

export async function deleteEvent(deleteUrl: string, token?: string) {
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

export async function fetchUserEvents(
  userEventsUrl: string,
  token?: string,
  page = 0,
  size = 10
): Promise<EventsApiResponse> {
  // Ajouter les paramètres de pagination à l'URL
  const url = new URL(userEventsUrl);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("size", size.toString());

  const res = await fetch(url.toString(), {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok)
    throw new Error(
      "Erreur lors du chargement des événements de l'utilisateur"
    );
  return await res.json();
}
