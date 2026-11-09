import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus, Search, Pencil, Trash2, X, Newspaper, Sparkles,
  Calendar, Tag, Eye, Upload, Image as ImageIcon
} from "lucide-react";
import { NewsArticle } from "@/lib/types";
import {
  getNewsArticles, createNewsArticle, updateNewsArticle,
  deleteNewsArticle, uploadNewsImage
} from "@/lib/newsService";

function cn(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(" ");
}

function inputCls(extra = "") {
  return cn(
    "w-full px-3 py-2 bg-card border-2 border-border rounded-lg text-sm text-foreground",
    "placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors",
    extra
  );
}

const EMPTY_NEWS_FORM = {
  title: "",
  subtitle: "",
  brand: "",
  sneakerModel: "",
  tag: "Exclusive Drop",
  imageUrl: "",
  excerpt: "",
  content: "",
  author: "Footwear Empire Editorial",
  isFeatured: false,
  isActive: true,
};

// ─── FORM MODAL ──────────────────────────────────────────────────────────────

interface NewsFormModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  onSaved: () => void;
}

function NewsFormModal({ article, onClose, onSaved }: NewsFormModalProps) {
  const [form, setForm] = useState(EMPTY_NEWS_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (article) {
      setForm({
        title: article.title || "",
        subtitle: article.subtitle || "",
        brand: article.brand || "",
        sneakerModel: article.sneakerModel || "",
        tag: article.tag || "Exclusive Drop",
        imageUrl: article.imageUrl || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        author: article.author || "Footwear Empire Editorial",
        isFeatured: !!article.isFeatured,
        isActive: article.isActive !== false,
      });
    } else {
      setForm(EMPTY_NEWS_FORM);
    }
  }, [article]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadNewsImage(file);
      setForm(prev => ({ ...prev, imageUrl: url }));
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image. Please check image format or enter image URL directly.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter an article title.");
      return;
    }
    if (!form.imageUrl.trim()) {
      toast.error("Please provide an image URL or upload an image.");
      return;
    }
    if (!form.excerpt.trim()) {
      toast.error("Please enter a short excerpt.");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Please enter the article story content.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        brand: form.brand.trim() || undefined,
        sneakerModel: form.sneakerModel.trim() || undefined,
        tag: form.tag.trim() || "Exclusive Drop",
        imageUrl: form.imageUrl.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        author: form.author.trim() || "Footwear Empire Editorial",
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      if (article) {
        await updateNewsArticle(article.id, payload);
        toast.success("Article updated successfully!");
      } else {
        await createNewsArticle(payload);
        toast.success("Article created successfully!");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#112419] border-2 border-border rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Sneaker Editorial</span>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {article ? "Edit Sneaker News / Story" : "New Sneaker News / Story"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Article Title *
            </label>
            <input
              required
              className={inputCls()}
              placeholder="e.g. Free The Youth x Air Jordan 16: Ghana's Movement Takes Flight"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Subtitle / Headline Quote (Optional)
            </label>
            <input
              className={inputCls()}
              placeholder="e.g. How the Tema collective merged West African grit with high-fashion storytelling"
              value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Brand / Collaboration
              </label>
              <input
                className={inputCls()}
                placeholder="e.g. Jordan Brand × Free The Youth"
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Sneaker Model
              </label>
              <input
                className={inputCls()}
                placeholder="e.g. Air Jordan 16 Retro"
                value={form.sneakerModel}
                onChange={e => setForm(f => ({ ...f, sneakerModel: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Tag / Category
              </label>
              <input
                className={inputCls()}
                placeholder="e.g. Ghanaian Heritage, Exclusive Drop, Collab"
                value={form.tag}
                onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Author
              </label>
              <input
                className={inputCls()}
                placeholder="e.g. Footwear Empire Editorial"
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
              />
            </div>
          </div>

          {/* Image Upload & URL */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Featured Image *
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className={inputCls("flex-1")}
                  placeholder="https://images.unsplash.com/... or paste image link"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                />
                <label className="px-3 py-2 bg-secondary hover:bg-accent text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors whitespace-nowrap">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {form.imageUrl && (
                <div className="relative aspect-[16/9] w-full max-w-xs rounded-xl overflow-hidden border border-border mt-2">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => toast.error("Could not load image from URL")}
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white">
                    Preview
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Short Excerpt * (Used in homepage teaser and cards)
            </label>
            <textarea
              required
              rows={2}
              className={inputCls("resize-none")}
              placeholder="Brief summary of the sneaker release and story..."
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Full Article Story * (Separate paragraphs with double Enter)
            </label>
            <textarea
              required
              rows={6}
              className={inputCls()}
              placeholder="Write the full sneaker story here. You can include quotes, history of the release, design details..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              Feature Prominently on Homepage
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              Active / Published
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-border rounded-xl text-sm font-semibold hover:border-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : article ? "Update Story" : "Publish Story"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ─── ADMIN NEWS TAB COMPONENT ───────────────────────────────────────────────

export default function AdminNewsTab() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadArticles() {
    setLoading(true);
    try {
      const data = await getNewsArticles({ onlyActive: false });
      setArticles(data);
    } catch (err) {
      toast.error("Failed to load news articles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    try {
      setDeletingId(id);
      await deleteNewsArticle(id);
      toast.success("Article deleted");
      await loadArticles();
    } catch {
      toast.error("Failed to delete article");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleFeatured(article: NewsArticle) {
    try {
      await updateNewsArticle(article.id, { isFeatured: !article.isFeatured });
      toast.success(article.isFeatured ? "Removed from featured" : "Set as featured story");
      await loadArticles();
    } catch {
      toast.error("Failed to update status");
    }
  }

  const filtered = articles.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.brand?.toLowerCase().includes(q) ||
      a.sneakerModel?.toLowerCase().includes(q) ||
      a.tag?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" /> Sneaker News & Articles
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage sneaker release stories, brand collaborations, and editorial articles.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingArticle(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-accent transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Story
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search stories by title, brand, or sneaker..."
          className={inputCls("pl-9")}
        />
      </div>

      {/* Articles List / Table */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading articles...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-black/15 rounded-2xl border border-border p-8 sm:p-12 text-center">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-foreground">No sneaker articles found</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {search ? "No stories matched your search query." : "Publish your first sneaker story or release article."}
          </p>
          <button
            onClick={() => { setEditingArticle(null); setIsModalOpen(true); }}
            className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:bg-accent transition-colors"
          >
            Create New Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(article => (
            <div
              key={article.id}
              className="bg-[#112419] border border-border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-primary/50"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-black/40 border border-white/10">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  {article.isFeatured && (
                    <span className="absolute top-1 left-1 bg-primary text-white p-0.5 rounded shadow">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1 text-[11px] uppercase tracking-wider">
                    {article.tag && (
                      <span className="font-bold text-primary">{article.tag}</span>
                    )}
                    {article.isFeatured && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className="font-bold text-yellow-400">Featured</span>
                      </>
                    )}
                    <span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1 normal-case">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base sm:text-lg text-foreground line-clamp-1">
                    {article.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {article.brand ? `${article.brand} · ` : ""}{article.sneakerModel ? `${article.sneakerModel} · ` : ""}{article.excerpt}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleToggleFeatured(article)}
                  title={article.isFeatured ? "Unfeature from homepage" : "Feature on homepage"}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1",
                    article.isFeatured
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
                      : "border-border text-muted-foreground hover:border-primary"
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {article.isFeatured ? "Featured" : "Feature"}
                </button>

                <button
                  onClick={() => {
                    setEditingArticle(article);
                    setIsModalOpen(true);
                  }}
                  className="p-2 border border-border hover:border-primary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit article"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(article.id)}
                  disabled={deletingId === article.id}
                  className="p-2 border border-border hover:border-red-500 rounded-lg text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create / Edit */}
      {isModalOpen && (
        <NewsFormModal
          article={editingArticle}
          onClose={() => {
            setIsModalOpen(false);
            setEditingArticle(null);
          }}
          onSaved={loadArticles}
        />
      )}

    </div>
  );
}
