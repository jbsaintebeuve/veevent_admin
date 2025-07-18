"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  FileText,
  Save,
  AlertCircle,
  Loader2,
  Phone,
  Star,
  Globe,
  Plus,
  X,
  Camera,
  Edit,
} from "lucide-react";
import { fetchCategories } from "@/lib/fetch-categories";
import { fetchUserProfile, updateUserProfile } from "@/lib/fetch-user";
import { Category as CategoryType } from "@/types/category";
import { uploadImage } from "@/lib/upload-image";
import { ImageUpload } from "@/components/ui/image-upload";

interface Social {
  name: string;
  url: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading, getToken } = useAuth();

  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    pseudo: "",
    email: "",
    role: "",
    description: "",
    phone: "",
    imageUrl: "",
    bannerUrl: "",
    note: 0,
    categoryKeys: [] as string[],
    imageFile: null as File | null,
    bannerFile: null as File | null,
  });
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(getToken() || undefined),
    enabled: !!getToken(),
  });

  const categories = categoriesResponse?._embedded?.categories || [];

  const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfileData() {
      if (!user) return;

      setLoading(true);
      try {
        // ✅ Récupérer les données de profil depuis /users/{id}
        const token = getToken();
        const profileData = await fetchUserProfile(user.id, token || undefined);

        // ✅ Combiner les données useAuth + profil
        setForm({
          // Données de base depuis useAuth
          lastName: user.lastName || "",
          firstName: user.firstName || "",
          pseudo: user.pseudo || "",
          email: user.email || "",
          role: user.role || "",
          // Données du profil depuis l'API
          description: profileData.description || "",
          phone: profileData.phone || "",
          imageUrl: profileData.imageUrl || user.imageUrl || "",
          bannerUrl: profileData.bannerUrl || "",
          note: profileData.note || 0,
          categoryKeys: profileData.categoryKeys || [],
          imageFile: null,
          bannerFile: null,
        });

        // ✅ Parser les réseaux sociaux
        console.log("🔍 Socials from API:", profileData.socials);
        if (profileData.socials) {
          try {
            // Si c'est déjà un tableau, l'utiliser directement
            if (Array.isArray(profileData.socials)) {
              setSocials(profileData.socials);
            } else {
              // Sinon, essayer de parser comme JSON string
              const parsedSocials = JSON.parse(profileData.socials);
              setSocials(Array.isArray(parsedSocials) ? parsedSocials : []);
            }
          } catch {
            console.warn("⚠️ Erreur parsing socials:", profileData.socials);
            setSocials([]);
          }
        } else {
          setSocials([]);
        }
      } catch (err: any) {
        setError(err.message);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    }

    if (user && !authLoading) {
      fetchUserProfileData();
    }
  }, [user, authLoading, getToken]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "note") {
      setForm({ ...form, [name]: parseFloat(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCategoryChange = (categoryKey: string, checked: boolean) => {
    if (checked) {
      setForm({
        ...form,
        categoryKeys: [...form.categoryKeys, categoryKey],
      });
    } else {
      setForm({
        ...form,
        categoryKeys: form.categoryKeys.filter((key) => key !== categoryKey),
      });
    }
  };

  const addSocial = () => {
    setSocials([...socials, { name: "", url: "" }]);
  };

  const removeSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  const updateSocial = (
    index: number,
    field: "name" | "url",
    value: string
  ) => {
    const newSocials = [...socials];
    newSocials[index][field] = value;
    setSocials(newSocials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      let imageUrl = form.imageUrl;
      let bannerUrl = form.bannerUrl;

      // Upload des nouvelles images si elles existent
      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile);
      }
      if (form.bannerFile) {
        bannerUrl = await uploadImage(form.bannerFile);
      }

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        pseudo: form.pseudo.trim(),
        email: form.email.trim(),
        description: form.description.trim() || null,
        phone: form.phone.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
        note: form.note || null,
        socials: socials.length > 0 ? JSON.stringify(socials) : null,
        categoryKeys: form.categoryKeys,
      };

      console.log("Payload envoyé:", payload); // Debug

      const token = getToken();
      await updateUserProfile(user.id, payload, token || undefined);

      toast.success("Profil mis à jour avec succès !");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
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

  const triggerImageUpload = () => {
    document.getElementById("imageFile")?.click();
  };

  if (authLoading || loading) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mx-auto w-full max-w-2xl">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Card className="shadow-xs">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous devez être connecté pour accéder à votre profil.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const getInitials = () => {
    return `${form.firstName.charAt(0)}${form.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive";
      case "organizer":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="mx-auto w-full max-w-2xl">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et vos préférences de compte
            </p>
          </div>

          {/* Profile Preview Card */}
          <Card className="mb-6 shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative group cursor-pointer">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={previewImageUrl || form.imageUrl}
                      alt={`${form.firstName} ${form.lastName}`}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={triggerImageUpload}
                    disabled={saving}
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                  <input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={saving}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold">
                      {form.firstName} {form.lastName}
                    </h3>
                    <Badge variant={getRoleBadgeVariant(form.role)}>
                      {form.role}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">@{form.pseudo}</p>
                  <p className="text-sm text-muted-foreground">{form.email}</p>
                  {form.note > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{form.note}/5</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Form */}
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>
                Modifiez vos informations de profil public et vos préférences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base (lecture seule) */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Informations de base (non modifiables)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Nom</Label>
                      <Input
                        value={form.lastName}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Prénom</Label>
                      <Input
                        value={form.firstName}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Pseudo</Label>
                      <Input
                        value={form.pseudo}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input value={form.email} readOnly className="bg-muted" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Informations modifiables */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    Informations du profil
                  </h4>

                  <div className="grid gap-2">
                    <Label htmlFor="description">
                      <FileText className="inline mr-1 h-4 w-4" />
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Parlez-nous de vous..."
                      disabled={saving}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">
                        <Phone className="inline mr-1 h-4 w-4" />
                        Téléphone
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+33612345678"
                        disabled={saving}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="note">
                        <Star className="inline mr-1 h-4 w-4" />
                        Note (sur 5)
                      </Label>
                      <Input
                        id="note"
                        name="note"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={form.note}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <ImageUpload
                    id="bannerFile"
                    label="Bannière"
                    file={form.bannerFile}
                    previewUrl={previewBannerUrl}
                    currentImageUrl={form.bannerUrl}
                    onFileChange={handleFileChange}
                    onRemove={() => handleRemoveImage("banner")}
                    disabled={saving}
                  />
                </div>

                <Separator />

                {/* Réseaux sociaux */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      <Globe className="inline mr-1 h-4 w-4" />
                      Réseaux sociaux
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSocial}
                      disabled={saving}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {socials.map((social, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Nom (ex: LinkedIn)"
                        value={social.name}
                        onChange={(e) =>
                          updateSocial(index, "name", e.target.value)
                        }
                        disabled={saving}
                      />
                      <Input
                        placeholder="URL complète"
                        value={social.url}
                        onChange={(e) =>
                          updateSocial(index, "url", e.target.value)
                        }
                        disabled={saving}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSocial(index)}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Catégories d'intérêt */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Catégories d'intérêt</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map((category: CategoryType) => (
                      <div
                        key={category.key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={category.key}
                          checked={form.categoryKeys.includes(category.key)}
                          onCheckedChange={(checked) =>
                            handleCategoryChange(
                              category.key,
                              checked as boolean
                            )
                          }
                          disabled={saving}
                        />
                        <Label
                          htmlFor={category.key}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {category.name}
                          {category.trending && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Tendance
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-6">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
