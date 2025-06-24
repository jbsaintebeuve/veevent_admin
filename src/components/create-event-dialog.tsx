"use client";

import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plus, Loader2, AlertCircle } from "lucide-react";

// Types pour les entités liées
interface City {
  id: number;
  name: string;
}
interface Place {
  id: number;
  name: string;
}
interface Category {
  key: string;
  name: string;
}
interface User {
  id: number;
  pseudo: string;
}

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

export function CreateEventDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
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
  const queryClient = useQueryClient();

  // Récupération des données liées
  const { data: cities } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });
  const { data: places } = useQuery<Place[]>({
    queryKey: ["places"],
    queryFn: fetchPlaces,
  });
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: users } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleCategoryChange = (categoryKey: string, checked: boolean) => {
    if (checked) {
      setForm({ ...form, categories: [...form.categories, categoryKey] });
    } else {
      setForm({
        ...form,
        categories: form.categories.filter((cat) => cat !== categoryKey),
      });
    }
  };

  const resetForm = () => {
    setForm({
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
      categories: [],
    });
    setError("");
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
          imageUrl: form.imageUrl || null,
          status: form.status,
          isTrending: form.isTrending,
          isFirstEdition: form.isFirstEdition,
          cityId: form.cityId ? parseInt(form.cityId, 10) : undefined,
          placeId: form.placeId ? parseInt(form.placeId, 10) : undefined,
          organizerId: form.organizerId
            ? parseInt(form.organizerId, 10)
            : undefined,
          categories: form.categories,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création de l'événement");

      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement créé avec succès !");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogTrigger asChild>
          {children || (
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Créer un événement
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel événement</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel événement. Les champs marqués d'un * sont
              obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Nom */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'événement *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Concert, Conférence, Festival..."
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Décrivez votre événement..."
                disabled={loading}
              />
            </div>

            {/* Date/Heure et Prix */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date et heure *</Label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="25.50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Participants max et Image */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxCustomers">Participants maximum *</Label>
                <Input
                  id="maxCustomers"
                  name="maxCustomers"
                  type="number"
                  min="1"
                  value={form.maxCustomers}
                  onChange={handleChange}
                  placeholder="100, 500, 1000..."
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image (URL)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://exemple.com/image.jpg"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Ville et Lieu */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cityId">Ville *</Label>
                <Select
                  value={form.cityId}
                  onValueChange={(value) => handleSelectChange("cityId", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="placeId">Lieu *</Label>
                <Select
                  value={form.placeId}
                  onValueChange={(value) =>
                    handleSelectChange("placeId", value)
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un lieu" />
                  </SelectTrigger>
                  <SelectContent>
                    {places?.map((place) => (
                      <SelectItem key={place.id} value={place.id.toString()}>
                        {place.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Organisateur */}
            <div className="grid gap-2">
              <Label htmlFor="organizerId">Organisateur *</Label>
              <Select
                value={form.organizerId}
                onValueChange={(value) =>
                  handleSelectChange("organizerId", value)
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un organisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.pseudo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Catégories */}
            <div className="grid gap-2">
              <Label>Catégories *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {categories?.map((category) => (
                  <div
                    key={category.key}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={category.key}
                      checked={form.categories.includes(category.key)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.key, checked as boolean)
                      }
                      disabled={loading}
                    />
                    <Label
                      htmlFor={category.key}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Sélectionnez au moins une catégorie
              </p>
            </div>

            {/* Options et Statut */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTrending"
                  checked={form.isTrending}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isTrending: checked as boolean })
                  }
                  disabled={loading}
                />
                <Label htmlFor="isTrending" className="text-sm font-normal">
                  Tendance
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFirstEdition"
                  checked={form.isFirstEdition}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isFirstEdition: checked as boolean })
                  }
                  disabled={loading}
                />
                <Label htmlFor="isFirstEdition" className="text-sm font-normal">
                  Première édition
                </Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Statut *</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">À venir</SelectItem>
                    <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                    <SelectItem value="FINISHED">Terminé</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={loading || form.categories.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer l'événement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
