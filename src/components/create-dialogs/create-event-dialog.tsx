"use client";

import { useState, useCallback, useMemo, memo } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import { Plus, Loader2, AlertCircle, MapPin } from "lucide-react";
import { fetchCategories } from "@/lib/fetch-categories";

interface City {
  id: number;
  name: string;
}
interface Place {
  id: number;
  name: string;
  type?: string;
}
interface Category {
  key: string;
  name: string;
  trending?: boolean;
}

// ✅ Fonctions fetch corrigées pour être plus robustes
const fetchCities = async (): Promise<City[]> => {
  try {
    const res = await fetch("http://localhost:8090/cities");
    if (!res.ok) throw new Error("Erreur lors du chargement des villes");
    const data = await res.json();

    console.log("Cities API response:", data); // Debug

    // ✅ Adaptation selon votre structure API
    if (data._embedded?.cityResponses) {
      return data._embedded.cityResponses;
    }
    if (Array.isArray(data)) {
      return data;
    }
    if (data.cities && Array.isArray(data.cities)) {
      return data.cities;
    }

    console.warn("Format de données cities inattendu:", data);
    return [];
  } catch (error) {
    console.error("Erreur fetch cities:", error);
    return [];
  }
};

const fetchPlacesByCity = async (cityId: string): Promise<Place[]> => {
  if (!cityId) return [];

  try {
    const res = await fetch(`http://localhost:8090/cities/${cityId}/places`);
    if (!res.ok) throw new Error("Erreur lors du chargement des lieux");
    const data = await res.json();

    console.log(`Places for city ${cityId}:`, data); // Debug

    // ✅ Adaptation selon votre structure API
    if (data._embedded?.placeResponses) {
      return data._embedded.placeResponses;
    }
    if (Array.isArray(data)) {
      return data;
    }
    if (data.places && Array.isArray(data.places)) {
      return data.places;
    }

    return [];
  } catch (error) {
    console.error(`Erreur fetch places for city ${cityId}:`, error);
    return [];
  }
};

const initialForm = {
  name: "",
  description: "",
  date: "",
  address: "",
  price: "",
  maxCustomers: "",
  imageUrl: "",
  contentHtml: "",
  status: "NOT_STARTED",
  isTrending: false,
  cityId: "",
  placeId: "",
  categoryKeys: [] as string[],
};

// ✅ Composant InputField séparé et mémorisé
const InputField = memo(
  ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    value,
    onChange,
    disabled,
    ...props
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    [key: string]: any;
  }) => (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...props}
      />
    </div>
  )
);

