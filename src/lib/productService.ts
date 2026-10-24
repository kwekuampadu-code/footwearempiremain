import { supabase } from "./supabaseClient";
import { Product, ProductRow, productFromRow, productToRow } from "./types";

export interface ProductFilters {
  category?: "men" | "accessories";
  subcategory?: string;
  collection?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  lowStockOnly?: boolean;
  lowStockThreshold?: number;
  outOfStockOnly?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  includeInactive?: boolean;
  sortBy?: "featured" | "price-asc" | "price-desc" | "rating" | "newest" | "stock-asc" | "stock-desc" | "name-asc";
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  products: Product[];
  total: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
  const {
    category, subcategory, collection, search,
    minPrice, maxPrice,
    inStockOnly, lowStockOnly, lowStockThreshold = 5, outOfStockOnly,
    isNew, isBestSeller, includeInactive,
    sortBy = "featured",
    page, pageSize,
  } = filters;

  let query = supabase.from("products").select("*", { count: "exact" });

  if (!includeInactive) query = query.eq("is_active", true);
  if (category) query = query.eq("category", category);
  if (subcategory) query = query.eq("subcategory", subcategory);
  if (collection) query = query.eq("collection", collection);
  if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,sku.ilike.%${search}%`);
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  if (isNew !== undefined) query = query.eq("is_new", isNew);
  if (isBestSeller !== undefined) query = query.eq("is_best_seller", isBestSeller);
  if (outOfStockOnly) query = query.eq("stock", 0);
  else if (lowStockOnly) query = query.gt("stock", 0).lte("stock", lowStockThreshold);
  else if (inStockOnly) query = query.gt("stock", 0);

  switch (sortBy) {
    case "price-asc": query = query.order("price", { ascending: true }); break;
    case "price-desc": query = query.order("price", { ascending: false }); break;
    case "rating": query = query.order("rating", { ascending: false }); break;
    case "newest": query = query.order("created_at", { ascending: false }); break;
    case "stock-asc": query = query.order("stock", { ascending: true }); break;
    case "stock-desc": query = query.order("stock", { ascending: false }); break;
    case "name-asc": query = query.order("name", { ascending: true }); break;
    default: query = query.order("is_best_seller", { ascending: false }).order("created_at", { ascending: false });
  }

  if (page !== undefined && pageSize !== undefined) {
    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    products: (data as ProductRow[]).map(productFromRow),
    total: count ?? data.length,
  };
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? productFromRow(data as ProductRow) : null;
}

export async function getFilterOptions() {
  const { data, error } = await supabase.from("products").select("category, subcategory, collection, brand");
  if (error) throw error;
  const uniq = (key: "category" | "subcategory" | "collection" | "brand") =>
    Array.from(new Set((data ?? []).map((r: any) => r[key]).filter(Boolean))).sort();
  return {
    categories: uniq("category"),
    subcategories: uniq("subcategory"),
    collections: uniq("collection"),
    brands: uniq("brand"),
  };
}

export async function createProduct(product: Omit<Product, "id" | "isActive"> & { isActive?: boolean }): Promise<Product> {
  const row = productToRow({ isActive: true, ...product });
  const { data, error } = await supabase.from("products").insert(row).select().single();
  if (error) throw error;
  return productFromRow(data as ProductRow);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const row = productToRow(updates);
  const { data, error } = await supabase.from("products").update(row).eq("id", id).select().single();
  if (error) throw error;
  return productFromRow(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
  if (error) throw error;
}

export async function hardDeleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function restoreProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").update({ is_active: true }).eq("id", id);
  if (error) throw error;
}

export async function adjustStock(id: string, delta: number): Promise<Product> {
  const current = await getProductById(id);
  if (!current) throw new Error("Product not found");
  const nextStock = Math.max(0, current.stock + delta);
  return updateProduct(id, { stock: nextStock });
}

// ── NEW: Upload images to Supabase Storage ───────────────────────────────────
export async function uploadProductImages(files: File[]): Promise<string[]> {
  const BUCKET = "product-images"; // 👈 Make sure this matches your Supabase bucket name
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}