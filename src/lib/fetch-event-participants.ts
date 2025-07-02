import { EventParticipant, EventParticipantsApiResponse } from "@/types/event";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Récupérer les détails complets d'un utilisateur via son lien HATEOAS
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

// Récupérer les participants avec leurs détails complets
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
