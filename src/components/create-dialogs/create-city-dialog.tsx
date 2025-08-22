"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import { Plus, Loader2, MapPin, Globe } from "lucide-react";
import { City } from "@/types/city";
import { createCity } from "@/services/city-service";
import { useMultipleImages } from "@/hooks/use-image-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { CityCreateRequest } from "@/types/city";
import { ImageUpload } from "@/components/ui/image-upload";

const initialForm = {
  name: "",
  location: { latitude: null, longitude: null },
  region: "",
  postalCode: "",
  country: "France",
  content: "",
  nearestCities: [] as number[],
};

export function CreateCityDialog({ cities }: { cities: City[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const imageUploads = useMultipleImages();

  const mutation = useMutation({
    mutationFn: async (payload: CityCreateRequest) => {
      if (!token) throw new Error("Token manquant");
      return createCity(payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("Ville créée avec succès !");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erreur lors de la création de la ville");
    },
  });

  const allCities = cities || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "latitude" || name === "longitude") {
      const newValue = value === "" ? null : parseFloat(value);

      setForm({
        ...form,
        location: {
          ...form.location,
          [name]: newValue,
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

  const resetForm = () => {
    setForm(initialForm);
    imageUploads.resetAll();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let bannerUrl, imageUrl;
    ({ bannerUrl, imageUrl } = await imageUploads.uploadAll());

    const payload = {
      name: form.name.trim(),
      latitude: form.location.latitude,
      longitude: form.location.longitude,
      region: form.region.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
      bannerUrl: bannerUrl,
      imageUrl: imageUrl,
      content: form.content?.trim() || null,
      nearestCityIds: form.nearestCities,
    } as CityCreateRequest;
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
          Créer une ville
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle ville</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle ville pour vos événements. Les champs marqués
              d'un * sont obligatoires.
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
                  placeholder="PAC"
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
                {allCities.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Aucune ville disponible
                  </p>
                ) : (
                  allCities.map((city) => (
                    <div key={city.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`nearestCity-${city.id}`}
                        checked={form.nearestCities.includes(city.id)}
                        onCheckedChange={(checked: boolean) => {
                          setForm((prev) => ({
                            ...prev,
                            nearestCities: checked
                              ? [...prev.nearestCities, city.id]
                              : prev.nearestCities.filter(
                                  (id) => id !== city.id
                                ),
                          }));
                        }}
                        disabled={mutation.isPending}
                      />
                      <Label
                        htmlFor={`nearestCity-${city.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {city.name}
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
