import { useState, useEffect } from "react";
import { EventParticipant } from "@/types/event";
import { useEventParticipants } from "@/hooks/use-event-participants";
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
  const { participants, totalElements, isLoading, error, refresh } =
    useEventParticipants({
      eventSelfLink,
      autoLoad: isOpen,
    });

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
              <AlertDescription>{error}</AlertDescription>
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
