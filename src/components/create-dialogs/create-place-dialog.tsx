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
import { useAuth } from "@/hooks/use-auth";

import { PlaceCreateRequest } from "@/types/place";
import { CitiesApiResponse } from "@/types/city";
import { fetchCities } from "@/lib/fetch-cities";
import { createPlace } from "@/lib/fetch-places";
import { uploadImage } from "@/lib/upload-image";
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
    bannerFile: null as File | null,
    imageFile: null as File | null,
    description: "",
  };
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const {
    data: citiesResponse,
    isLoading: citiesLoading,
    error: citiesError,
  } = useQuery<CitiesApiResponse>({
    queryKey: ["cities"],
    queryFn: () => fetchCities(getToken() || undefined),
    retry: 2,
    retryDelay: 1000,
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
    setError("");
    setPreviewBannerUrl(null);
    setPreviewImageUrl(null);
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
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      let bannerUrl = null;
      let imageUrl = null;
      if (form.bannerFile) {
        bannerUrl = await uploadImage(form.bannerFile);
      }
      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile);
      }
      const payload: PlaceCreateRequest = {
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        cityName: form.cityName,
        cityId: parseInt(form.cityId),
        type: form.type || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        bannerUrl: bannerUrl,
        imageUrl: imageUrl,
      };
      await createPlace(payload, getToken() || undefined);
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload
                id="bannerFile"
                label="Bannière"
                file={form.bannerFile}
                previewUrl={previewBannerUrl}
                onFileChange={handleFileChange}
                onRemove={() => handleRemoveImage("banner")}
                disabled={loading}
              />
              <ImageUpload
                id="imageFile"
                label="Image principale"
                file={form.imageFile}
                previewUrl={previewImageUrl}
                onFileChange={handleFileChange}
                onRemove={() => handleRemoveImage("image")}
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
