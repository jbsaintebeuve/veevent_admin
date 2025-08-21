import {
  Event,
  EventsApiResponse,
  EventCreateRequest,
  EventUpdateRequest,
  EventParticipant,
  EventParticipantsApiResponse,
} from "@/types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =============================================================================
// RÉCUPÉRATION DES ÉVÉNEMENTS
// =============================================================================

/**
 * Récupère tous les événements avec pagination
 */
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

/**
 * Récupère les détails d'un événement spécifique
 */
export async function fetchEventDetails(
  eventId: number,
  token?: string
): Promise<any> {
  const res = await fetch(`${API_URL}/events/${eventId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des détails de l'événement");
  }
  return await res.json();
}

/**
 * Récupère les événements d'un utilisateur via l'URL HATEOAS
 */
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

  if (!res.ok) {
    throw new Error(
      "Erreur lors du chargement des événements de l'utilisateur"
    );
  }
  return await res.json();
}

// =============================================================================
// CRÉATION ET MODIFICATION D'ÉVÉNEMENTS
// =============================================================================

/**
 * Crée un nouvel événement
 */
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

/**
 * Modifie un événement existant via PATCH
 */
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

/**
 * Supprime un événement
 */
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

// =============================================================================
// PARTICIPANTS D'ÉVÉNEMENTS
// =============================================================================

/**
 * Récupère les participants d'un événement
 */
export async function fetchEventParticipants(
  eventSelfLink: string,
  token?: string
): Promise<EventParticipantsApiResponse> {
  try {
    const participantsUrl = `${eventSelfLink}/participants`;

    const response = await fetch(participantsUrl, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Non autorisé - Token invalide");
      }
      if (response.status === 403) {
        throw new Error("Accès interdit - Permissions insuffisantes");
      }
      if (response.status === 404) {
        throw new Error("Événement non trouvé ou aucun participant");
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data: EventParticipantsApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des participants:", error);
    throw error;
  }
}

/**
 * Récupère tous les participants d'un événement sans pagination
 */
export async function fetchAllEventParticipants(
  eventSelfLink: string,
  token?: string
): Promise<EventParticipant[]> {
  try {
    const response = await fetchEventParticipants(eventSelfLink, token);

    if (response._embedded?.userSummaries) {
      return response._embedded.userSummaries;
    }

    return [];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de tous les participants:",
      error
    );
    throw error;
  }
}

// Interface pour les détails complets d'un utilisateur
export interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  pseudo: string;
  email: string;
  imageUrl?: string | null;
  _links?: any;
}

/**
 * Récupère les détails complets d'un utilisateur via son lien HATEOAS
 */
export async function fetchUserDetails(
  userSelfLink: string,
  token?: string
): Promise<UserDetails> {
  try {
    const response = await fetch(userSelfLink, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const userData: UserDetails = await response.json();
    return userData;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails utilisateur:",
      error
    );
    throw error;
  }
}

/**
 * Récupère les participants d'un événement avec leurs détails complets
 */
export async function fetchEventParticipantsWithDetails(
  eventSelfLink: string,
  token?: string
): Promise<UserDetails[]> {
  try {
    const participantsResponse = await fetchEventParticipants(
      eventSelfLink,
      token
    );

    if (!participantsResponse._embedded?.userSummaries) {
      return [];
    }

    // Récupérer les détails de chaque participant
    const participantDetailsPromises =
      participantsResponse._embedded.userSummaries.map((participant) => {
        if (participant._links?.self?.href) {
          return fetchUserDetails(participant._links.self.href, token);
        }
        // Fallback si pas de lien HATEOAS
        return Promise.resolve({
          id: participant.id,
          firstName: "",
          lastName: "",
          pseudo: participant.pseudo,
          email: "",
          imageUrl: participant.imageUrl,
        } as UserDetails);
      });

    const participantDetails = await Promise.all(participantDetailsPromises);
    return participantDetails;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des participants avec détails:",
      error
    );
    throw error;
  }
}
