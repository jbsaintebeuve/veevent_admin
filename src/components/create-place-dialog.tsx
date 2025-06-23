"use client";

import { useState } from "react";
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
  Plus,
  Loader2,
  AlertCircle,
  MapPin,
  Image,
  FileText,
} from "lucide-react";

export function CreatePlaceDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    cityName: "",
    latitude: "",
    longitude: "",
    imageUrl: "",
    bannerUrl: "",
    text: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      name: "",
      address: "",
      cityName: "",
      latitude: "",
      longitude: "",
      imageUrl: "",
      bannerUrl: "",
      text: "",
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8090/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          cityName: form.cityName,
          location: {
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
          },
          imageUrl: form.imageUrl || null,
          bannerUrl: form.bannerUrl || null,
          text: form.text || null,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création du lieu");

      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu créé avec succès !");
      setOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form onSubmit={handleSubmit}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Créer un lieu
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau lieu</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lieu pour vos événements. Les champs marqués
              d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Nom et Ville */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du lieu *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Salle de concert, stade..."
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cityName">Ville *</Label>
                <Input
                  id="cityName"
                  name="cityName"
                  value={form.cityName}
                  onChange={handleChange}
                  placeholder="Paris, Lyon..."
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse complète *</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 rue de la République, 75001 Paris"
                required
                disabled={loading}
              />
            </div>

            {/* Coordonnées GPS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="48.8566"
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
                  step="any"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="2.3522"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Obtenez les coordonnées GPS sur Google Maps (clic droit →
              coordonnées).
            </p>

            {/* Images */}
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image principale (URL)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://exemple.com/image.jpg"
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
                placeholder="https://exemple.com/banner.jpg"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="text">Description</Label>
              <Textarea
                id="text"
                name="text"
                value={form.text}
                onChange={handleChange}
                rows={3}
                placeholder="Décrivez le lieu, ses spécificités, sa capacité..."
                disabled={loading}
              />
            </div>

            {/* Erreur */}
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
            <Button type="submit" disabled={loading}>
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
        </DialogContent>
      </form>
    </Dialog>
  );
}
