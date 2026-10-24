import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, RotateCcw, X, ChevronLeft, ChevronRight, Package, ClipboardList } from "lucide-react";
import { Product, Order } from "@/lib/types";
import {
  getProducts, createProduct, updateProduct, deleteProduct, restoreProduct,
  getFilterOptions, ProductFilters, uploadProductImages,
} from "@/lib/productService";
import { getOrders, getOrderWithItems, updateOrderStatus, OrderFilters } from "@/lib/orderService";
import { useProducts } from "@/context/ProductsContext";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { signOut } from "@/lib/authService";

function cn(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(" ");
}

const PAGE_SIZE = 20;

function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => {
        setNotifications(data || []);
        setUnreadCount((data || []).filter(n => !n.read).length);
      });
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 hover:bg-secondary rounded-xl transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">{unreadCount}</span>
        )}
      </button>
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-2xl shadow-xl p-4 z-50">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-3">Recent Notifications</p>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          ) : notifications.map(n => (
            <div key={n.id} className={cn("p-3 rounded-xl mb-2", n.read ? "bg-white" : "bg-secondary")}>
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SHARED BITS ──────────────────────────────────────────────────────────

function inputCls(extra = "") {
  return cn(
    "w-full px-3 py-2 bg-white border-2 border-border rounded-lg text-sm text-foreground",
    "placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors",
    extra
  );
}

function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-muted-foreground">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="p-2 border-2 border-border rounded-lg disabled:opacity-40 hover:border-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold px-2">{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="p-2 border-2 border-border rounded-lg disabled:opacity-40 hover:border-primary transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── PRODUCT FORM (create / edit) ──────────────────────────────────────────

const EMPTY_FORM = {
  name: "", brand: "", sku: "", price: "", originalPrice: "",
  category: "men" as "men" | "accessories", subcategory: "", collection: "",
  images: "", sizes: "", colors: "", stock: "0", rating: "4.5", reviewCount: "0",
  isNew: false, isBestSeller: false, description: "", features: "",
};

function ProductFormModal({ product, onClose, onSaved }: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, brand: product.brand, sku: product.sku ?? "",
        price: String(product.price), originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        category: product.category, subcategory: product.subcategory, collection: product.collection,
        images: product.images.join(", "), sizes: product.sizes.join(", "), colors: product.colors.join(", "),
        stock: String(product.stock), rating: String(product.rating), reviewCount: String(product.reviewCount),
        isNew: !!product.isNew, isBestSeller: !!product.isBestSeller,
        description: product.description, features: product.features.join(", "),
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setNewFiles([]);
  }, [product]);

  const existingImages = form.images.split(",").map(s => s.trim()).filter(Boolean);

  function removeExistingImage(index: number) {
    const imgs = [...existingImages];
    imgs.splice(index, 1);
    setForm(f => ({ ...f, images: imgs.join(", ") }));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles(prev => [...prev, ...files]);
    e.target.value = "";
  }

  function removeNewFile(index: number) {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (existingImages.length === 0 && newFiles.length === 0) {
      toast.error("Please add at least one image.");
      return;
    }
    setSaving(true);
    try {
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        uploadedUrls = await uploadProductImages(newFiles);
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        sku: form.sku.trim() || null,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        subcategory: form.subcategory.trim(),
        collection: form.collection.trim(),
        images: finalImages,
        sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map(s => s.trim()).filter(Boolean),
        stock: Number(form.stock),
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount),
        isNew: form.isNew,
        isBestSeller: form.isBestSeller,
        description: form.description,
        features: form.features.split(",").map(s => s.trim()).filter(Boolean),
      };

      if (product) {
        await updateProduct(product.id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload as any);
        toast.success("Product created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-bold text-foreground">{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold uppercase mb-1 block">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls()} /></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Brand *</label>
              <input required value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className={inputCls()} /></div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="text-xs font-bold uppercase mb-1 block">SKU</label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inputCls()} /></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Price (₵) *</label>
              <input required type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputCls()} /></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Original Price (₵)</label>
              <input type="number" step="0.01" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className={inputCls()} placeholder="For sale items" /></div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="text-xs font-bold uppercase mb-1 block">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))} className={inputCls()}>
                <option value="men">Men</option>
                <option value="accessories">Accessories</option>
              </select></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Subcategory *</label>
              <input required value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} className={inputCls()} placeholder="Sneakers, Boots, ..." /></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Collection</label>
              <input value={form.collection} onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} className={inputCls()} placeholder="New Arrivals, Best Sellers, ..." /></div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase mb-1 block">Images *</label>
            
            {existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-border" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {newFiles.map((file, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-primary" />
                    <button
                      type="button"
                      onClick={() => removeNewFile(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm border-2 border-dashed border-border rounded-lg p-3 hover:border-primary transition-colors file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-accent"
            />
            <p className="text-xs text-muted-foreground mt-1">Select one or more images. They will be uploaded when you save.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-bold uppercase mb-1 block">Sizes (comma-separated)</label>
              <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} className={inputCls()} placeholder="6, 7, 8, 9, 10" /></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Colors (comma-separated)</label>
              <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} className={inputCls()} placeholder="Black, White, Navy" /></div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="text-xs font-bold uppercase mb-1 block">Stock *</label>
              <input required type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={inputCls()} /></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Rating</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className={inputCls()} /></div>
            <div><label className="text-xs font-bold uppercase mb-1 block">Review Count</label>
              <input type="number" value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))} className={inputCls()} /></div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} className="accent-primary w-4 h-4" /> New Arrival
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.isBestSeller} onChange={e => setForm(f => ({ ...f, isBestSeller: e.target.checked }))} className="accent-primary w-4 h-4" /> Best Seller
            </label>
          </div>

          <div><label className="text-xs font-bold uppercase mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls("resize-none")} rows={3} /></div>

          <div><label className="text-xs font-bold uppercase mb-1 block">Features (comma-separated)</label>
            <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} className={inputCls("resize-none")} rows={2} /></div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors disabled:opacity-50">
              {saving ? "Saving & Uploading…" : product ? "Save Changes" : "Create Product"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 border-2 border-border text-foreground text-sm font-bold uppercase rounded-xl hover:border-primary transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PRODUCTS TAB ───────────────────────────────────────────────────────────

function ProductsTab() {
  const { refetch: refetchStorefront } = useProducts();
  const [rows, setRows] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [collection, setCollection] = useState("");
  const [stockStatus, setStockStatus] = useState<"" | "in" | "low" | "out">("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");
  const [sortBy, setSortBy] = useState<ProductFilters["sortBy"]>("newest");

  const [options, setOptions] = useState({ categories: [] as string[], subcategories: [] as string[], collections: [] as string[], brands: [] as string[] });
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { getFilterOptions().then(setOptions).catch(() => {}); }, []);

  async function load() {
    setLoading(true);
    try {
      const filters: ProductFilters = {
        search: search || undefined,
        category: (category as any) || undefined,
        subcategory: subcategory || undefined,
        collection: collection || undefined,
        inStockOnly: stockStatus === "in" || undefined,
        lowStockOnly: stockStatus === "low" || undefined,
        outOfStockOnly: stockStatus === "out" || undefined,
        includeInactive: statusFilter !== "active",
        sortBy,
        page, pageSize: PAGE_SIZE,
      };
      const { products, total } = await getProducts(filters);
      const filtered = statusFilter === "inactive" ? products.filter(p => !p.isActive) : products;
      setRows(filtered);
      setTotal(statusFilter === "inactive" ? filtered.length : total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, category, subcategory, collection, stockStatus, statusFilter, sortBy, page]);
  useEffect(() => { setPage(1); }, [search, category, subcategory, collection, stockStatus, statusFilter, sortBy]);

  async function handleDelete(p: Product) {
    if (!confirm(`Deactivate "${p.name}"? It will be hidden from the storefront but kept in order history.`)) return;
    await deleteProduct(p.id);
    toast.success("Product deactivated");
    load(); refetchStorefront();
  }

  async function handleRestore(p: Product) {
    await restoreProduct(p.id);
    toast.success("Product restored");
    load(); refetchStorefront();
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, brand, SKU…" className={inputCls("pl-9")} />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Category</label>
          <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory(""); }} className={inputCls()}>
            <option value="">All</option>
            {options.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Subcategory</label>
          <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className={inputCls()}>
            <option value="">All</option>
            {options.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Collection</label>
          <select value={collection} onChange={e => setCollection(e.target.value)} className={inputCls()}>
            <option value="">All</option>
            {options.collections.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Stock</label>
          <select value={stockStatus} onChange={e => setStockStatus(e.target.value as any)} className={inputCls()}>
            <option value="">Any</option>
            <option value="in">In stock</option>
            <option value="low">Low stock (≤5)</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className={inputCls()}>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
            <option value="all">All</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Sort</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className={inputCls()}>
            <option value="newest">Newest</option>
            <option value="name-asc">Name A–Z</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="stock-asc">Stock: Low → High</option>
            <option value="stock-desc">Stock: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-accent transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary text-left">
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Product</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No products match these filters.</td></tr>
            ) : rows.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-[#FFFCF5] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-[#F5F0E8] rounded-lg overflow-hidden flex-shrink-0">
                      {p.images[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate max-w-[220px]">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}{p.sku ? ` · ${p.sku}` : ""}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category} / {p.subcategory}</td>
                <td className="px-4 py-3 font-semibold">₵{p.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold",
                    p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  )}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.isActive ? (
                    <span className="text-xs font-bold text-green-700">Active</span>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">Deactivated</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {p.isActive ? (
                      <button onClick={() => handleDelete(p)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-muted-foreground hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleRestore(p)} className="p-2 hover:bg-green-50 rounded-lg transition-colors text-muted-foreground hover:text-green-600">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />

      {showForm && (
        <ProductFormModal
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { load(); refetchStorefront(); }}
        />
      )}
    </div>
  );
}

// ─── ORDERS TAB ─────────────────────────────────────────────────────────────

const ORDER_STATUSES: Order["status"][] = ["pending", "processing", "in_transit", "delivered", "cancelled", "refunded"];

function OrdersTab() {
  const [rows, setRows] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<Order | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<OrderFilters["sortBy"]>("newest");

  async function load() {
    setLoading(true);
    try {
      const { orders, total } = await getOrders({
        search: search || undefined,
        status: (status as any) || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy, page, pageSize: PAGE_SIZE,
      });
      setRows(orders);
      setTotal(total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, status, dateFrom, dateTo, sortBy, page]);
  useEffect(() => { setPage(1); }, [search, status, dateFrom, dateTo, sortBy]);

  async function toggleExpand(order: Order) {
    if (expanded === order.id) { setExpanded(null); setExpandedOrder(null); return; }
    setExpanded(order.id);
    const full = await getOrderWithItems(order.id);
    setExpandedOrder(full);
  }

  async function handleStatusChange(order: Order, newStatus: Order["status"]) {
    await updateOrderStatus(order.id, newStatus);
    toast.success(`Order ${order.orderNumber} marked as ${newStatus.replace("_", " ")}`);
    load();
  }

  const statusColor: Record<Order["status"], string> = {
    pending: "bg-gray-100 text-gray-700",
    processing: "bg-blue-100 text-blue-700",
    in_transit: "bg-amber-100 text-amber-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Order #, email, name…" className={inputCls("pl-9")} />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls()}>
            <option value="">All</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Sort</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className={inputCls()}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="total-desc">Total: High → Low</option>
            <option value="total-asc">Total: Low → High</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary text-left">
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Order</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No orders match these filters.</td></tr>
            ) : rows.map(o => (
              <>
                <tr key={o.id} className="border-t border-border hover:bg-[#FFFCF5] transition-colors cursor-pointer" onClick={() => toggleExpand(o)}>
                  <td className="px-4 py-3 font-semibold text-foreground">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.firstName} {o.lastName}<br /><span className="text-xs">{o.email}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold">₵{o.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => handleStatusChange(o, e.target.value as Order["status"])}
                      className={cn("text-xs font-bold rounded-full px-3 py-1.5 border-0 focus:outline-none", statusColor[o.status])}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{expanded === o.id ? "▲" : "▼"}</td>
                </tr>
                {expanded === o.id && (
                  <tr className="bg-[#FFFCF5] border-t border-border">
                    <td colSpan={6} className="px-4 py-4">
                      {!expandedOrder ? (
                        <p className="text-sm text-muted-foreground">Loading items…</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground mb-2">{expandedOrder.address}, {expandedOrder.city}, {expandedOrder.state} · {expandedOrder.phone} · {expandedOrder.deliveryMethod} delivery · {expandedOrder.paymentMethod}</p>
                          {expandedOrder.items?.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm bg-white rounded-lg px-3 py-2 border border-border">
                              <span>{item.productName} — {item.color}, size {item.size} × {item.qty}</span>
                              <span className="font-semibold">₵{(item.unitPrice * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
    </div>
  );
}

// ─── ADMIN PAGE ROOT ────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<"products" | "orders">("products");

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-2">Admin</p>
          <h1 className="font-serif text-4xl font-bold text-foreground">Store Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={async () => {
              await signOut();
              window.location.reload();
            }}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary border-2 border-border hover:border-primary rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("products")}
          className={cn("flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl border-2 transition-colors",
            tab === "products" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary")}
        >
          <Package className="w-4 h-4" /> Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={cn("flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl border-2 transition-colors",
            tab === "orders" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary")}
        >
          <ClipboardList className="w-4 h-4" /> Orders
        </button>
      </div>

      {tab === "products" ? <ProductsTab /> : <OrdersTab />}
    </div>
  );
}