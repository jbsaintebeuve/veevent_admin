"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Category {
  name: string;
  description: string;
  key: string;
  trending: boolean;
}

interface ApiResponse {
  _embedded: {
    categories: Category[];
  };
  _links: any;
  page: any;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("http://localhost:8090/categories");
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
  const data: ApiResponse = await res.json();
  return data._embedded?.categories || [];
}

export default function CategoriesPage() {
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const queryClient = useQueryClient();
  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: async (key: string) => {
      const res = await fetch(`http://localhost:8090/categories/${key}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des catégories</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <Button asChild>
          <Link href="/categories/create">Créer une catégorie</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Clé</TableHead>
              <TableHead>Tendance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((category) => (
              <TableRow key={category.key}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.key}</TableCell>
                <TableCell>
                  <Badge variant={category.trending ? "default" : "secondary"}>
                    {category.trending ? "Tendance" : "Standard"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/categories/${category.key}/edit`}>Modifier</Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteCategory(category.key)}
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