import { TicketVerificationRequest, TicketVerificationResponse } from "@/types/ticket";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function verifyTicket(
  verificationKey: string,
  token?: string,
  currentUser?: any
): Promise<TicketVerificationResponse> {
  try {
    // 1. Parser la clé de vérification
    const parsed = parseVerificationKey(verificationKey);
    if (!parsed) {
      throw new Error("Format de clé de vérification invalide. Format attendu: VV-{eventId}-{orderId}-{ticketId}");
    }

    const { eventId, orderId, ticketId } = parsed;

    // 2. Vérifier l'existence de l'événement
    const eventResponse = await fetch(`${API_URL}/events/${eventId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!eventResponse.ok) {
      if (eventResponse.status === 404) {
        throw new Error("Événement non trouvé");
      }
      throw new Error(`Erreur lors de la récupération de l'événement: ${eventResponse.status}`);
    }

    const event = await eventResponse.json();

    // 3. Vérifier les permissions si l'utilisateur est un organisateur
    if (currentUser && currentUser.role?.toLowerCase() === "organizer") {
      // Récupérer les événements de l'organisateur
      const userEventsResponse = await fetch(currentUser._links.events.href, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (userEventsResponse.ok) {
        const userEvents = await userEventsResponse.json();
        const userEventIds = userEvents._embedded?.eventSummaryResponses?.map((e: any) => e.id) || [];
        
        if (!userEventIds.includes(eventId)) {
          throw new Error("Vous ne pouvez vérifier que les tickets de vos événements");
        }
      }
    }

    // 4. Vérifier l'existence de la commande
    const orderResponse = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!orderResponse.ok) {
      if (orderResponse.status === 404) {
        throw new Error("Commande non trouvée");
      }
      throw new Error(`Erreur lors de la récupération de la commande: ${orderResponse.status}`);
    }

    const order = await orderResponse.json();

    // 5. Vérifier que la commande appartient à l'événement
    if (order.events?.href && !order.events.href.includes(`/events/${eventId}`)) {
      throw new Error("La commande n'appartient pas à cet événement");
    }

    // 6. Vérifier l'existence du ticket dans la commande
    const ticket = order.tickets?.find((t: any) => t.id === ticketId);
    if (!ticket) {
      throw new Error("Ticket non trouvé dans la commande");
    }

    // 7. Récupérer l'utilisateur de la commande
    const userResponse = await fetch(order._links.users.href, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${userResponse.status}`);
    }

    const user = await userResponse.json();

    // 8. Vérifier que l'utilisateur est inscrit à l'événement
    const participantsResponse = await fetch(`${API_URL}/events/${eventId}/participants`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!participantsResponse.ok) {
      throw new Error(`Erreur lors de la récupération des participants: ${participantsResponse.status}`);
    }

    const participants = await participantsResponse.json();
    const isUserRegistered = participants._embedded?.userSummaries?.some(
      (participant: any) => participant.id === user.id
    );

    if (!isUserRegistered) {
      throw new Error("L'utilisateur n'est pas inscrit à cet événement");
    }

    // 9. Vérifier le statut de l'événement
    if (event.status === "CANCELLED") {
      throw new Error("L'événement a été annulé");
    }

    // 10. Vérifier le statut de la commande
    if (order.status === "CANCELLED") {
      throw new Error("La commande a été annulée");
    }

    // Si toutes les vérifications passent, le ticket est valide
    return {
      isValid: true,
      ticket: {
        id: ticketId,
        orderId: orderId,
        eventId: eventId,
        userId: user.id,
        status: "VALID",
        verificationKey: verificationKey,
        createdAt: order.createdAt || new Date().toISOString(),
      },
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        status: event.status,
      },
      user: {
        id: user.id,
        firstName: user.firstName || ticket.name,
        lastName: user.lastName || ticket.lastName,
        pseudo: user.pseudo,
      },
      order: {
        id: order.id,
        status: order.status,
      },
    };

  } catch (error: any) {
    console.error("Erreur lors de la vérification du ticket:", error);
    return {
      isValid: false,
      error: error.message,
    };
  }
}

export function parseVerificationKey(verificationKey: string): {
  eventId: number;
  orderId: number;
  ticketId: number;
} | null {
  // Format attendu: VV-{eventId}-{orderId}-{ticketId}
  const pattern = /^VV-(\d+)-(\d+)-(\d+)$/;
  const match = verificationKey.match(pattern);
  
  if (!match) {
    return null;
  }

  return {
    eventId: parseInt(match[1], 10),
    orderId: parseInt(match[2], 10),
    ticketId: parseInt(match[3], 10),
  };
} 