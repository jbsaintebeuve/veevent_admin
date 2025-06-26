"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";
import { Place, PlaceUpdateRequest } from "@/types/place";
import { City, CitiesApiResponse } from "@/types/city";
import { fetchCities } from "@/lib/fetch-cities";

interface ModifyPlaceDialogProps {
  place: Place;
  children?: React.ReactNode;
}

export function ModifyPlaceDialog({ place, children }: ModifyPlaceDialogProps) {
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
  const queryClient = useQueryClient();

  const { data: cities, isLoading: citiesLoading } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
    enabled: open,
  });

  const findCityIdByName = (cityName: string): string => {
    if (!cities || !cityName) return "";
    const city = cities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    return city ? city.id.toString() : "";
  };

  // ✅ Initialisation simplifiée - plus de description
  useEffect(() => {
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
        content: place.content || "", // ✅ Une seule description
      });
    }
  }, [place, cities]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalCityId =
        parseInt(form.cityId) || parseInt(findCityIdByName(form.cityName));

      if (isNaN(finalCityId)) {
        throw new Error("Ville requise");
      }

      const payload: PlaceUpdateRequest = {
        name: form.name.trim(),
        address: form.address.trim(),
        type: form.type,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        cityName: form.cityName,
        cityId: finalCityId,
        bannerUrl: form.bannerUrl.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        content: form.content.trim() || null, // ✅ Une seule description
      };

      const res = await fetch(`http://localhost:8090/places/${place.id}`, {
        method: "PATCH",
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
        throw new Error(`Erreur ${res.status}`);
      }

      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu modifié avec succès !");
      setOpen(false);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                    placeholder={form.cityName || "Choisir une ville"}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image (URL)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
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
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Modifier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
