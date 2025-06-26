// Fonction utilitaire pour récupérer les catégories depuis l'API
export interface Category {
  name: string;
  description: string;
  key: string;
  trending: boolean;
  [key: string]: any;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("http://localhost:8090/categories");
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
  const data = await res.json();
  // Extraction défensive
  let categories: any[] = [];
  if (data._embedded && Array.isArray(data._embedded.categories)) {
    categories = data._embedded.categories;
  } else if (data.categories && Array.isArray(data.categories)) {
    categories = data.categories;
  } else if (Array.isArray(data)) {
    categories = data;
  }
  return categories as Category[];
} 