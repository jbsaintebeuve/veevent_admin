"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  lastName: string;
  firstName: string;
  pseudo: string;
  email: string;
  role: string;
}

interface ApiResponse {
  _embedded: {
    userResponses: User[];
  };
  _links: any;
  page: any;
}

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("http://localhost:8090/users");
  if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
  const data: ApiResponse = await res.json();
  return data._embedded?.userResponses || [];
}

export default function UsersPage() {
  const { data, isLoading, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  const queryClient = useQueryClient();
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:8090/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
  const [search, setSearch] = useState("");

  const filteredUsers = Array.isArray(data) ? data.filter(user =>
    user.lastName.toLowerCase().includes(search.toLowerCase()) ||
    user.firstName.toLowerCase().includes(search.toLowerCase()) ||
    user.pseudo.toLowerCase().includes(search.toLowerCase())
  ) : [];

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des utilisateurs</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <Button asChild>
          <Link href="/users/create">Créer un utilisateur</Link>
        </Button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom, prénom ou pseudo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md border p-2 rounded"
        />
      </div>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Pseudo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.lastName}</TableCell>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.pseudo}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/users/${user.id}/edit`}>Modifier</Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteUser(user.id)}
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