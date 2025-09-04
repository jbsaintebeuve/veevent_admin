"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Edit, MapPin, Globe } from "lucide-react";
import { City, CityUpdateRequest } from "@/types/city";
import { modifyCity, fetchCities } from "@/services/city-service";
import { useAuth } from "@/hooks/use-auth";
import { Checkbox } from "@/components/ui/checkbox";
import { useMultipleImages } from "@/hooks/use-image-upload";
import { ImageUpload } from "@/components/ui/image-upload";

interface ModifyCityDialogProps {
  city: City | null;
  cities: City[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModifyCityDialog({
  city,
  cities,
  open,
  onOpenChange,
}: ModifyCityDialogProps) {
  const [form, setForm] = useState({
    name: "",
    location: {
      latitude: null as number | null,
      longitude: null as number | null,
    },
    region: "",
    postalCode: "",
    country: "France",
    bannerUrl: "",
    imageUrl: "",
    content: "",
    nearestCities: [] as number[],
  });
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const imageUploads = useMultipleImages(
    city?.bannerUrl || "",
    city?.imageUrl || ""
  );

  const { data: allCitiesResponse, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities", "all"],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchCities(token, 0, 50);
    },
    retry: 2,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Token manquant");
      const patchUrl = city?._links?.self?.href;
      if (!patchUrl) throw new Error("Lien de modification HAL manquant");

      const { bannerUrl, imageUrl } = await imageUploads.uploadAll();

      const payload = {
        name: form.name.trim(),
        latitude: form.location.latitude,
        longitude: form.location.longitude,
        region: form.region.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
        bannerUrl: bannerUrl?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        content: form.content?.trim() || null,
        nearestCityIds: form.nearestCities,
      } as CityUpdateRequest;

      await modifyCity(patchUrl, payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("Ville modifiée avec succès !");
      setTimeout(() => onOpenChange(false), 300);
    },
    onError: (err: any) => {
      toast.error(`Erreur lors de la modification de la ville`);
    },
  });

  const allCities = allCitiesResponse?._embedded?.cityResponses || [];

  useEffect(() => {
    if (city) {
      setForm({
        name: city.name || "",
        location: {
          latitude: city.location?.latitude ?? null,
          longitude: city.location?.longitude ?? null,
        },
        region: city.region || "",
        postalCode: city.postalCode || "",
        country: city.country || "France",
        bannerUrl: city.bannerUrl || "",
        imageUrl: city.imageUrl || "",
        content: city.content || "",
        nearestCities: city.nearestCities || [],
      });
    }
  }, [city]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "latitude" || name === "longitude") {
      setForm({
        ...form,
        location: {
          ...form.location,
          [name]: value === "" ? null : parseFloat(value),
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const isFormValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.region.trim() !== "" &&
      form.postalCode.trim() !== "" &&
      form.country.trim() !== "" &&
      form.location.latitude !== null &&
      form.location.longitude !== null
    );
  }, [form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const resetToInitialState = useCallback(() => {
    if (city) {
      setForm({
        name: city.name || "",
        location: {
          latitude: city.location?.latitude ?? null,
          longitude: city.location?.longitude ?? null,
        },
        region: city.region || "",
        postalCode: city.postalCode || "",
        country: city.country || "France",
        bannerUrl: city.bannerUrl || "",
        imageUrl: city.imageUrl || "",
        content: city.content || "",
        nearestCities: city.nearestCities || [],
      });
      imageUploads.resetAll(city.bannerUrl || "", city.imageUrl || "");
    }
  }, [city]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetToInitialState();
    }
  };

  if (!city) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier la ville</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la ville "{city.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  <MapPin className="inline mr-1 h-4 w-4" />
                  Nom de la ville *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Menton, Nice, Cannes..."
                  required
                  disabled={mutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">
                  <Globe className="inline mr-1 h-4 w-4" />
                  Région *
                </Label>
                <Input
                  id="region"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="Provence Alpes Côte d'azur"
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Pays *</Label>
                <Input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="France"
                  required
                  disabled={mutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Code postal *</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  placeholder="06500"
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  value={form.location.latitude ?? ""}
                  onChange={handleChange}
                  placeholder="43.7"
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
                  value={form.location.longitude ?? ""}
                  onChange={handleChange}
                  placeholder="7.25"
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
                currentImageUrl={imageUploads.banner.currentUrl}
                onFileChange={imageUploads.banner.handleFileChange}
                onRemove={imageUploads.banner.handleRemove}
                disabled={mutation.isPending}
              />
              <ImageUpload
                id="imageFile"
                label="Image principale"
                file={imageUploads.image.file}
                previewUrl={imageUploads.image.previewUrl}
                currentImageUrl={imageUploads.image.currentUrl}
                onFileChange={imageUploads.image.handleFileChange}
                onRemove={imageUploads.image.handleRemove}
                disabled={mutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Description longue</Label>
              <Textarea
                id="content"
                name="content"
                value={form.content ?? ""}
                onChange={handleChange}
                rows={3}
                placeholder="Description détaillée de la ville"
                disabled={mutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label>Villes proches</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {citiesLoading ? (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Chargement...
                  </p>
                ) : allCities.filter((c) => c.id !== city.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Aucune ville disponible
                  </p>
                ) : (
                  allCities
                    .filter((c) => c.id !== city.id)
                    .map((cityItem) => (
                      <div
                        key={cityItem.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`nearestCity-${cityItem.id}`}
                          checked={form.nearestCities.includes(cityItem.id)}
                          onCheckedChange={(checked: boolean) => {
                            setForm((prev) => ({
                              ...prev,
                              nearestCities: checked
                                ? [...prev.nearestCities, cityItem.id]
                                : prev.nearestCities.filter(
                                    (id) => id !== cityItem.id
                                  ),
                            }));
                          }}
                          disabled={mutation.isPending}
                        />
                        <Label
                          htmlFor={`nearestCity-${cityItem.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {cityItem.name}
                        </Label>
                      </div>
                    ))
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Sélectionnez une ou plusieurs villes proches
              </span>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={mutation.isPending}>
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isFormValid || mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
