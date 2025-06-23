"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Participant {
  id: number;
  lastName: string;
  firstName: string;
  pseudo: string;
  email: string;
  status: string;
}

interface ApiResponse {
  _embedded: {
    participantSummaryResponses: Participant[];
  };
  _links: any;
  page: any;
}

async function fetchParticipants(eventId: string): Promise<Participant[]> {
  const res = await fetch(`http://localhost:8090/events/${eventId}/participants`);
  if (!res.ok) throw new Error("Erreur lors du chargement des participants");
  const data: ApiResponse = await res.json();
  return data._embedded?.participantSummaryResponses || [];
}

export default function ParticipantsPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Participant[]>({
    queryKey: ["participants", eventId],
    queryFn: () => fetchParticipants(eventId),
    enabled: !!eventId,
  });
  const { mutate: deleteParticipant, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:8090/events/${eventId}/participants/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] });
    },
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des participants</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Participants de l'événement</h1>
        <Button variant="outline" onClick={() => window.history.back()}>
          Retour
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Pseudo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">{participant.lastName}</TableCell>
                <TableCell>{participant.firstName}</TableCell>
                <TableCell>{participant.pseudo}</TableCell>
                <TableCell>{participant.email}</TableCell>
                <TableCell>
                  <Badge variant={participant.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                    {participant.status === 'CONFIRMED' ? 'Confirmé' : participant.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => deleteParticipant(participant.id)}
                    disabled={isDeleting}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 