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
import { Loader2, Edit, AlertCircle } from "lucide-react";
import { Event, EventUpdateRequest } from "@/types/event";
import { modifyEvent } from "@/lib/fetch-events";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModifyEventDialogProps {
  event: Event;
  children?: React.ReactNode;
}

export function ModifyEventDialog({ event, children }: ModifyEventDialogProps) {
  const [open, setOpen] = useState(false);
  const initialForm = {
    name: "",
    description: "",
    date: "",
    address: "",
    price: "",
    maxCustomers: "",
    imageUrl: "",
    cityId: "",
    placeId: "",
    categoryKeys: [] as string[],
    isTrending: false,
    status: "NOT_STARTED",
    contentHtml: "",
  };
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (event) {
      setForm({
        name: event.name || "",
        description: event.description || "",
        date: event.date ? event.date.slice(0, 16) : "",
        address: event.address || "",
        price: event.price?.toString() || "",
        maxCustomers: event.maxCustomers?.toString() || "",
        imageUrl: event.imageUrl || "",
        cityId: "",
        placeId: "",
        categoryKeys: event.categories?.map((cat) => cat.key) || [],
        isTrending: event.isTrending || false,
        status: event.status || "NOT_STARTED",
        contentHtml: "",
      });
    }
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.description.trim() !== "" &&
      form.date !== "" &&
      form.address.trim() !== "" &&
      form.price.trim() !== "" &&
      parseFloat(form.price) >= 0 &&
      form.maxCustomers.trim() !== "" &&
      parseInt(form.maxCustomers) > 0
    );
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload: EventUpdateRequest = {
        name: form.name.trim(),
        description: form.description.trim(),
        date: form.date,
        address: form.address.trim(),
        maxCustomers: parseInt(form.maxCustomers),
        price: parseFloat(form.price),
        cityId: parseInt(form.cityId),
        placeId: parseInt(form.placeId),
        categoryKeys: form.categoryKeys,
        imageUrl: form.imageUrl.trim() || undefined,
        isTrending: form.isTrending,
        status: form.status,
        contentHtml: form.contentHtml.trim() || undefined,
      };
      const patchUrl = event._links?.self?.href;
      if (!patchUrl) throw new Error("Lien de modification HAL manquant");
      const token = document.cookie.includes("token=")
        ? document.cookie.split("token=")[1]?.split(";")[0]
        : undefined;
      await modifyEvent(patchUrl, payload, token);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement modifié avec succès !");
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
    if (!newOpen && event) {
      setForm({
        name: event.name || "",
        description: event.description || "",
        date: event.date ? event.date.slice(0, 16) : "",
        address: event.address || "",
        price: event.price?.toString() || "",
        maxCustomers: event.maxCustomers?.toString() || "",
        imageUrl: event.imageUrl || "",
        cityId: "",
        placeId: "",
        categoryKeys: event.categories?.map((cat) => cat.key) || [],
        isTrending: event.isTrending || false,
        status: event.status || "NOT_STARTED",
        contentHtml: "",
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
            <DialogTitle>Modifier l'événement</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'événement "{event.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'événement *</Label>
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
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date et heure *</Label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                value={form.date}
                onChange={handleChange}
                required
                disabled={loading}
              />
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
                <Label htmlFor="maxCustomers">
                  Nombre max. de participants *
                </Label>
                <Input
                  id="maxCustomers"
                  name="maxCustomers"
                  type="number"
                  value={form.maxCustomers}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
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
              <Label htmlFor="contentHtml">Description détaillée (HTML)</Label>
              <Textarea
                id="contentHtml"
                name="contentHtml"
                value={form.contentHtml}
                onChange={handleChange}
                rows={3}
                placeholder="<p>Rejoignez-nous...</p>"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTrending"
                  checked={form.isTrending}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      isTrending: checked as boolean,
                    }))
                  }
                  disabled={loading}
                />
                <Label htmlFor="isTrending" className="text-sm">
                  Événement tendance
                </Label>
              </div>

              <div className="grid gap-2">
                <Label>Statut</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, status: value }))
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">À venir</SelectItem>
                    <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                    <SelectItem value="FINISHED">Terminé</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
