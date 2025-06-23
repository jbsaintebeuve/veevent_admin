"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCityPage() {
  const router = useRouter();
  const params = useParams();
  const cityId = params?.id;
  const [form, setForm] = useState({
    name: "",
    region: "",
    postalCode: "",
    country: "France",
    latitude: "",
    longitude: "",
    imageUrl: "",
    bannerUrl: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCity() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8090/cities/${cityId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement de la ville");
        const data = await res.json();
        setForm({
          name: data.name || "",
          region: data.region || "",
          postalCode: data.postalCode || "",
          country: data.country || "France",
          latitude: data.location?.latitude?.toString() || "",
          longitude: data.location?.longitude?.toString() || "",
          imageUrl: data.imageUrl || "",
          bannerUrl: data.bannerUrl || "",
          content: data.content || "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (cityId) fetchCity();
  }, [cityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8090/cities/${cityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          region: form.region,
          postalCode: form.postalCode,
          country: form.country,
          location: {
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
          },
          imageUrl: form.imageUrl,
          bannerUrl: form.bannerUrl,
          content: form.content,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification de la ville");
      router.push("/cities");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Éditer la ville</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Nom *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Région *</label>
            <input name="region" value={form.region} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Code postal *</label>
            <input name="postalCode" value={form.postalCode} onChange={handleChange} required className="w-full border p-2 rounded" />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Pays *</label>
          <input name="country" value={form.country} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Latitude *</label>
            <input name="latitude" value={form.latitude} onChange={handleChange} required type="number" step="any" className="w-full border p-2 rounded" />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Longitude *</label>
            <input name="longitude" value={form.longitude} onChange={handleChange} required type="number" step="any" className="w-full border p-2 rounded" />
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Image (URL)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Bannière (URL)</label>
          <input name="bannerUrl" value={form.bannerUrl} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="content" value={form.content} onChange={handleChange} rows={3} className="w-full border p-2 rounded" />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" disabled={saving} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
} 