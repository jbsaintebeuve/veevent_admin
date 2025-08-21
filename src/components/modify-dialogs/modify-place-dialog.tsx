"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectItem } from "@/components/ui/select";
import { SelectScrollable } from "@/components/ui/select-scrollable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";
import { Place, PlaceUpdateRequest, placeTypes } from "@/types/place";
import { City, CitiesApiResponse } from "@/types/city";
import { fetchCities } from "@/services/city-service";
import { modifyPlace } from "@/services/place-service";
import { useAuth } from "@/hooks/use-auth";
import { ImageUpload } from "@/components/ui/image-upload";
import { useMultipleImages } from "@/hooks/use-image-upload";

interface ModifyPlaceDialogProps {
  place: Place | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModifyPlaceDialog({
  place,
  open,
  onOpenChange,
}: ModifyPlaceDialogProps) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    type: "",
    location: {
      latitude: null as number | null,
      longitude: null as number | null,
    },
    cityId: "",
    cityName: "",
    content: "",
    description: "",
  });
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const images = useMultipleImages(
    place?.bannerUrl || "",
    place?.imageUrl || ""
  );

  const { data: citiesResponse, isLoading: citiesLoading } =
    useQuery<CitiesApiResponse>({
      queryKey: ["cities"],
      queryFn: () => {
        if (!token) throw new Error("Token manquant");
        return fetchCities(token, 0, 50);
      },
      enabled: open,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });
  const cities = citiesResponse?._embedded?.cityResponses || [];

  const findCityIdByName = (cityName: string): string => {
    if (!cities || !cityName) return "";
    const city = cities.find(
      (c: City) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    return city ? city.id.toString() : "";
  };

  useEffect(() => {
    if (place && cities.length > 0) {
      setForm({
        name: place.name || "",
        address: place.address || "",
        type: place.type || "",
        location: {
          latitude: place.location?.latitude ?? null,
          longitude: place.location?.longitude ?? null,
        },
        cityId: findCityIdByName(place.cityName),
        cityName: place.cityName || "",
        content: place.content || "",
        description: place.description || "",
      });
      images.resetAll(place.bannerUrl || "", place.imageUrl || "");
    }
  }, [place, cities.length]);

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

  const handleSelectChange = (name: string, value: string) => {
    if (name === "cityId") {
      const selectedCity = cities?.find(
        (city: City) => city.id.toString() === value
      );
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
      form.cityId.trim() !== "" &&
      form.location.latitude !== null &&
      form.location.longitude !== null
    );
  }, [form]);

  // Handlers pour images (comme dans city)
  const handleBannerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      images.banner.handleFileChange(e);
    },
    [images.banner]
  );
  const handleRemoveBanner = useCallback(() => {
    images.banner.handleRemove();
  }, [images.banner]);
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      images.image.handleFileChange(e);
    },
    [images.image]
  );
  const handleRemoveImage = useCallback(() => {
    images.image.handleRemove();
  }, [images.image]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Token manquant");
      const patchUrl = place?._links?.self?.href;
      if (!patchUrl) throw new Error("Lien de modification HAL manquant");
      const { bannerUrl, imageUrl } = await images.uploadAll();
      const payload: PlaceUpdateRequest = {
        name: form.name.trim(),
        address: form.address.trim(),
        type: form.type,
        latitude: form.location.latitude,
        longitude: form.location.longitude,
        cityId: form.cityId ? parseInt(form.cityId) : 0,
        cityName: form.cityName,
        bannerUrl: bannerUrl?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        content: form.content?.trim() || null,
        description: form.description?.trim() || undefined,
      };
      await modifyPlace(patchUrl, payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu modifié avec succès !");
      setTimeout(() => onOpenChange(false), 300);
    },
    onError: (err: any) => {
      toast.error(`Erreur lors de la modification du lieu`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const resetToInitialState = useCallback(() => {
    if (place) {
      setForm({
        name: place.name || "",
        address: place.address || "",
        type: place.type || "",
        location: {
          latitude: place.location?.latitude ?? null,
          longitude: place.location?.longitude ?? null,
        },
        cityId: findCityIdByName(place.cityName),
        cityName: place.cityName || "",
        content: place.content || "",
        description: place.description || "",
      });
      images.resetAll(place.bannerUrl || "", place.imageUrl || "");
    }
  }, [place, images, cities]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetToInitialState();
    }
  };

  if (!place) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier le lieu</DialogTitle>
            <DialogDescription>
              Modifiez les informations de "{place.name}".
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
                placeholder={form.cityName || "Choisir une ville"}
              >
                {cities?.map((city: City) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectScrollable>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
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
                  value={form.location.latitude ?? ""}
                  onChange={handleChange}
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
                  value={form.location.longitude ?? ""}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload
                id="bannerFile"
                label="Bannière"
                file={images.banner.file}
                previewUrl={images.banner.previewUrl}
                currentImageUrl={images.banner.currentUrl}
                onFileChange={handleBannerChange}
                onRemove={handleRemoveBanner}
                disabled={mutation.isPending}
              />
              <ImageUpload
                id="imageFile"
                label="Image principale"
                file={images.image.file}
                previewUrl={images.image.previewUrl}
                currentImageUrl={images.image.currentUrl}
                onFileChange={handleImageChange}
                onRemove={handleRemoveImage}
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
