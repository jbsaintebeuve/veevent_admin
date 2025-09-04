"use client";

import React from "react";
import { useState, useMemo, memo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
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
import { NovelEditor } from "@/components/ui/novel-editor";
import { Badge } from "@/components/ui/badge";
import { SelectItem } from "@/components/ui/select";
import { SelectScrollable } from "@/components/ui/select-scrollable";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  AlertCircle,
  MapPin,
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
} from "lucide-react";
import { fetchCities } from "@/services/city-service";
import { fetchPlacesByCity } from "@/services/place-service";
import { fetchCategories } from "@/services/category-service";
import { useImageUpload } from "@/hooks/use-image-upload";
import { createEvent } from "@/services/event-service";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const now = new Date();
const nowTime = now.toLocaleTimeString("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const initialForm = {
  name: "",
  description: "",
  date: undefined as Date | undefined,
  time: nowTime,
  address: "",
  price: "",
  maxCustomers: "",
  imageUrl: "",
  cityId: "",
  placeId: "",
  categoryIds: [] as string[],
  status: "NOT_STARTED",
  contentHtml: "",
  isInvitationOnly: false,
  isTrending: false,
};

export function CreateEventDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!token) throw new Error("Token manquant");
      return createEvent(payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      toast.success("Événement créé avec succès");
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'événement");
    },
  });
  const [form, setForm] = useState(initialForm);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const imageUpload = useImageUpload();

  const {
    data: citiesResponse,
    isLoading: citiesLoading,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchCities(token, 0, 50);
    },
    enabled: open,
  });

  const { data: places, isLoading: placesLoading } = useQuery({
    queryKey: ["places", form.cityId],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchPlacesByCity(form.cityId, token);
    },
    enabled: open,
  });

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchCategories(token);
    },
    enabled: open,
  });

  const cities = citiesResponse?._embedded?.cityResponses || [];
  const categories = categoriesResponse?._embedded?.categories || [];
  const placesList = Array.isArray(places) ? places : [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCityChange = (value: string) => {
    setForm((prev) => ({ ...prev, cityId: value, placeId: "" }));
  };

  const handlePlaceChange = (value: string) => {
    setForm((prev) => ({ ...prev, placeId: value }));
  };

  const handleCategoryChange = (categoryKey: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: checked
        ? [...prev.categoryIds, categoryKey]
        : prev.categoryIds.filter((key) => key !== categoryKey),
    }));
  };

  const isFormValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.description.trim() !== "" &&
      form.date !== undefined &&
      form.address.trim() !== "" &&
      form.price.trim() !== "" &&
      parseFloat(form.price) >= 0 &&
      form.maxCustomers.trim() !== "" &&
      parseInt(form.maxCustomers) > 0 &&
      form.cityId !== "" &&
      form.placeId !== "" &&
      form.categoryIds.length > 0
    );
  }, [form]);

  const resetForm = () => {
    setForm(initialForm);
    imageUpload.reset();
  };

  const validateForm = () => {
    const required = [
      "name",
      "description",
      "date",
      "address",
      "price",
      "maxCustomers",
      "cityId",
      "placeId",
    ];
    const missing = required.find((field) => !form[field as keyof typeof form]);
    if (missing) throw new Error(`Le champ ${missing} est requis`);
    if (!form.categoryIds.length)
      throw new Error("Au moins une catégorie est requise");

    const price = parseFloat(form.price);
    const maxCustomers = parseInt(form.maxCustomers);
    if (isNaN(price) || price < 0) throw new Error("Prix invalide");
    if (isNaN(maxCustomers) || maxCustomers <= 0)
      throw new Error("Capacité invalide");
    if (form.date && new Date(form.date) <= new Date())
      throw new Error("Date invalide");
  };

  const getDateTimeISO = () => {
    if (!form.date || !form.time) return "";
    const [hours, minutes] = form.time.split(":");
    const year = form.date.getFullYear();
    const month = form.date.getMonth();
    const day = form.date.getDate();
    return new Date(
      Date.UTC(year, month, day, Number(hours), Number(minutes))
    ).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    validateForm();

    const cloudinaryImageUrl = await imageUpload.uploadIfNeeded();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      date: getDateTimeISO(),
      address: form.address.trim(),
      price: parseFloat(form.price),
      maxCustomers: parseInt(form.maxCustomers, 10),
      status: form.status,
      imageUrl: cloudinaryImageUrl?.trim() || undefined,
      contentHtml: form.contentHtml.trim() || undefined,
      placeId: parseInt(form.placeId, 10),
      cityId: parseInt(form.cityId, 10),
      categoryKeys: form.categoryIds,
      isInvitationOnly: form.isInvitationOnly,
      isTrending: form.isTrending,
    };
    mutation.mutate(payload);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Créer un événement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un nouvel événement</DialogTitle>
            <DialogDescription>
              Les champs marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'événement *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Concert sous les étoiles"
                value={form.name}
                onChange={handleChange}
                disabled={mutation.isPending}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                name="description"
                placeholder="Une soirée exceptionnelle..."
                value={form.description}
                onChange={handleChange}
                disabled={mutation.isPending}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date *</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.date
                        ? format(form.date, "PPP")
                        : "Choisir une date"}
                      <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(date) => {
                        setForm((prev) => ({ ...prev, date }));
                        setDatePickerOpen(false);
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>Heure *</Label>
                <div className="relative">
                  <ClockIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, time: e.target.value }))
                    }
                    required
                    disabled={mutation.isPending}
                    className="pl-8 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Parc Central, Avenue des Arts"
                value={form.address}
                onChange={handleChange}
                disabled={mutation.isPending}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="20.00"
                  value={form.price}
                  onChange={handleChange}
                  disabled={mutation.isPending}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="maxCustomers"
                  className="truncate"
                  style={{ display: "block", width: "100%" }}
                >
                  Participants maximum *
                </Label>
                <Input
                  id="maxCustomers"
                  name="maxCustomers"
                  type="number"
                  min="1"
                  placeholder="250"
                  value={form.maxCustomers}
                  onChange={handleChange}
                  disabled={mutation.isPending}
                  required
                />
              </div>
            </div>

            <ImageUpload
              id="imageUrl"
              label="Image"
              file={imageUpload.file}
              previewUrl={imageUpload.previewUrl}
              onFileChange={imageUpload.handleFileChange}
              onRemove={imageUpload.handleRemove}
              disabled={mutation.isPending}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ville *</Label>
                <SelectScrollable
                  value={form.cityId}
                  onValueChange={handleCityChange}
                  disabled={mutation.isPending || citiesLoading}
                  placeholder={
                    citiesLoading ? "Chargement..." : "Sélectionner une ville"
                  }
                  className=""
                >
                  {Array.isArray(cities) && cities.length > 0 ? (
                    cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {city.name}
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
                </SelectScrollable>
                {citiesError && (
                  <p className="text-xs text-destructive">
                    Erreur lors du chargement des villes
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Lieu *</Label>
                <SelectScrollable
                  value={form.placeId}
                  onValueChange={handlePlaceChange}
                  disabled={mutation.isPending || !form.cityId || placesLoading}
                  placeholder={
                    !form.cityId
                      ? "Sélectionnez d'abord une ville"
                      : placesLoading
                      ? "Chargement..."
                      : "Sélectionner un lieu"
                  }
                  className=""
                >
                  {Array.isArray(placesList) && placesList.length > 0 ? (
                    placesList.map((place) => (
                      <SelectItem key={place.id} value={place.id.toString()}>
                        <div>
                          <div className="font-medium">{place.name}</div>
                          {place.type && (
                            <div className="text-xs text-muted-foreground">
                              {place.type}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-places-available" disabled>
                      {!form.cityId
                        ? "Sélectionnez une ville"
                        : placesLoading
                        ? "Chargement..."
                        : "Aucun lieu disponible"}
                    </SelectItem>
                  )}
                </SelectScrollable>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Catégories *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3 relative">
                {categoriesLoading ? (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Chargement...
                  </p>
                ) : Array.isArray(categories) && categories.length > 0 ? (
                  categories.map((cat, i) => (
                    <div
                      key={`${cat.key}-${i}`}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${cat.key}-${i}`}
                        checked={form.categoryIds.includes(cat.key)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(cat.key, checked as boolean)
                        }
                        disabled={mutation.isPending}
                      />
                      <Label
                        htmlFor={`${cat.key}-${i}`}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        {cat.name}
                        {cat.trending && (
                          <Badge
                            variant="secondary"
                            className="text-xs hidden sm:block"
                          >
                            Tendance
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2">
                    Aucune catégorie disponible
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contentHtml">Description détaillée (HTML)</Label>
              <NovelEditor
                value={form.contentHtml}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, contentHtml: value }))
                }
                placeholder="Écrivez votre description détaillée ici. Utilisez '/' pour accéder aux commandes..."
                className="min-h-[300px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isInvitationOnly"
                name="isInvitationOnly"
                checked={form.isInvitationOnly}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isInvitationOnly: !!checked }))
                }
              />
              <Label htmlFor="isInvitationOnly">
                Sur invitation uniquement
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isTrending"
                name="isTrending"
                checked={form.isTrending}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isTrending: !!checked }))
                }
              />
              <Label htmlFor="isTrending">Événement tendance</Label>
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
