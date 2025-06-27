"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Loader2,
  Edit,
  AlertCircle,
  MapPin,
  Globe,
  FileText,
} from "lucide-react";
import { City, CityUpdateRequest } from "@/types/city";
import { modifyCity } from "@/lib/fetch-cities";
import { useAuth } from "@/hooks/use-auth";
import { fetchCities } from "@/lib/fetch-cities";
import { Checkbox } from "@/components/ui/checkbox";

interface ModifyCityDialogProps {
  city: City;
  cities: City[];
  children?: React.ReactNode;
}

export function ModifyCityDialog({
  city,
  cities,
  children,
}: ModifyCityDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: { latitude: null, longitude: null },
    region: "",
    postalCode: "",
    country: "France",
    bannerUrl: "",
    imageUrl: "",
    content: "",
    nearestCities: [] as number[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // Utiliser la prop cities au lieu du fetch
  const allCities = cities || [];

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
        nearestCities: city.nearestCities?.map((c) => c.id) || [],
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

  const handleNearestCitiesChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setForm({ ...form, nearestCities: selected });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = getToken() || undefined;
      const patchUrl = city._links?.self?.href;
      if (!patchUrl) throw new Error("Lien de modification HAL manquant");
      const payload = {
        name: form.name.trim(),
        location: {
          latitude: form.location.latitude,
          longitude: form.location.longitude,
        },
        region: form.region.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
        bannerUrl: form.bannerUrl?.trim() || null,
        imageUrl: form.imageUrl?.trim() || null,
        content: form.content?.trim() || null,
        nearestCities: form.nearestCities,
      };
      await modifyCity(patchUrl, payload, token);
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("Ville modifiée avec succès !");
      setOpen(false);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && city) {
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
        nearestCities: city.nearestCities?.map((c) => c.id) || [],
      });
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
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
                  placeholder="Provence Alpes Côte d'azur"
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

            <div className="grid gap-2">
              <Label htmlFor="bannerUrl">Bannière (URL)</Label>
              <Input
                id="bannerUrl"
                name="bannerUrl"
                value={form.bannerUrl ?? ""}
                onChange={handleChange}
                placeholder="https://..."
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image (URL)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl ?? ""}
                onChange={handleChange}
                placeholder="https://..."
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
                {allCities.filter((c) => c.id !== city.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Aucune ville disponible
                  </p>
                ) : (
                  allCities
                    .filter((c) => c.id !== city.id)
                    .map((city) => (
                      <div
                        key={city.id}
                        className="flex items-center space-x-2"
                      >
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
            <Button type="submit" disabled={!isFormValid || loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Modifier la ville"
              )}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