// ✅ Composant Select mémorisé
const MemoizedSelect = memo(
  ({
    value,
    onValueChange,
    disabled,
    placeholder,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    disabled: boolean;
    placeholder: string;
    children: React.ReactNode;
  }) => (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
);

export function CreateEventDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  const queryClient = useQueryClient();

  // ✅ Requêtes avec gestion d'erreur améliorée
  const {
    data: cities,
    isLoading: citiesLoading,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
    retry: 2,
    retryDelay: 1000,
    enabled: open,
  });

  const { data: places, isLoading: placesLoading } = useQuery({
    queryKey: ["places", form.cityId],
    queryFn: () => fetchPlacesByCity(form.cityId),
    enabled: !!form.cityId && open,
    retry: 2,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    retry: 2,
    enabled: open,
  });

  // ✅ Debug des données reçues
  console.log("Cities data:", cities, "Is array:", Array.isArray(cities));
  console.log("Places data:", places, "Is array:", Array.isArray(places));
  console.log(
    "Categories data:",
    categories,
    "Is array:",
    Array.isArray(categories)
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type, checked } = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleCityChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, cityId: value, placeId: "" }));
  }, []);

  const handlePlaceChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, placeId: value }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, status: value }));
  }, []);

  const handleCategoryChange = useCallback((key: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      categoryKeys: checked
        ? [...prev.categoryKeys, key]
        : prev.categoryKeys.filter((k) => k !== key),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setError("");
  }, []);

  const validateForm = useCallback(() => {
    const required = [
      "name",
      "description",
      "date",
      "address",
      "price",
      "maxCustomers",
      "cityId",
      "placeId",
    ];
    const missing = required.find((field) => !form[field as keyof typeof form]);
    if (missing) throw new Error(`Le champ ${missing} est requis`);
    if (!form.categoryKeys.length)
      throw new Error("Au moins une catégorie est requise");

    const price = parseFloat(form.price);
    const maxCustomers = parseInt(form.maxCustomers);
    if (isNaN(price) || price < 0) throw new Error("Prix invalide");
    if (isNaN(maxCustomers) || maxCustomers <= 0)
      throw new Error("Capacité invalide");
    if (new Date(form.date) <= new Date()) throw new Error("Date invalide");
  }, [form]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
        validateForm();

        const payload = {
          date: new Date(form.date).toISOString().slice(0, 19),
          description: form.description,
          name: form.name,
          address: form.address,
          price: parseFloat(form.price),
          maxCustomers: parseInt(form.maxCustomers, 10),
          isTrending: form.isTrending,
          status: form.status,
          imageUrl: form.imageUrl || null,
          contentHtml: form.contentHtml || null,
          placeId: parseInt(form.placeId, 10),
          cityId: parseInt(form.cityId, 10),
          categoryKeys: form.categoryKeys,
        };

        const res = await fetch("http://localhost:8090/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(document.cookie.includes("token=") && {
              Authorization: `Bearer ${
                document.cookie.split("token=")[1]?.split(";")[0]
              }`,
            }),
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorText = await res.text();
          const statusErrors = {
            401: "Token expiré. Reconnectez-vous.",
            403: "Permissions insuffisantes.",
            400: "Données invalides.",
          };
          throw new Error(
            statusErrors[res.status as keyof typeof statusErrors] ||
              `Erreur ${res.status}`
          );
        }

        queryClient.invalidateQueries({ queryKey: ["events"] });
        toast.success("Événement créé avec succès !");
        setOpen(false);
        resetForm();
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [form, validateForm, queryClient, resetForm]
  );

  const statusOptions = useMemo(
    () => [
      ["NOT_STARTED", "À venir"],
      ["IN_PROGRESS", "En cours"],
      ["FINISHED", "Terminé"],
      ["CANCELLED", "Annulé"],
    ],
    []
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        !newOpen && resetForm();
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Créer un événement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un nouvel événement</DialogTitle>
            <DialogDescription>
              Les champs marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <InputField
              label="Nom de l'événement"
              name="name"
              placeholder="Concert sous les étoiles"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <InputField
              label="Description"
              name="description"
              placeholder="Une soirée exceptionnelle..."
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Date et heure"
                name="date"
                type="datetime-local"
                value={form.date}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <InputField
                label="Prix (€)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="20.00"
                value={form.price}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <InputField
              label="Adresse"
              name="address"
              placeholder="Parc Central, Avenue des Arts"
              value={form.address}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Participants maximum"
                name="maxCustomers"
                type="number"
                min="1"
                placeholder="250"
                value={form.maxCustomers}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <InputField
                label="Image (URL)"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ville *</Label>
                <MemoizedSelect
                  value={form.cityId}
                  onValueChange={handleCityChange}
                  disabled={loading || citiesLoading}
                  placeholder={
                    citiesLoading ? "Chargement..." : "Sélectionner une ville"
                  }
                >
                  {/* ✅ Vérification que cities est bien un tableau */}
                  {Array.isArray(cities) && cities.length > 0 ? (
                    cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {city.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-cities-available" disabled>
                      {citiesLoading
                        ? "Chargement..."
                        : "Aucune ville disponible"}
                    </SelectItem>
                  )}
                </MemoizedSelect>
                {citiesError && (
                  <p className="text-xs text-destructive">
                    Erreur lors du chargement des villes
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Lieu *</Label>
                <MemoizedSelect
                  value={form.placeId}
                  onValueChange={handlePlaceChange}
                  disabled={loading || !form.cityId || placesLoading}
                  placeholder={
                    !form.cityId
                      ? "Sélectionnez d'abord une ville"
                      : placesLoading
                      ? "Chargement..."
                      : "Sélectionner un lieu"
                  }
                >
                  {/* ✅ Vérification que places est bien un tableau */}
                  {Array.isArray(places) && places.length > 0 ? (
                    places.map((place) => (
                      <SelectItem key={place.id} value={place.id.toString()}>
                        <div>
                          <div className="font-medium">{place.name}</div>
                          {place.type && (
                            <div className="text-xs text-muted-foreground">
                              {place.type}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-places-available" disabled>
                      {!form.cityId
                        ? "Sélectionnez une ville"
                        : placesLoading
                        ? "Chargement..."
                        : "Aucun lieu disponible"}
                    </SelectItem>
                  )}
                </MemoizedSelect>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contentHtml">Description détaillée (HTML)</Label>
              <Textarea
                id="contentHtml"
                name="contentHtml"
                value={form.contentHtml}
                onChange={handleChange}
                rows={3}
                placeholder="<p>Rejoignez-nous...</p>"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label>Catégories *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {categoriesLoading ? (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Chargement...
                  </p>
                ) : Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((cat, i) => (
                    <div
                      key={`${cat.key}-${i}`}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${cat.key}-${i}`}
                        checked={form.categoryKeys.includes(cat.key)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(cat.key, checked as boolean)
                        }
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`${cat.key}-${i}`}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        {cat.name}
                        {cat.trending && (
                          <Badge variant="secondary" className="text-xs">
                            Tendance
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Aucune catégorie disponible
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTrending"
                  checked={form.isTrending}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      isTrending: checked as boolean,
                    }))
                  }
                  disabled={loading}
                />
                <Label htmlFor="isTrending" className="text-sm">
                  Événement tendance
                </Label>
              </div>

              <div className="grid gap-2">
                <Label>Statut</Label>
                <MemoizedSelect
                  value={form.status}
                  onValueChange={handleStatusChange}
                  disabled={loading}
                  placeholder="Sélectionner un statut"
                >
                  {statusOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </MemoizedSelect>
              </div>
            </div>

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
              disabled={
                loading ||
                !form.categoryKeys.length ||
                !form.cityId ||
                !form.placeId
              }
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
