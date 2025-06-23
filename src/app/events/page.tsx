"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
  address: string;
  maxCustomers: number;
  isTrending: boolean;
  isFirstEdition: boolean;
  price: number;
  status: string;
  imageUrl: string;
  currentParticipants: number;
  cityName: string;
  placeName: string;
  categories: Array<{ name: string; key: string }>;
  organizer: {
    pseudo: string;
    lastName: string;
    firstName: string;
    imageUrl: string | null;
    note: number | null;
  };
}

interface ApiResponse {
  _embedded: {
    eventSummaryResponses: Event[];
  };
  _links: any;
  page: any;
}

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch("http://localhost:8090/events");
  if (!res.ok) throw new Error("Erreur lors du chargement des événements");
  const data: ApiResponse = await res.json();
  return data._embedded?.eventSummaryResponses || [];
}

export default function EventsPage() {
  const { data, isLoading, error } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
  const queryClient = useQueryClient();
  const { mutate: deleteEvent, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:8090/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des événements</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Événements</h1>
        <Button asChild>
          <Link href="/events/create">Créer un événement</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Organisateur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>{event.placeName}</TableCell>
                <TableCell>{event.cityName}</TableCell>
                <TableCell>{event.organizer.pseudo}</TableCell>
                <TableCell>
                  <Badge variant={event.status === 'NOT_STARTED' ? 'default' : 'secondary'}>
                    {event.status === 'NOT_STARTED' ? 'Non commencé' : event.status}
                  </Badge>
                </TableCell>
                <TableCell>{event.price}€</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${event.id}/edit`}>Modifier</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${event.id}/participants`}>Participants</Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteEvent(event.id)}
                      disabled={isDeleting}
                    >
                      Supprimer
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 