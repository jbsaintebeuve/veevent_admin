import { Category } from "@/types/category";

export function sortCategoriesByKey(categories: Category[]): Category[] {
  return [...categories].sort((a, b) =>
    a.key.localeCompare(b.key, "fr", {
      sensitivity: "base",
    })
  );
}

export function sortByKey<T extends { key: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.key.localeCompare(b.key, "fr", {
      sensitivity: "base",
    })
  );
}

export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, "fr", {
      sensitivity: "base",
    })
  );
}

export function sortBySelector<T>(
  items: T[],
  selector: (item: T) => string
): T[] {
  return [...items].sort((a, b) =>
    selector(a).localeCompare(selector(b), "fr", {
      sensitivity: "base",
    })
  );
}
