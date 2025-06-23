"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Types pour les entités liées
interface City { id: number; name: string; }
interface Place { id: number; name: string; }
interface Category { key: string; name: string; }
interface User { id: number; pseudo: string; }

// Interfaces pour les réponses API
interface CitiesApiResponse {
  _embedded: { cityResponses: City[] };
  _links: any;
  page: any;
}

interface PlacesApiResponse {
  _embedded: { placeResponses: Place[] };
  _links: any;
  page: any;
}

interface CategoriesApiResponse {
  _embedded: { categories: Category[] };
  _links: any;
  page: any;
}

interface UsersApiResponse {
  _embedded: { userResponses: User[] };
  _links: any;
  page: any;
}

// Fonctions de fetch
async function fetchCities(): Promise<City[]> {
  const res = await fetch("http://localhost:8090/cities");
  if (!res.ok) throw new Error("Erreur lors du chargement des villes");
  const data: CitiesApiResponse = await res.json();
  return data._embedded?.cityResponses || [];
}

async function fetchPlaces(): Promise<Place[]> {
  const res = await fetch("http://localhost:8090/places");
  if (!res.ok) throw new Error("Erreur lors du chargement des lieux");
  const data: PlacesApiResponse = await res.json();
  return data._embedded?.placeResponses || [];
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("http://localhost:8090/categories");
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
  const data: CategoriesApiResponse = await res.json();
  return data._embedded?.categories || [];
}

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("http://localhost:8090/users");
  if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
  const data: UsersApiResponse = await res.json();
  return data._embedded?.userResponses || [];
}

export default function CreateEventPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    price: "",
    maxCustomers: "",
    imageUrl: "",
    status: "NOT_STARTED",
    isTrending: false,
    isFirstEdition: false,
    cityId: "",
    placeId: "",
    organizerId: "",
    categories: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Récupération des données liées
  const { data: cities } = useQuery<City[]>({ queryKey: ["cities"], queryFn: fetchCities });
  const { data: places } = useQuery<Place[]>({ queryKey: ["places"], queryFn: fetchPlaces });
  const { data: categories } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: users } = useQuery<User[]>({ queryKey: ["users"], queryFn: fetchUsers });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, categories: selected });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8090/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          date: form.date,
          price: parseFloat(form.price),
          maxCustomers: parseInt(form.maxCustomers, 10),
          imageUrl: form.imageUrl,
          status: form.status,
          isTrending: form.isTrending,
          isFirstEdition: form.isFirstEdition,
          cityId: form.cityId ? parseInt(form.cityId, 10) : undefined,
          placeId: form.placeId ? parseInt(form.placeId, 10) : undefined,
          organizerId: form.organizerId ? parseInt(form.organizerId, 10) : undefined,
          categories: form.categories,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de l'événement");
      router.push("/events");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Créer un événement</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <Label htmlFor="name">Nom *</Label>
          <Input name="name" id="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea name="description" id="description" value={form.description} onChange={handleChange} rows={3} className="w-full border p-2 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="date">Date et heure *</Label>
            <Input name="date" id="date" value={form.date} onChange={handleChange} required type="datetime-local" />
          </div>
          <div className="flex-1">
            <Label htmlFor="price">Prix (€) *</Label>
            <Input name="price" id="price" value={form.price} onChange={handleChange} required type="number" min="0" step="any" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="maxCustomers">Participants max *</Label>
            <Input name="maxCustomers" id="maxCustomers" value={form.maxCustomers} onChange={handleChange} required type="number" min="1" />
          </div>
          <div className="flex-1">
            <Label htmlFor="imageUrl">Image (URL)</Label>
            <Input name="imageUrl" id="imageUrl" value={form.imageUrl} onChange={handleChange} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="cityId">Ville *</Label>
            <select name="cityId" id="cityId" value={form.cityId} onChange={handleChange} required className="w-full border p-2 rounded">
              <option value="">Sélectionner...</option>
              {cities?.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Label htmlFor="placeId">Lieu *</Label>
            <select name="placeId" id="placeId" value={form.placeId} onChange={handleChange} required className="w-full border p-2 rounded">
              <option value="">Sélectionner...</option>
              {places?.map(place => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="categories">Catégories *</Label>
          <select name="categories" id="categories" multiple value={form.categories} onChange={handleCategoryChange} required className="w-full border p-2 rounded h-32">
            {categories?.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="organizerId">Organisateur *</Label>
          <select name="organizerId" id="organizerId" value={form.organizerId} onChange={handleChange} required className="w-full border p-2 rounded">
            <option value="">Sélectionner...</option>
            {users?.map(user => (
              <option key={user.id} value={user.id}>{user.pseudo}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isTrending" checked={form.isTrending} onChange={handleChange} id="isTrending" />
            <Label htmlFor="isTrending">Tendance</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isFirstEdition" checked={form.isFirstEdition} onChange={handleChange} id="isFirstEdition" />
            <Label htmlFor="isFirstEdition">Première édition</Label>
          </div>
          <div className="flex-1">
            <Label htmlFor="status">Statut *</Label>
            <select name="status" id="status" value={form.status} onChange={handleChange} required className="w-full border p-2 rounded">
              <option value="NOT_STARTED">À venir</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="FINISHED">Terminé</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Création..." : "Créer l'événement"}
        </Button>
      </form>
    </div>
  );
} 