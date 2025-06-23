"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryKey = params?.key;
  const [form, setForm] = useState({
    name: "",
    description: "",
    key: "",
    trending: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategory() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8090/categories/${categoryKey}`);
        if (!res.ok) throw new Error("Erreur lors du chargement de la catégorie");
        const data = await res.json();
        setForm({
          name: data.name || "",
          description: data.description || "",
          key: data.key || "",
          trending: data.trending || false,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (categoryKey) fetchCategory();
  }, [categoryKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8090/categories/${categoryKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          key: form.key,
          trending: form.trending,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification de la catégorie");
      router.push("/categories");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Éditer la catégorie</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Nom *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Clé *</label>
          <input name="key" value={form.key} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="trending" checked={form.trending} onChange={handleChange} id="trending" />
          <label htmlFor="trending" className="font-medium">Tendance</label>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" disabled={saving} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
} 