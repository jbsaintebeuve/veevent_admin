"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    pseudo: "",
    email: "",
    password: "",
    imageUrl: "",
    description: "",
    role: "Organizer",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchMe() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8090/users/me");
        if (!res.ok) throw new Error("Erreur lors du chargement du profil");
        const data = await res.json();
        setForm({
          lastName: data.lastName || "",
          firstName: data.firstName || "",
          pseudo: data.pseudo || "",
          email: data.email || "",
          password: "",
          imageUrl: data.imageUrl || "",
          description: data.description || "",
          role: data.role || "Organizer",
        });
      } catch (err: any) {
        setError(err.message);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8090/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName: form.lastName,
          firstName: form.firstName,
          pseudo: form.pseudo,
          email: form.email,
          password: form.password,
          imageUrl: form.imageUrl,
          description: form.description,
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de la modification du profil");

      toast.success("Profil mis à jour avec succès !");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
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
                  {[...Array(6)].map((_, i) => (
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
        {" "}
        {/* ← Même padding que dashboard */}
        <div className="mx-auto w-full max-w-2xl">
          {/* Header Section - Style dashboard */}
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
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Modifiez vos informations personnelles et de compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nom et Prénom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom"
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Votre prénom"
                      disabled={saving}
                    />
                  </div>
                </div>

                <Separator />

                {/* Identifiants */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pseudo">Pseudo *</Label>
                    <Input
                      id="pseudo"
                      name="pseudo"
                      value={form.pseudo}
                      onChange={handleChange}
                      required
                      placeholder="Votre pseudo"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="votre@email.com"
                      disabled={saving}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Nouveau mot de passe"
                      disabled={saving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour conserver le mot de passe actuel
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Informations additionnelles */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">URL de l'avatar</Label>
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
                    <Label htmlFor="description">Description</Label>
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

                  <div className="grid gap-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Input
                      id="role"
                      name="role"
                      value={form.role}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Le rôle ne peut pas être modifié
                    </p>
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
