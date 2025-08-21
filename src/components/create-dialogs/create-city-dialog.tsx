"use client";

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plus, Loader2, AlertCircle, MapPin, Globe } from "lucide-react";
import { City } from "@/types/city";
import { createCity } from "@/services/city-service";
import { uploadImage } from "@/utils/upload-image";
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
  bannerFile: null as File | null,
  imageFile: null as File | null,
  content: "",
  nearestCities: [] as number[],
};

export function CreateCityDialog({ cities }: { cities: City[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const allCities = cities || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("🔧 handleChange - name:", name, "value:", value);

    if (name === "latitude" || name === "longitude") {
      const newValue = value === "" ? null : parseFloat(value);
      console.log("🔧 handleChange - setting location", name, "to:", newValue);

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
    setError("");
    setPreviewBannerUrl(null);
    setPreviewImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Upload des images si elles existent
      let bannerUrl = null;
      let imageUrl = null;

      if (form.bannerFile) {
        bannerUrl = await uploadImage(form.bannerFile);
      }

      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile);
      }

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

      console.log("🔧 handleSubmit - final payload:", payload);
      console.log("🔧 handleSubmit - form.location:", form.location);

      const token = getToken() || undefined;
      await createCity(payload, token);

      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("Ville créée avec succès !");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la ville");
      toast.error("Erreur lors de la création");
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  disabled={loading}
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
            <div className="grid gap-2">
              <Label htmlFor="content">Description longue</Label>
              <Textarea
                id="content"
                name="content"
                value={form.content ?? ""}
                onChange={handleChange}
                rows={3}
                placeholder="Description détaillée de la ville"
                disabled={loading}
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
                        disabled={loading}
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

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isFormValid || loading}>
              {loading ? (
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
