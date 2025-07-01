import {
  Event,
  EventsApiResponse,
  EventCreateRequest,
  EventUpdateRequest,
} from "@/types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchEvents(token?: string): Promise<EventsApiResponse> {
  const res = await fetch(`${API_URL}/events`, {
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

export async function fetchEventDetails(eventId: number, token?: string): Promise<any> {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des détails de l'événement");
  return await res.json();
}

export async function deleteEvent(deleteUrl: string, token?: string) {
  const res = await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}

export async function fetchUserEvents(
  userEventsUrl: string,
  token?: string
): Promise<EventsApiResponse> {
  const res = await fetch(userEventsUrl, {
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
