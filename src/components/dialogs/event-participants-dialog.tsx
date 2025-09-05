import { useQuery } from "@tanstack/react-query";
import { EventParticipantsApiResponse, Event } from "@/types/event";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventParticipantsTable } from "@/components/tables/event-participants-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";

interface EventParticipantsDialogProps {
  event?: Event | null;
  eventSelfLink?: string;
  eventName?: string;
  open?: boolean;
  isOpen?: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function EventParticipantsDialog({
  event,
  eventSelfLink,
  eventName,
  open,
  isOpen,
  onOpenChange,
  children,
}: EventParticipantsDialogProps) {
  const dialogOpen = open ?? isOpen ?? false;
  const selfLink = eventSelfLink ?? event?._links?.self?.href;
  const name = eventName ?? event?.name ?? "Événement inconnu";
  const { token } = useAuth();

  const {
    data: participantsResponse,
    isLoading,
    error,
  } = useQuery<EventParticipantsApiResponse>({
    queryKey: ["event-participants", selfLink],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchEventParticipants(selfLink!, token);
    },
    enabled: dialogOpen && !!selfLink,
  });

  const participants = participantsResponse?._embedded?.userSummaries || [];
  const totalElements = participants.length;

  if (children) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
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
              {name} • {totalElements} participant
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

            {!selfLink && (
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

  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
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
            {name} • {totalElements} participant
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

          {!selfLink && (
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
