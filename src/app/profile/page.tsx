"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth"; // ✅ Utilisation du hook useAuth
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
  User,
  Mail,
  Lock,
  Image as ImageIcon,
  FileText,
  Shield,
  Save,
  AlertCircle,
  Loader2,
  Phone,
  Star,
  Globe,
  Plus,
  X,
} from "lucide-react";

// Interface pour les données profil utilisateur spécifique
interface UserProfileData {
  description?: string;
  phone?: string;
  imageUrl?: string;
  bannerUrl?: string;
  note?: number;
  socials?: string; // JSON string
  categoryKeys?: string[];
}

// Interface pour les catégories
interface Category {
  key: string;
  name: string;
  description: string;
  trending: boolean;
}

interface CategoriesApiResponse {
  _embedded: {
    categories: Category[];
  };
  _links: any;
  page: any;
}

// Interface pour les réseaux sociaux
interface Social {
  name: string;
  url: string;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("http://localhost:8090/categories");
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
  const data: CategoriesApiResponse = await res.json();
  return data._embedded?.categories || [];
}

export default function ProfilePage() {
  // ✅ Utilisation du hook useAuth au lieu de fetch manuel
  const { user, loading: authLoading, getToken } = useAuth();

  const [form, setForm] = useState({
    // Données de base (non modifiables - viennent de useAuth)
    lastName: "",
    firstName: "",
    pseudo: "",
    email: "",
    role: "",
    // Données du profil (modifiables)
    description: "",
    phone: "",
    imageUrl: "",
    bannerUrl: "",
    note: 0,
    categoryKeys: [] as string[],
  });
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Récupération des catégories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    async function fetchUserProfileData() {
      if (!user) return;

      setLoading(true);
      try {
        // ✅ Récupérer les données de profil depuis /users/{id}
        const token = getToken();
        const profileRes = await fetch(
          `http://localhost:8090/users/${user.id}`,
          {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        let profileData: UserProfileData = {};
        if (profileRes.ok) {
          profileData = await profileRes.json();
        }

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
        });

        // ✅ Parser les réseaux sociaux
        if (profileData.socials) {
          try {
            const parsedSocials = JSON.parse(profileData.socials);
            setSocials(Array.isArray(parsedSocials) ? parsedSocials : []);
          } catch {
            setSocials([]);
          }
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
      // ✅ Préparer le payload selon le format API
      const payload = {
        description: form.description.trim() || null,
        phone: form.phone.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        bannerUrl: form.bannerUrl.trim() || null,
        note: form.note,
        socials: socials.length > 0 ? JSON.stringify(socials) : null,
        categoryKeys: form.categoryKeys,
      };

      console.log("Payload envoyé:", payload); // Debug

      const token = getToken();

      // ✅ Utiliser PATCH au lieu de PUT
      const res = await fetch(`http://localhost:8090/users/${user.id}`, {
        method: "PATCH", // ✅ PATCH au lieu de PUT
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }

      toast.success("Profil mis à jour avec succès !");
    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Loading state avec authLoading
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
              <Card>
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

  // ✅ Si pas d'utilisateur connecté
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
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={form.imageUrl}
                    alt={`${form.firstName} ${form.lastName}`}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials() || "?"}
                  </AvatarFallback>
                </Avatar>
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
          <Card>
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
                        onChange={handleChange}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="imageUrl">
                        <ImageIcon className="inline mr-1 h-4 w-4" />
                        URL de l'avatar
                      </Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={handleChange}
                        placeholder="https://exemple.com/avatar.jpg"
                        disabled={saving}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bannerUrl">
                        <ImageIcon className="inline mr-1 h-4 w-4" />
                        URL de la bannière
                      </Label>
                      <Input
                        id="bannerUrl"
                        name="bannerUrl"
                        value={form.bannerUrl}
                        onChange={handleChange}
                        placeholder="https://exemple.com/banner.jpg"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Réseaux sociaux */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      <Globe className="inline mr-1 h-4 w-4" />
                      Réseaux sociaux
                    </h4>
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
                    {categories?.map((category) => (
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
