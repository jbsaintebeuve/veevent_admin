"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plus, Loader2, AlertCircle } from "lucide-react";

import { PlaceCreateRequest } from "@/types/place";
import { City, CitiesApiResponse } from "@/types/city";
import { fetchCities } from "@/lib/fetch-cities";

export function CreatePlaceDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    type: "",
    latitude: "",
    longitude: "",
    cityId: "",
    cityName: "",
    bannerUrl: "",
    imageUrl: "",
    content: "", // ✅ Une seule description basée sur content
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const {
    data: cities,
    isLoading: citiesLoading,
    error: citiesError,
  } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
    retry: 2,
    retryDelay: 1000,
    enabled: open,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (
      value.startsWith("no-") ||
      value === "loading" ||
      value === "unavailable"
    ) {
      return;
    }

    if (name === "cityId") {
      const selectedCity = Array.isArray(cities)
        ? cities.find((city) => city.id.toString() === value)
        : null;
      setForm({
        ...form,
        cityId: value,
        cityName: selectedCity?.name || "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Validation mise à jour - plus de description obligatoire
  const isFormValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.address.trim() !== "" &&
      form.type.trim() !== "" &&
      form.latitude.trim() !== "" &&
      form.longitude.trim() !== "" &&
      form.cityId.trim() !== ""
    );
  }, [form]);

  const resetForm = () => {
    setForm({
      name: "",
      address: "",
      type: "",
      latitude: "",
      longitude: "",
      cityId: "",
      cityName: "",
      bannerUrl: "",
      imageUrl: "",
      content: "", // ✅ Une seule description
    });
    setError("");
  };

  const validateForm = () => {
    const required = [
      "name",
      "address",
      "type",
      "latitude",
      "longitude",
      "cityId",
    ]; // ✅ Plus de description obligatoire
    for (const field of required) {
      if (!form[field as keyof typeof form]) {
        throw new Error(`Le champ ${field} est requis`);
      }
    }

    // Validation GPS
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Les coordonnées GPS doivent être des nombres valides");
    }
    if (lat < -90 || lat > 90) {
      throw new Error("La latitude doit être entre -90 et 90");
    }
    if (lng < -180 || lng > 180) {
      throw new Error("La longitude doit être entre -180 et 180");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      validateForm();

      const payload: PlaceCreateRequest = {
        name: form.name.trim(),
        address: form.address.trim(),
        type: form.type,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        cityName: form.cityName,
        cityId: parseInt(form.cityId),
        bannerUrl: form.bannerUrl.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        content: form.content.trim() || null, // ✅ Une seule description
      };

      const res = await fetch("http://localhost:8090/places", {
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
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu créé avec succès !");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Créer un lieu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un nouveau lieu</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lieu pour vos événements. Les champs marqués
              d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du lieu *</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Palais des Festivals"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type de lieu *</Label>
              <Select
                value={form.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Théâtre">Théâtre</SelectItem>
                  <SelectItem value="Salle de concert">
                    Salle de concert
                  </SelectItem>
                  <SelectItem value="Centre de congrès">
                    Centre de congrès
                  </SelectItem>
                  <SelectItem value="Musée">Musée</SelectItem>
                  <SelectItem value="Galerie">Galerie</SelectItem>
                  <SelectItem value="Parc">Parc</SelectItem>
                  <SelectItem value="Stade">Stade</SelectItem>
                  <SelectItem value="Cinéma">Cinéma</SelectItem>
                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                  <SelectItem value="Hôtel">Hôtel</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cityId">Ville *</Label>
              <Select
                value={form.cityId}
                onValueChange={(value) => handleSelectChange("cityId", value)}
                disabled={loading || citiesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      citiesLoading ? "Chargement..." : "Choisir une ville"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(cities) && cities.length > 0 ? (
                    cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{city.name}</span>
                          {city.region && (
                            <span className="text-xs text-muted-foreground">
                              ({city.region})
                            </span>
                          )}
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
                </SelectContent>
              </Select>
              {citiesError && (
                <p className="text-xs text-destructive">
                  Erreur lors du chargement des villes
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="1 Boulevard de la Croisette, 06400 Cannes"
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="43.548346"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="7.017369"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image principale (URL)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://exemple.com/image.jpg"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bannerUrl">Bannière (URL)</Label>
                <Input
                  id="bannerUrl"
                  name="bannerUrl"
                  value={form.bannerUrl}
                  onChange={handleChange}
                  placeholder="https://exemple.com/banner.jpg"
                  disabled={loading}
                />
              </div>
            </div>

            {/* ✅ Une seule description basée sur content */}
            <div className="grid gap-2">
              <Label htmlFor="content">Description</Label>
              <Textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={4}
                placeholder="Description complète du lieu, équipements, historique..."
                disabled={loading}
              />
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
            <Button type="submit" disabled={loading || !isFormValid}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer le lieu
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
