"use client";

import React from "react";
import { useState, useCallback, useMemo, memo } from "react";
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
import { NovelEditor } from "@/components/ui/novel-editor";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { fetchCities } from "@/lib/fetch-cities";
import { fetchPlacesByCity } from "@/lib/fetch-places";
import { fetchCategories } from "@/lib/fetch-categories";
import { uploadImage } from "@/lib/upload-image";
import { createEvent } from "@/lib/fetch-events";
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
};

const InputField = memo(
  ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    value,
    onChange,
    disabled,
    ...props
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    [key: string]: any;
  }) => (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label} {required && "*"}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...props}
      />
    </div>
  )
);

const MemoizedSelect = memo(
  ({
    value,
    onValueChange,
    disabled,
    placeholder,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    disabled: boolean;
    placeholder: string;
    children: React.ReactNode;
  }) => (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
);

export function CreateEventDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    data: citiesResponse,
    isLoading: citiesLoading,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities"],
    queryFn: () => fetchCities(getToken() || undefined),
    retry: 2,
    retryDelay: 1000,
    enabled: open,
  });

  const { data: places, isLoading: placesLoading } = useQuery({
    queryKey: ["places", form.cityId],
    queryFn: () => fetchPlacesByCity(form.cityId, getToken() || undefined),
    enabled: !!form.cityId && open,
    retry: 2,
  });

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(getToken() || undefined),
    retry: 2,
    enabled: open,
  });

  const cities = citiesResponse?._embedded?.cityResponses || [];
  const categories = categoriesResponse?._embedded?.categories || [];
  const placesList = Array.isArray(places) ? places : [];

  console.log("Cities data:", cities, "Is array:", Array.isArray(cities));
  console.log("Places data:", places, "Is array:", Array.isArray(places));
  console.log(
    "Categories data:",
    categories,
    "Is array:",
    Array.isArray(categories)
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type, checked } = e.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, cityId: value, placeId: "" }));
  }, []);

  const handlePlaceChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, placeId: value }));
  }, []);

  const handleCategoryChange = useCallback(
    (categoryKey: string, checked: boolean) => {
      setForm((prev) => ({
        ...prev,
        categoryIds: checked
          ? [...prev.categoryIds, categoryKey]
          : prev.categoryIds.filter((key) => key !== categoryKey),
      }));
    },
    []
  );

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
        setForm((prev) => ({ ...prev, imageUrl: url }));
      }
    },
    []
  );

  const handleImageRemove = useCallback(() => {
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setForm((prev) => ({ ...prev, imageUrl: "" }));
  }, [imagePreviewUrl]);

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

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setError("");
    // Clean up image states
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
  }, [imagePreviewUrl]);

  const validateForm = useCallback(() => {
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
  }, [form]);

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
        validateForm();

        // Upload de l'image vers Cloudinary si un fichier est sélectionné
        let cloudinaryImageUrl = form.imageUrl;
        if (imageFile) {
          console.log("🔄 Upload de l'image vers Cloudinary...");
          cloudinaryImageUrl = await uploadImage(imageFile);
          console.log("✅ Image uploadée avec succès:", cloudinaryImageUrl);
        }

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
        };

        console.log("📤 Envoi des données au backend:", payload);
        await createEvent(payload, getToken() || undefined);
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.invalidateQueries({ queryKey: ["my-events"] });
        toast.success("Événement créé avec succès");
        setOpen(false);
        resetForm();
      } catch (err: any) {
        console.error("❌ Erreur lors de la création:", err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [form, imageFile, validateForm, queryClient, resetForm, getToken]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        !newOpen && resetForm();
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Créer un événement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un nouvel événement</DialogTitle>
            <DialogDescription>
              Les champs marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <InputField
              label="Nom de l'événement"
              name="name"
              placeholder="Concert sous les étoiles"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <InputField
              label="Description"
              name="description"
              placeholder="Une soirée exceptionnelle..."
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              required
            />

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
                    disabled={loading}
                    className="pl-8 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>
              </div>
            </div>

            <InputField
              label="Adresse"
              name="address"
              placeholder="Parc Central, Avenue des Arts"
              value={form.address}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Prix (€)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="20.00"
                value={form.price}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <InputField
                label="Participants maximum"
                name="maxCustomers"
                type="number"
                min="1"
                placeholder="250"
                value={form.maxCustomers}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <ImageUpload
              id="imageUrl"
              label="Image"
              file={imageFile}
              previewUrl={imagePreviewUrl}
              onFileChange={handleImageChange}
              onRemove={handleImageRemove}
              disabled={loading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ville *</Label>
                <MemoizedSelect
                  value={form.cityId}
                  onValueChange={handleCityChange}
                  disabled={loading || citiesLoading}
                  placeholder={
                    citiesLoading ? "Chargement..." : "Sélectionner une ville"
                  }
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
                </MemoizedSelect>
                {citiesError && (
                  <p className="text-xs text-destructive">
                    Erreur lors du chargement des villes
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Lieu *</Label>
                <MemoizedSelect
                  value={form.placeId}
                  onValueChange={handlePlaceChange}
                  disabled={loading || !form.cityId || placesLoading}
                  placeholder={
                    !form.cityId
                      ? "Sélectionnez d'abord une ville"
                      : placesLoading
                      ? "Chargement..."
                      : "Sélectionner un lieu"
                  }
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
                </MemoizedSelect>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Catégories *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
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
                        disabled={loading}
                      />
                      <Label
                        htmlFor={`${cat.key}-${i}`}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        {cat.name}
                        {cat.trending && (
                          <Badge variant="secondary" className="text-xs">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Statut</Label>
                <MemoizedSelect
                  value={form.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={loading}
                  placeholder="Sélectionner un statut"
                >
                  <SelectItem value="NOT_STARTED">À venir</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </MemoizedSelect>
              </div>
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
                  Créer l'événement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
