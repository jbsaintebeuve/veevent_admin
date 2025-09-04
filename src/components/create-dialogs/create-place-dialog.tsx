"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { SelectItem } from "@/components/ui/select";
import { SelectScrollable } from "@/components/ui/select-scrollable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PlaceCreateRequest, placeTypes } from "@/types/place";
import { CitiesApiResponse } from "@/types/city";
import { fetchCities } from "@/services/city-service";
import { createPlace } from "@/services/place-service";
import { useMultipleImages } from "@/hooks/use-image-upload";
import { ImageUpload } from "@/components/ui/image-upload";

export function CreatePlaceDialog() {
  const [open, setOpen] = useState(false);
  const initialForm = {
    name: "",
    address: "",
    type: "",
    latitude: "",
    longitude: "",
    cityId: "",
    cityName: "",
    description: "",
    content: "",
  };
  const [form, setForm] = useState(initialForm);
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const imageUploads = useMultipleImages();

  const mutation = useMutation({
    mutationFn: async (payload: PlaceCreateRequest) => {
      if (!token) throw new Error("Token manquant");
      return createPlace(payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu créé avec succès !");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erreur lors de la création du lieu");
    },
  });

  const {
    data: citiesResponse,
    isLoading: citiesLoading,
    error: citiesError,
  } = useQuery<CitiesApiResponse>({
    queryKey: ["cities"],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchCities(token, 0, 50);
    },
    enabled: open,
  });

  const cities = citiesResponse?._embedded?.cityResponses || [];

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
    setForm(initialForm);
    imageUploads.resetAll();
  };

  const validateForm = () => {
    const required = [
      "name",
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let bannerUrl, imageUrl;
    ({ bannerUrl, imageUrl } = await imageUploads.uploadAll());

    const payload: PlaceCreateRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      address: form.address.trim(),
      cityName: form.cityName,
      cityId: parseInt(form.cityId),
      type: form.type || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      bannerUrl: bannerUrl,
      imageUrl: imageUrl,
      content: form.content.trim() || null,
    };
    mutation.mutate(payload);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-fit">
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
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type de lieu *</Label>
              <SelectScrollable
                value={form.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                disabled={mutation.isPending}
                placeholder="Choisir un type"
              >
                {placeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectScrollable>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cityId">Ville *</Label>
              <SelectScrollable
                value={form.cityId}
                onValueChange={(value) => handleSelectChange("cityId", value)}
                disabled={mutation.isPending || citiesLoading}
                placeholder={
                  citiesLoading ? "Chargement..." : "Choisir une ville"
                }
              >
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
              </SelectScrollable>
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
                disabled={mutation.isPending}
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
                  disabled={mutation.isPending}
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
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload
                id="bannerFile"
                label="Bannière"
                file={imageUploads.banner.file}
                previewUrl={imageUploads.banner.previewUrl}
                onFileChange={imageUploads.banner.handleFileChange}
                onRemove={imageUploads.banner.handleRemove}
                disabled={mutation.isPending}
              />
              <ImageUpload
                id="imageFile"
                label="Image principale"
                file={imageUploads.image.file}
                previewUrl={imageUploads.image.previewUrl}
                onFileChange={imageUploads.image.handleFileChange}
                onRemove={imageUploads.image.handleRemove}
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description courte</Label>
              <Input
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description courte du lieu"
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Description détaillée</Label>
              <Textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Description détaillée du lieu, équipements, accès..."
                rows={3}
                disabled={mutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={mutation.isPending}>
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending || !isFormValid}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
