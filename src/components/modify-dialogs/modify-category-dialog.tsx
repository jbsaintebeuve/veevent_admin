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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Edit,
  Loader2,
  AlertCircle,
  Tag,
  Hash,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Category, CategoryUpdateRequest } from "@/types/category";
import { modifyCategory } from "@/services/category-service";
import { useAuth } from "@/hooks/use-auth";

interface ModifyCategoryDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModifyCategoryDialog({
  category,
  open,
  onOpenChange,
}: ModifyCategoryDialogProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    key: "",
    trending: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const { token } = useAuth();

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        description: category.description || "",
        key: category.key || "",
        trending: category.trending || false,
      });
    }
  }, [category]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setForm({ ...form, trending: checked });
  };

  const isFormValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.description.trim() !== "" &&
      form.key.trim() !== ""
    );
  }, [form]);

  const resetForm = () => {
    if (category) {
      setForm({
        name: category.name || "",
        description: category.description || "",
        key: category.key || "",
        trending: category.trending || false,
      });
    }
    setError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      throw new Error("Le nom de la catégorie est requis");
    }
    if (!form.description.trim()) {
      throw new Error("La description est requise");
    }
    if (!form.key.trim()) {
      throw new Error("La clé unique est requise");
    }
    if (!/^[a-z0-9-_]+$/.test(form.key)) {
      throw new Error(
        "La clé ne peut contenir que des lettres minuscules, chiffres, tirets et underscores"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!token) throw new Error("Token manquant");
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      validateForm();
      const payload: CategoryUpdateRequest = {
        name: form.name.trim(),
        description: form.description.trim(),
        key: form.key.trim(),
        trending: form.trending,
      };

      const patchUrl = category?._links?.self?.href;

      if (!patchUrl) throw new Error("Lien de modification HAL manquant");

      const result = await modifyCategory(patchUrl, payload, token);

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie modifiée avec succès !");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  if (!category) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la catégorie "{category.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                <Tag className="inline mr-1 h-4 w-4" />
                Nom de la catégorie *
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Sport, Musique, Conférence..."
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="key">
                <Hash className="inline mr-1 h-4 w-4" />
                Clé unique *
              </Label>
              <Input
                id="key"
                name="key"
                value={form.key}
                onChange={handleChange}
                placeholder="sport, musique, conference..."
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Identifiant unique en minuscules, sans espaces ni caractères
                spéciaux (a-z, 0-9, -, _)
              </p>
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
                placeholder="Décrivez cette catégorie d'événements..."
                rows={3}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="trending"
                checked={form.trending}
                onCheckedChange={handleCheckboxChange}
                disabled={loading}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="trending"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Catégorie en tendance
                </Label>
                <p className="text-xs text-muted-foreground">
                  Les catégories en tendance sont mises en avant dans
                  l'application
                </p>
              </div>
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
