"use client";

import { useState, useEffect, useMemo } from "react";
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
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";
import { Place, PlaceUpdateRequest, placeTypes } from "@/types/place";
import { City, CitiesApiResponse } from "@/types/city";
import { fetchCities } from "@/services/city-service";
import { modifyPlace } from "@/services/place-service";
import { useAuth } from "@/hooks/use-auth";
import { ImageUpload } from "@/components/ui/image-upload";

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
    latitude: "",
    longitude: "",
    cityId: "",
    cityName: "",
    bannerUrl: "",
    imageUrl: "",
    content: "",
    description: "",
    bannerFile: null as File | null,
    imageFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const { data: citiesResponse, isLoading: citiesLoading } =
    useQuery<CitiesApiResponse>({
      queryKey: ["cities"],
      queryFn: () => {
        if (!token) throw new Error("Token manquant");
        return fetchCities(token);
      },
      enabled: open,
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
        latitude: place.location?.latitude?.toString() || "",
        longitude: place.location?.longitude?.toString() || "",
        cityId: findCityIdByName(place.cityName),
        cityName: place.cityName || "",
        bannerUrl: place.bannerUrl || "",
        imageUrl: place.imageUrl || "",
        content: place.content || "",
        description: place.description || "",
        bannerFile: null,
        imageFile: null,
      });
    }
  }, [place, citiesResponse]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      form.latitude.trim() !== "" &&
      form.longitude.trim() !== "" &&
      form.cityId.trim() !== "" &&
      !isNaN(parseFloat(form.latitude)) &&
      !isNaN(parseFloat(form.longitude))
    );
  }, [form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setForm((prev) => ({ ...prev, [name]: file }));
    if (name === "bannerFile") {
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewBannerUrl(url);
      } else {
        setPreviewBannerUrl(null);
      }
    }
    if (name === "imageFile") {
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewImageUrl(url);
      } else {
        setPreviewImageUrl(null);
      }
    }
  };

  const handleRemoveImage = (type: "banner" | "image") => {
    if (type === "banner") {
      setForm((prev) => ({ ...prev, bannerFile: null }));
      setPreviewBannerUrl(null);
    } else {
      setForm((prev) => ({ ...prev, imageFile: null }));
      setPreviewImageUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!token) throw new Error("Token manquant");
    e.preventDefault();
    setLoading(true);

    try {
      let bannerUrl = form.bannerUrl;
      let imageUrl = form.imageUrl;

      // Upload des nouvelles images si elles existent
      if (form.bannerFile) {
        const { uploadImage } = await import("@/utils/upload-image");
        bannerUrl = await uploadImage(form.bannerFile);
      }
      if (form.imageFile) {
        const { uploadImage } = await import("@/utils/upload-image");
        imageUrl = await uploadImage(form.imageFile);
      }

      const payload: PlaceUpdateRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        address: form.address.trim(),
        cityName: form.cityName,
        cityId: parseInt(form.cityId),
        type: form.type || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        bannerUrl: bannerUrl?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        content: form.content.trim() || null,
      };

      const patchUrl = place?._links?.self?.href;

      if (!patchUrl) throw new Error("Lien de modification HAL manquant");

      await modifyPlace(patchUrl, payload, token);

      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu modifié avec succès !");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetToInitialState = () => {
    if (place) {
      setForm({
        name: place.name || "",
        address: place.address || "",
        type: place.type || "",
        latitude: place.location?.latitude?.toString() || "",
        longitude: place.location?.longitude?.toString() || "",
        cityId: findCityIdByName(place.cityName),
        cityName: place.cityName || "",
        bannerUrl: place.bannerUrl || "",
        imageUrl: place.imageUrl || "",
        content: place.content || "",
        description: place.description || "",
        bannerFile: null,
        imageFile: null,
      });
      setPreviewBannerUrl(null);
      setPreviewImageUrl(null);
    }
  };

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
                  {placeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
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
                    placeholder={form.cityName || "Choisir une ville"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city: City) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
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
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload
                id="bannerFile"
                label="Bannière"
                file={form.bannerFile}
                previewUrl={previewBannerUrl}
                currentImageUrl={form.bannerUrl}
                onFileChange={handleFileChange}
                onRemove={() => handleRemoveImage("banner")}
                disabled={loading}
              />
              <ImageUpload
                id="imageFile"
                label="Image principale"
                file={form.imageFile}
                previewUrl={previewImageUrl}
                currentImageUrl={form.imageUrl}
                onFileChange={handleFileChange}
                onRemove={() => handleRemoveImage("image")}
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
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
