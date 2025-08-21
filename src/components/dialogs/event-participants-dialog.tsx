import { useQuery } from "@tanstack/react-query";
import { EventParticipant, EventParticipantsApiResponse } from "@/types/event";
import { fetchEventParticipants } from "@/services/event-service";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventParticipantsTable } from "@/components/tables/event-participants-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";

interface EventParticipantsDialogProps {
  eventSelfLink?: string;
  eventName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventParticipantsDialog({
  eventSelfLink,
  eventName,
  isOpen,
  onOpenChange,
}: EventParticipantsDialogProps) {
  const { token } = useAuth();

  const {
    data: participantsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<EventParticipantsApiResponse>({
    queryKey: ["event-participants", eventSelfLink],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchEventParticipants(eventSelfLink!, token);
    },
    enabled: isOpen && !!eventSelfLink,
  });

  const participants = participantsResponse?._embedded?.userSummaries || [];
  const totalElements = participants.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <DialogTitle>Participants de l'événement</DialogTitle>
          </div>
          <DialogDescription>
            {eventName} • {totalElements} participant
            {totalElements !== 1 ? "s" : ""} inscrit
            {totalElements !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "Erreur lors du chargement des participants"}
              </AlertDescription>
            </Alert>
          )}

          {!eventSelfLink && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Impossible de charger les participants : lien de l'événement
                manquant
              </AlertDescription>
            </Alert>
          )}

          <EventParticipantsTable
            participants={participants}
            totalElements={totalElements}
            isLoading={isLoading}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
