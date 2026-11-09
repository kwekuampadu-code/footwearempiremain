import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, Calendar, Tag, Sparkles, BookOpen, Clock, Share2 } from "lucide-react";
import { NewsArticle } from "@/lib/types";
import { getNewsArticles, getNewsArticleById, DEFAULT_NEWS_ARTICLES } from "@/lib/newsService";
import { Page } from "@/router/useAppNav";
import { toast } from "sonner";

interface NewsPageProps {
  articleId?: string;
  navigate: (p: Page, params?: Record<string, string>) => void;
}

export default function NewsPage({ articleId, navigate }: NewsPageProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(DEFAULT_NEWS_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(() => {
    if (articleId) return DEFAULT_NEWS_ARTICLES.find(a => a.id === articleId) || null;
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const list = await getNewsArticles({ onlyActive: true });
        setArticles(list);

        if (articleId) {
          const found = list.find(a => a.id === articleId) || await getNewsArticleById(articleId);
          setSelectedArticle(found);
        } else {
          setSelectedArticle(null);
        }
      } catch (err) {
        console.error("Error loading news:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [articleId]);

  function handleSelectArticle(article: NewsArticle) {
    setSelectedArticle(article);
    navigate("news", { id: article.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBackToList() {
    setSelectedArticle(null);
    navigate("news");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleShare(article: NewsArticle) {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  }

  const tags = ["all", ...Array.from(new Set(articles.map(a => a.tag).filter(Boolean) as string[]))];

  const filteredArticles = activeFilter === "all"
    ? articles
    : articles.filter(a => a.tag?.toLowerCase() === activeFilter.toLowerCase());

  const featured = articles.find(a => a.isFeatured) || articles[0];
  const gridArticles = filteredArticles.filter(a => a.id !== featured?.id);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading sneaker stories...</p>
        </div>
      </div>
    );
  }

  // ─── ARTICLE DETAIL VIEW ───────────────────────────────────────────────────
  if (selectedArticle) {
    const related = articles.filter(a => a.id !== selectedArticle.id).slice(0, 3);

    return (
      <div className="bg-[#0A1810] text-foreground min-h-screen py-10 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">

          {/* Back button */}
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to All Stories
          </button>

          {/* Article Header Card */}
          <div className="bg-[#112419] border border-border/80 rounded-3xl p-6 sm:p-10 lg:p-12 mb-12 shadow-2xl">
            {/*
              RESPONSIVE LAYOUT SPEC:
              - On bigger screens (laptop / desktop): Text on left side, Image on right side.
              - On small screens: Image at top, Article beneath it.
            */}
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

              {/* Text content: order-2 on mobile (beneath image), order-1 on lg (left side) */}
              <div className="w-full lg:w-7/12 order-2 lg:order-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-[11px] uppercase tracking-widest">
                  {selectedArticle.tag && (
                    <span className="font-bold text-primary">{selectedArticle.tag}</span>
                  )}
                  {selectedArticle.tag && selectedArticle.sneakerModel && (
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                  )}
                  {selectedArticle.sneakerModel && (
                    <span className="font-medium text-white/60">{selectedArticle.sneakerModel}</span>
                  )}
                  <span className="ml-auto flex items-center gap-1.5 normal-case tracking-wide text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(selectedArticle.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug mb-4">
                  {selectedArticle.title}
                </h1>

                {selectedArticle.subtitle && (
                  <p className="text-white/80 text-sm sm:text-base italic leading-relaxed mb-6 font-serif">
                    "{selectedArticle.subtitle}"
                  </p>
                )}

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                  {selectedArticle.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-muted-foreground">
                  <span>By <strong className="text-white font-medium">{selectedArticle.author || "Footwear Empire Editorial"}</strong></span>
                  <button
                    onClick={() => handleShare(selectedArticle)}
                    className="inline-flex items-center gap-1.5 text-primary hover:text-accent font-semibold transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share Story
                  </button>
                </div>
              </div>

              {/* Featured Image: order-1 on mobile (at top), order-2 on lg (right side) */}
              <div className="w-full lg:w-5/12 order-1 lg:order-2">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                  <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  {selectedArticle.brand && (
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider border border-white/10">
                      {selectedArticle.brand}
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Full Article Content */}
          <div className="bg-[#112419]/60 border border-border/60 rounded-3xl p-6 sm:p-12 mb-16">
            <div className="max-w-3xl mx-auto space-y-6 text-foreground/90 text-sm sm:text-base leading-relaxed">
              {selectedArticle.content.split("\n\n").map((para, i) => {
                if (para.startsWith("'") || para.startsWith('"')) {
                  return (
                    <blockquote key={i} className="my-6 pl-4 sm:pl-6 border-l-4 border-primary italic text-base sm:text-lg text-primary/95 font-serif py-1">
                      {para}
                    </blockquote>
                  );
                }
                return (
                  <p key={i} className="leading-relaxed text-white/90">
                    {para}
                  </p>
                );
              })}
            </div>

            <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Footwear Empire Editorial</p>
                <p className="text-sm text-white/70">Curating the pinnacle of sneaker heritage, African design, and global drops.</p>
              </div>
              <button
                onClick={() => navigate("shop", { category: "men", sub: "Sneakers" })}
                className="px-6 py-3 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors whitespace-nowrap"
              >
                Shop Sneakers
              </button>
            </div>
          </div>

          {/* Related Stories */}
          {related.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5" /> Continue Reading
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white">More Sneaker Stories</h3>
                </div>
                <button onClick={handleBackToList} className="text-xs font-bold tracking-wider text-muted-foreground hover:text-primary transition-colors">
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectArticle(item)}
                    className="group bg-[#112419] border border-border/80 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/60 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] uppercase tracking-wider mb-2">
                        {item.tag && <span className="font-bold text-primary">{item.tag}</span>}
                        {item.tag && item.sneakerModel && <span className="w-1 h-1 rounded-full bg-white/30" />}
                        {item.sneakerModel && <span className="text-white/60 font-medium">{item.sneakerModel}</span>}
                        <span className="ml-auto text-muted-foreground normal-case text-xs">
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {item.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        Read Story <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ─── NEWS FEED / LIST VIEW ─────────────────────────────────────────────────
  return (
    <div className="bg-[#0A1810] text-foreground min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Page Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Sneaker Wire & Culture
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            The Release Wire
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Exclusive drops, behind-the-design stories, and cultural milestones from Ghana and around the globe.
          </p>
        </div>

        {/* Filter Pills */}
        {tags.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-white/10">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-xl transition-all border ${activeFilter.toLowerCase() === tag.toLowerCase()
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-[#112419] border-border text-muted-foreground hover:text-white hover:border-primary/50"
                  }`}
              >
                {tag === "all" ? "All Stories" : tag}
              </button>
            ))}
          </div>
        )}

        {/* HERO FEATURED STORY */}
        {featured && (
          <div className="mb-16">
            <div className="bg-[#112419] border border-border/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden group">
              {/*
                RESPONSIVE LAYOUT SPEC:
                - On bigger screens (laptop / desktop): Text on left side, Image on right side.
                - On small screens: Image at top, Article beneath it.
              */}
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

                {/* Text on left side on desktop, beneath image on small screens */}
                <div className="w-full lg:w-7/12 order-2 lg:order-1 flex flex-col justify-center">
                  <div className="flex items-center gap-x-3 gap-y-1 mb-4 text-[11px] uppercase tracking-widest">
                    <span className="font-bold text-primary">Featured Release</span>
                    {featured.tag && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className="font-medium text-white/60">{featured.tag}</span>
                      </>
                    )}
                    <span className="ml-auto flex items-center gap-1.5 normal-case tracking-wide text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featured.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-primary/90 transition-colors">
                    {featured.title}
                  </h2>

                  {featured.subtitle && (
                    <p className="text-white/70 text-sm sm:text-base italic leading-relaxed mb-4 font-serif">
                      {featured.subtitle}
                    </p>
                  )}

                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 line-clamp-3">
                    {featured.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => handleSelectArticle(featured)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-all shadow-md group/btn"
                    >
                      Read Full Story <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                    {featured.brand && (
                      <span className="text-xs text-muted-foreground tracking-wider uppercase font-semibold">
                        Brand: <span className="text-white">{featured.brand}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Image on right side on desktop, top on small screens */}
                <div className="w-full lg:w-5/12 order-1 lg:order-2">
                  <div
                    onClick={() => handleSelectArticle(featured)}
                    className="relative aspect-[16/10] lg:aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer"
                  >
                    <img
                      src={featured.imageUrl}
                      alt={featured.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    {featured.sneakerModel && (
                      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-xs font-bold text-white border border-white/10">
                        {featured.sneakerModel}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Grid of Other Articles */}
        {gridArticles.length > 0 && (
          <div>
            <h3 className="font-serif text-2xl font-bold text-white mb-6">Latest Drops & Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gridArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => handleSelectArticle(article)}
                  className="group bg-[#112419] border border-border/80 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/60 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/20">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] uppercase tracking-wider mb-2">
                      {article.tag && <span className="font-bold text-primary">{article.tag}</span>}
                      {article.tag && article.sneakerModel && <span className="w-1 h-1 rounded-full bg-white/30" />}
                      {article.sneakerModel && <span className="text-white/60 font-medium">{article.sneakerModel}</span>}
                      <span className="ml-auto text-muted-foreground normal-case text-xs">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {article.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-xs font-semibold text-primary inline-flex items-center gap-1.5 group-hover:underline">
                        Read Story <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                      {article.sneakerModel && (
                        <span className="text-[11px] text-white/50 tracking-wide uppercase">
                          {article.sneakerModel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
