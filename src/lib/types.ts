// ── App-facing types (camelCase — what components use) ──────────────────────

export interface Product {
  id: string;
  sku?: string | null;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: "men" | "accessories";
  subcategory: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  description: string;
  features: string[];
  collection: string;
  isActive: boolean;
}

// 👇 ADDED THIS BLOCK
export interface CartItem {
  id: string;
  product: Product;
  size: string;
  color: string;
  qty: number;
}

export interface OrderItem {
  id?: string;
  productId: string | null;
  productName: string;
  size: string;
  color: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  paystackReference?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  town?: string;
  deliveryMethod: "standard" | "express";
  paymentMethod: "card" | "transfer" | "cod";
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending" | "processing" | "in_transit" | "delivered" | "cancelled" | "refunded";
  createdAt: string;
  items?: OrderItem[];
}

// ── DB row shapes (snake_case — what Supabase returns) ──────────────────────

export interface ProductRow {
  id: string;
  sku: string | null;
  name: string;
  brand: string;
  price: number;
  original_price: number | null;
  category: "men" | "accessories";
  subcategory: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_best_seller: boolean;
  description: string;
  features: string[];
  collection: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  town: string | null;
  delivery_method: "standard" | "express";
  payment_method: "card" | "transfer" | "cod";
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: Order["status"];
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string;
  color: string;
  qty: number;
  unit_price: number;
}

// ── Mappers ───────────────────────────────────────────────────────────────

export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    price: Number(row.price),
    originalPrice: row.original_price !== null ? Number(row.original_price) : undefined,
    category: row.category,
    subcategory: row.subcategory,
    images: row.images ?? [],
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    stock: row.stock,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    isNew: row.is_new,
    isBestSeller: row.is_best_seller,
    description: row.description,
    features: row.features ?? [],
    collection: row.collection,
    isActive: row.is_active,
  };
}

// Converts app-shape product fields into a DB row payload (for insert/update).
// Omits id / created_at / updated_at which the DB manages.
export function productToRow(p: Partial<Product>) {
  const row: Record<string, unknown> = {};
  if (p.sku !== undefined) row.sku = p.sku;
  if (p.name !== undefined) row.name = p.name;
  if (p.brand !== undefined) row.brand = p.brand;
  if (p.price !== undefined) row.price = p.price;
  if (p.originalPrice !== undefined) row.original_price = p.originalPrice ?? null;
  if (p.category !== undefined) row.category = p.category;
  if (p.subcategory !== undefined) row.subcategory = p.subcategory;
  if (p.images !== undefined) row.images = p.images;
  if (p.sizes !== undefined) row.sizes = p.sizes;
  if (p.colors !== undefined) row.colors = p.colors;
  if (p.stock !== undefined) row.stock = p.stock;
  if (p.rating !== undefined) row.rating = p.rating;
  if (p.reviewCount !== undefined) row.review_count = p.reviewCount;
  if (p.isNew !== undefined) row.is_new = p.isNew;
  if (p.isBestSeller !== undefined) row.is_best_seller = p.isBestSeller;
  if (p.description !== undefined) row.description = p.description;
  if (p.features !== undefined) row.features = p.features;
  if (p.collection !== undefined) row.collection = p.collection;
  if (p.isActive !== undefined) row.is_active = p.isActive;
  return row;
}

export function orderFromRow(row: OrderRow, items: OrderItemRow[] = []): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    town: row.town ?? undefined,
    deliveryMethod: row.delivery_method,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    items: items.map(i => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      size: i.size,
      color: i.color,
      qty: i.qty,
      unitPrice: Number(i.unit_price),
    })),
  };
}

// ── Sneaker News & Stories Types ─────────────────────────────────────────────

export interface NewsArticle {
  id: string;
  title: string;
  subtitle?: string;
  brand?: string;
  sneakerModel?: string;
  imageUrl: string;
  excerpt: string;
  content: string;
  author?: string;
  publishedAt: string;
  tag?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface NewsArticleRow {
  id: string;
  title: string;
  subtitle: string | null;
  brand: string | null;
  sneaker_model: string | null;
  image_url: string;
  excerpt: string;
  content: string;
  author: string | null;
  published_at: string;
  tag: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function newsArticleFromRow(row: NewsArticleRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    brand: row.brand ?? undefined,
    sneakerModel: row.sneaker_model ?? undefined,
    imageUrl: row.image_url,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author ?? "Footwear Empire",
    publishedAt: row.published_at || new Date().toISOString(),
    tag: row.tag ?? "Exclusive Story",
    isFeatured: row.is_featured ?? false,
    isActive: row.is_active ?? true,
  };
}

export function newsArticleToRow(article: Partial<NewsArticle>): Partial<NewsArticleRow> {
  const row: Partial<NewsArticleRow> = {};
  if (article.id !== undefined) row.id = article.id;
  if (article.title !== undefined) row.title = article.title;
  if (article.subtitle !== undefined) row.subtitle = article.subtitle;
  if (article.brand !== undefined) row.brand = article.brand;
  if (article.sneakerModel !== undefined) row.sneaker_model = article.sneakerModel;
  if (article.imageUrl !== undefined) row.image_url = article.imageUrl;
  if (article.excerpt !== undefined) row.excerpt = article.excerpt;
  if (article.content !== undefined) row.content = article.content;
  if (article.author !== undefined) row.author = article.author;
  if (article.publishedAt !== undefined) row.published_at = article.publishedAt;
  if (article.tag !== undefined) row.tag = article.tag;
  if (article.isFeatured !== undefined) row.is_featured = article.isFeatured;
  if (article.isActive !== undefined) row.is_active = article.isActive;
  return row;
}
