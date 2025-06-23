"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Nom *</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Prénom *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Pseudo *</label>
          <input name="pseudo" value={form.pseudo} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Mot de passe *</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Image (URL)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Rôle</label>
          <input name="role" value={form.role} readOnly className="w-full border p-2 rounded bg-gray-100 text-gray-500" />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" disabled={saving} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
} 