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

interface City {
  id: number;
  name: string;
  region?: string;
  country?: string;
}

async function fetchCities(): Promise<City[]> {
  try {
    const res = await fetch("http://localhost:8090/cities");
    if (!res.ok) throw new Error("Erreur lors du chargement des villes");
    const data = await res.json();

    console.log("API Cities response:", data); // ✅ Debug

    // Adapter selon votre structure API
    return data._embedded?.cityResponses || data.cities || data || [];
  } catch (error) {
    console.error("Erreur fetch cities:", error);
    return [];
  }
}

export function CreatePlaceDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    type: "",
    latitude: "",
    longitude: "",
    cityId: "",
    cityName: "",
    bannerUrl: "",
    imageUrl: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data: cities, isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "cityId") {
      const selectedCity = cities?.find((city) => city.id.toString() === value);
      setForm({
        ...form,
        cityId: value,
        cityName: selectedCity?.name || "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Validation des champs requis
  const isFormValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.description.trim() !== "" &&
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
      description: "",
      address: "",
      type: "",
      latitude: "",
      longitude: "",
      cityId: "",
      cityName: "",
      bannerUrl: "",
      imageUrl: "",
      content: "",
    });
    setError("");
  };

  const validateForm = () => {
    const required = [
      "name",
      "description",
      "address",
      "type",
      "latitude",
      "longitude",
      "cityId",
    ];
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
      // ✅ Validation
      validateForm();

      // ✅ Payload conforme à l'API
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        type: form.type,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        cityName: form.cityName,
        cityId: parseInt(form.cityId),
        bannerUrl: form.bannerUrl.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        content: form.content.trim() || null,
      };

      console.log("Payload envoyé:", payload); // ✅ Debug

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
        console.error("Erreur API:", errorText);
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      console.log("Lieu créé:", result);

      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu créé avec succès !");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Erreur complète:", err);
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un nouveau lieu</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lieu pour vos événements. Tous les champs
              marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nom et Type */}
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Musée">Musée</SelectItem>
                    <SelectItem value="Salle de concert">
                      Salle de concert
                    </SelectItem>
                    <SelectItem value="Stade">Stade</SelectItem>
                    <SelectItem value="Théâtre">Théâtre</SelectItem>
                    <SelectItem value="Centre de congrès">
                      Centre de congrès
                    </SelectItem>
                    <SelectItem value="Parc">Parc</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description courte *</Label>
              <Input
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Un lieu prestigieux pour vos événements"
                required
                disabled={loading}
              />
            </div>

            {/* Ville */}
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
                  {cities?.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Adresse */}
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

            {/* Coordonnées GPS */}
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
                  placeholder="43.5508"
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
                  placeholder="7.0174"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image principale</Label>
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
                <Label htmlFor="bannerUrl">Bannière</Label>
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

            {/* Description détaillée */}
            <div className="grid gap-2">
              <Label htmlFor="content">Description détaillée</Label>
              <Textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={3}
                placeholder="Informations complémentaires sur le lieu..."
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
