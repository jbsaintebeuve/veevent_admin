import { useState, useEffect, useCallback } from "react";
import { EventParticipant } from "@/types/event";
import { fetchEventParticipants } from "@/lib/fetch-event-participants";

interface UseEventParticipantsOptions {
  eventSelfLink?: string;
  autoLoad?: boolean;
}

interface UseEventParticipantsReturn {
  participants: EventParticipant[];
  totalElements: number;
  isLoading: boolean;
  error: string | null;
  loadParticipants: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useEventParticipants({
  eventSelfLink,
  autoLoad = true,
}: UseEventParticipantsOptions): UseEventParticipantsReturn {
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer le token depuis les cookies
  const getToken = useCallback(() => {
    try {
      if (typeof document === "undefined") return null;
      return (
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || null
      );
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du token:", error);
      return null;
    }
  }, []);

  const loadParticipants = useCallback(async () => {
    if (!eventSelfLink) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetchEventParticipants(
        eventSelfLink,
        token || undefined
      );

      if (response._embedded?.userSummaries) {
        setParticipants(response._embedded.userSummaries);
        setTotalElements(response._embedded.userSummaries.length);
      } else {
        setParticipants([]);
        setTotalElements(0);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      setParticipants([]);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [eventSelfLink, getToken]);

  const refresh = useCallback(async () => {
    await loadParticipants();
  }, [loadParticipants]);

  // Charger automatiquement les participants si autoLoad est true
  useEffect(() => {
    if (autoLoad && eventSelfLink) {
      loadParticipants();
    }
  }, [autoLoad, eventSelfLink, loadParticipants]);

  return {
    participants,
    totalElements,
    isLoading,
    error,
    loadParticipants,
    refresh,
  };
}
