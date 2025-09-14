"use client";

import { useState, useEffect, useMemo } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NovelEditor } from "@/components/ui/novel-editor";
import { toast } from "sonner";
import {
  Loader2,
  Edit,
  CalendarIcon,
  ClockIcon,
  ChevronDown,
} from "lucide-react";
import { Event, EventUpdateRequest } from "@/types/event";
import { modifyEvent, fetchEventDetails } from "@/services/event-service";
import { useImageUpload } from "@/hooks/use-image-upload";
import { fetchCategories } from "@/services/category-service";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ImageUpload } from "@/components/ui/image-upload";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ModifyEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}

export function ModifyEventDialog({
  event,
  open,
  onOpenChange,
  isAdmin = true,
}: ModifyEventDialogProps) {
  const initialForm = {
    name: "",
    description: "",
    date: undefined as Date | undefined,
    time: "",
    address: "",
    price: "",
    maxCustomers: "",
    imageUrl: "",
    categoryKeys: [] as string[],
    status: "NOT_STARTED",
    contentHtml: "",
    isInvitationOnly: false,
    isTrending: false,
  };
  const [form, setForm] = useState(initialForm);
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const imageUpload = useImageUpload(event?.imageUrl || "");

  const resetForm = () => {
    if (event) {
      imageUpload.reset(event.imageUrl || "");
      const eventDate = event.date ? new Date(event.date) : undefined;
      const eventTime = eventDate
        ? eventDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "";
      setForm({
        name: event.name || "",
        description: event.description || "",
        date: eventDate,
        time: eventTime,
        address: event.address || "",
        price: event.price?.toString() || "",
        maxCustomers: event.maxCustomers?.toString() || "",
        imageUrl: event.imageUrl || "",
        categoryKeys: event.categories?.map((cat) => cat.key) || [],
        status: event.status || "NOT_STARTED",
        contentHtml: "",
        isInvitationOnly: event.isInvitationOnly || false,
        isTrending: event.isTrending || false,
      });
    } else {
      setForm(initialForm);
      imageUpload.reset();
    }
  };

  const mutation = useMutation({
    mutationFn: async (payload: EventUpdateRequest) => {
      if (!token) throw new Error("Token manquant");
      const patchUrl = event?._links?.self?.href;
      if (!patchUrl) throw new Error("Lien de modification HAL manquant");

      await modifyEvent(patchUrl, payload, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      toast.success("Événement modifié avec succès");
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(`Erreur lors de la modification de l'événement`);
    },
  });

  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchCategories(token);
    },
    enabled: open,
  });
  const categories = categoriesResponse?._embedded?.categories || [];

  const { data: eventDetails, isLoading: eventDetailsLoading } = useQuery({
    queryKey: ["eventDetails", event?.id],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchEventDetails(event!.id, token);
    },
    enabled: open,
  });

  useEffect(() => {
    if (eventDetails) {
      const eventDate = eventDetails.date
        ? new Date(eventDetails.date)
        : undefined;
      const eventTime = eventDate
        ? eventDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "";

      setForm({
        name: eventDetails.name || "",
        description: eventDetails.description || "",
        date: eventDate,
        time: eventTime,
        address: eventDetails.address || "",
        price: eventDetails.price?.toString() || "",
        maxCustomers: eventDetails.maxCustomers?.toString() || "",
        imageUrl: eventDetails.imageUrl || "",
        categoryKeys:
          eventDetails.categories?.map(
            (cat: { name: string; key: string }) => cat.key
          ) || [],
        status: eventDetails.status || "NOT_STARTED",
        contentHtml: eventDetails.contentHtml || "",
        isInvitationOnly: eventDetails.isInvitationOnly || false,
        isTrending: eventDetails.isTrending || false,
      });
    }
  }, [eventDetails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid = useMemo(() => {
    const price = parseFloat(form.price);
    const maxCustomers = parseInt(form.maxCustomers);

    return (
      form.name.trim() !== "" &&
      form.description.trim() !== "" &&
      form.date !== undefined &&
      form.address.trim() !== "" &&
      form.price.trim() !== "" &&
      !isNaN(price) &&
      price >= 0 &&
      form.maxCustomers.trim() !== "" &&
      !isNaN(maxCustomers) &&
      maxCustomers > 0 &&
      form.categoryKeys.length > 0 &&
      (!form.date || new Date(form.date) > new Date())
    );
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

  const extractIdFromUrl = (url: string) => {
    const parts = url.split("/");
    return parseInt(parts[parts.length - 1]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cityId = eventDetails?._links?.city?.href
      ? extractIdFromUrl(eventDetails._links.city.href)
      : 0;
    const placeId = eventDetails?._links?.places?.href
      ? extractIdFromUrl(eventDetails._links.places.href)
      : 0;

    const cloudinaryImageUrl = await imageUpload.uploadIfNeeded();

    const payload: EventUpdateRequest = {
      name: form.name.trim(),
      description: form.description.trim(),
      date: getDateTimeISO(),
      address: form.address.trim(),
      maxCustomers: parseInt(form.maxCustomers),
      price: parseFloat(form.price),
      cityId,
      placeId,
      categoryKeys: form.categoryKeys,
      imageUrl: cloudinaryImageUrl?.trim() || undefined,
      status: form.status,
      contentHtml: form.contentHtml.trim() || undefined,
      isInvitationOnly: form.isInvitationOnly,
      isTrending: form.isTrending,
    };
    mutation.mutate(payload);
  };

  const handleCategoryChange = (categoryKey: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      categoryKeys: checked
        ? [...prev.categoryKeys, categoryKey]
        : prev.categoryKeys.filter((key) => key !== categoryKey),
    }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  if (!event || eventDetailsLoading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>Modifier l'événement</DialogTitle>
            </DialogHeader>
          </VisuallyHidden>
          <div className="grid gap-4">
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-32 w-full mb-2" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                disabled={mutation.isPending}
                placeholder="Description courte de l'événement"
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
                      <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
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
                value={form.address}
                onChange={handleChange}
                required
                disabled={mutation.isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price" className="truncate">
                  Prix (€) *
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
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
                  value={form.maxCustomers}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <ImageUpload
              id="imageUrl"
              label="Image"
              file={imageUpload.file}
              previewUrl={imageUpload.previewUrl}
              currentImageUrl={event.imageUrl}
              onFileChange={imageUpload.handleFileChange}
              onRemove={imageUpload.handleRemove}
              disabled={mutation.isPending}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ville</Label>
                <Input
                  value={
                    eventDetails?.cityName || event.cityName || "Non renseignée"
                  }
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>

              <div className="grid gap-2">
                <Label>Lieu</Label>
                <Input
                  value={
                    eventDetails?.placeName ||
                    event.placeName ||
                    "Non renseigné"
                  }
                  disabled
                  className="bg-muted text-muted-foreground"
                />
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
                        checked={form.categoryKeys.includes(cat.key)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(cat.key, checked as boolean)
                        }
                        disabled={mutation.isPending}
                      />
                      <Label htmlFor={`${cat.key}-${i}`} className="text-sm">
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
            {isAdmin && (
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
            )}
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
