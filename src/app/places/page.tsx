"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Place {
  id: number;
  name: string;
  address: string;
  cityName: string;
  eventsCount: number;
  eventsPastCount: number;
}

interface ApiResponse {
  _embedded: {
    placeResponses: Place[];
  };
  _links: any;
  page: any;
}

async function fetchPlaces(): Promise<Place[]> {
  const res = await fetch("http://localhost:8090/places");
  if (!res.ok) throw new Error("Erreur lors du chargement des lieux");
  const data: ApiResponse = await res.json();
  return data._embedded?.placeResponses || [];
}

export default function PlacesPage() {
  const { data, isLoading, error } = useQuery<Place[]>({
    queryKey: ["places"],
    queryFn: fetchPlaces,
  });

  const queryClient = useQueryClient();
  const { mutate: deletePlace, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:8090/places/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
    },
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des lieux</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Lieux</h1>
        <Button asChild>
          <Link href="/places/create">Créer un lieu</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Événements</TableHead>
              <TableHead>Événements passés</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((place) => (
              <TableRow key={place.id}>
                <TableCell className="font-medium">{place.name}</TableCell>
                <TableCell>{place.address}</TableCell>
                <TableCell>{place.cityName}</TableCell>
                <TableCell>{place.eventsCount}</TableCell>
                <TableCell>{place.eventsPastCount}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/places/${place.id}/edit`}>Modifier</Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deletePlace(place.id)}
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