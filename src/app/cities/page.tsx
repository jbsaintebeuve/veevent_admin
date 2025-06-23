"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface City {
  id: number;
  name: string;
  region: string;
  country: string;
  postalCode: string;
  eventsCount: number;
}

interface ApiResponse {
  _embedded: {
    cityResponses: City[];
  };
  _links: any;
  page: any;
}

async function fetchCities(): Promise<City[]> {
  const res = await fetch("http://localhost:8090/cities");
  if (!res.ok) throw new Error("Erreur lors du chargement des villes");
  const data: ApiResponse = await res.json();
  return data._embedded?.cityResponses || [];
}

export default function CitiesPage() {
  const { data, isLoading, error } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  const queryClient = useQueryClient();
  const { mutate: deleteCity, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:8090/cities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des villes</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Villes</h1>
        <Button asChild>
          <Link href="/cities/create">Créer une ville</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Région</TableHead>
              <TableHead>Pays</TableHead>
              <TableHead>Code postal</TableHead>
              <TableHead>Événements</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">{city.name}</TableCell>
                <TableCell>{city.region}</TableCell>
                <TableCell>{city.country}</TableCell>
                <TableCell>{city.postalCode}</TableCell>
                <TableCell>{city.eventsCount}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/cities/${city.id}/edit`}>Modifier</Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteCity(city.id)}
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