"use client";

import { useState, useEffect, useMemo } from "react";
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

interface ModifyCityDialogProps {
  city: City;
  children?: React.ReactNode;
}

export function ModifyCityDialog({ city, children }: ModifyCityDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    region: "",
    postalCode: "",
    country: "France",
    description: "",
    latitude: "",
    longitude: "",
    bannerUrl: "",
    imageUrl: "",
    nearestCityIds: [] as number[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  useEffect(() => {
    if (city) {
      setForm({
        name: city.name || "",
        region: city.region || "",
        postalCode: city.postalCode || "",
        country: city.country || "France",
        description: city.content || city.description || "",
        latitude: city.location?.latitude?.toString() || "",
        longitude: city.location?.longitude?.toString() || "",
        bannerUrl: city.bannerUrl || "",
        imageUrl: city.imageUrl || "",
        nearestCityIds: city.nearestCities?.map((c) => c.id) || [],
      });
    }
  }, [city]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.region.trim() !== "" &&
      form.postalCode.trim() !== "" &&
      form.country.trim() !== "" &&
      form.description.trim() !== ""
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
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        region: form.region.trim(),
        country: form.country.trim(),
        postalCode: form.postalCode.trim(),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        bannerUrl: form.bannerUrl || null,
        imageUrl: form.imageUrl || null,
        content: form.description.trim(),
      };
      if (form.nearestCityIds && form.nearestCityIds.length > 0) {
        payload.nearestCityIds = form.nearestCityIds;
      }
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
        region: city.region || "",
        postalCode: city.postalCode || "",
        country: city.country || "France",
        description: city.content || city.description || "",
        latitude: city.location?.latitude?.toString() || "",
        longitude: city.location?.longitude?.toString() || "",
        bannerUrl: city.bannerUrl || "",
        imageUrl: city.imageUrl || "",
        nearestCityIds: city.nearestCities?.map((c) => c.id) || [],
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

            <div className="grid gap-2">
              <Label htmlFor="description">
                <FileText className="inline mr-1 h-4 w-4" />
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
