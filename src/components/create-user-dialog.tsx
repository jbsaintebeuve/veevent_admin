"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Lock,
  Shield,
} from "lucide-react";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    pseudo: "",
    email: "",
    password: "",
    role: "User",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setForm({ ...form, role: value });
  };

  const resetForm = () => {
    setForm({
      lastName: "",
      firstName: "",
      pseudo: "",
      email: "",
      password: "",
      role: "User",
    });
    setError("");
  };

  // ✅ Validation des champs obligatoires
  const isFormValid = useMemo(() => {
    return (
      form.lastName.trim() !== "" &&
      form.firstName.trim() !== "" &&
      form.pseudo.trim() !== "" &&
      form.email.trim() !== "" &&
      form.password.trim() !== "" &&
      form.role !== ""
    );
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8090/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName: form.lastName.trim(),
          firstName: form.firstName.trim(),
          pseudo: form.pseudo.trim(),
          email: form.email.trim(),
          password: form.password.trim(),
          role: form.role,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || "Erreur lors de la création de l'utilisateur"
        );
      }

      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Utilisateur créé avec succès !");
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
            Créer un utilisateur
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel utilisateur à votre plateforme. Les champs
              marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Jean"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Pseudo */}
            <div className="grid gap-2">
              <Label htmlFor="pseudo">Pseudo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pseudo"
                  name="pseudo"
                  value={form.pseudo}
                  onChange={handleChange}
                  placeholder="jeandupont"
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jean.dupont@example.com"
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Rôle */}
            <div className="grid gap-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={form.role}
                onValueChange={handleSelectChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">Utilisateur</SelectItem>
                  <SelectItem value="Organizer">Organisateur</SelectItem>
                  <SelectItem value="Admin">Administrateur</SelectItem>
                  <SelectItem value="AuthService">
                    Service d'authentification
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" disabled={loading || !isFormValid}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer l'utilisateur
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
