import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppNav, Page } from "@/router/useAppNav";
import AdminGuard from "@/components/AdminGuard";
import logoImage1 from "@/imports/footwearempire-logo.png";
import logoImage from "@/imports/footwearempirelogowhite.png";
import boots from "@/imports/boots.jpg";
import loafers from "@/imports/loafers.jpg";
import formal from "@/imports/formal.jpg";
import accessories from "@/imports/accessories.jpg";
import sandals from "@/imports/sandals.jpg";
import rightimage from "@/imports/rightimage.png";
import { Product, CartItem } from "@/lib/types";
import { ProductsProvider, useProducts } from "@/context/ProductsContext";
import { createOrder } from "@/lib/orderService"; // For the CheckoutPage
import AdminPage from "@/pages/AdminPage";
import { usePaystackPayment } from "react-paystack";
import { PAYSTACK_PUBLIC_KEY } from "@/lib/paystackConfig";
import { notifyOwner } from "@/lib/notificationService";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { getOrders } from "@/lib/orderService"; // Make sure this is imported
import { Order } from "@/lib/types";
import LoadingScreen from "@/components/LoadingScreen";



import {
  ShoppingBag, Heart, User, Search, Menu, X, Star,
  ChevronDown, ChevronRight, ChevronLeft, Minus, Plus,
  Trash2, MapPin, Phone, Mail, MessageCircle, Instagram,
  Facebook, Package, RotateCcw, Shield, Truck, Check,
  ArrowRight, Tag, SlidersHorizontal, Send, Ruler,
  RefreshCw, Headphones, Clock, Globe, Quote,
} from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { toast, Toaster } from "sonner";

// ─── ANIMATION HOOK ───────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const img = (id: string, w = 600, h = 700) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;


const formatPrice = (n: number) => "₵" + n.toLocaleString();

function cn(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(" ");
}


const COLLECTIONS_DATA = [
  { id: "new", name: "New Arrivals", desc: "Just dropped", image: img("1606107557195-0e29a4b5b4aa", 800, 600) },
  { id: "trending", name: "Trending Now", desc: "Everyone's wearing", image: img("1560769629-975ec94e6a86", 800, 600) },
  { id: "bestsellers", name: "Best Sellers", desc: "Customer favourites", image: img("1491553895911-0055eca6402d", 800, 600) },
  { id: "premium", name: "Premium", desc: "Crafted to last", image: img("1515347619252-60a4bf4fff4f", 800, 600) },
  { id: "budget", name: "Budget Finds", desc: "Style at every price", image: img("1542291026-7b4e19079ae2", 800, 600) },
  { id: "office", name: "Office Wear", desc: "Boardroom-ready", image: img("1543163521-1bf539c55dd2", 800, 600) },
  { id: "casual", name: "Casual", desc: "Weekend essentials", image: img("1608231387042-66d1773d3028", 800, 600) },
  { id: "sports", name: "Sports", desc: "Performance footwear", image: img("1515347619252-60a4bf4fff4f", 800, 600) },
];

const TESTIMONIALS = [
  { id: "t1", name: "Philippa Asante", rating: 5, date: "12 Jun 2025", text: "The Chelsea boot arrived in 2 days and fits like it was made for me. Premium quality at a fair price — already eyeing a second pair." },
  { id: "t2", name: "Isabella Dumfeh", rating: 5, date: "3 Jul 2025", text: "Footwear Empire is my go-to. Customer service was brilliant when I needed to exchange a size — replacement arrived the next day." },
  { id: "t3", name: "Thomas Cornellius", rating: 5, date: "8 Jul 2025", text: "The Air Strider Pros are incredible — light as a feather and still supportive. Worth every single penny." },
  { id: "t4", name: "Zainab Yusif", rating: 4, date: "30 Jun 2025", text: "Packaging was lovely — shoes came in a dust bag and the box was pristine. Feels like a luxury unboxing every time." },
  { id: "t5", name: "Dennis Laryea", rating: 5, date: "25 May 2025", text: "Finally a Ghanaian footwear store that actually delivers what they promise. Fast shipping, genuine products, great prices." },
  { id: "t6", name: "Olivia Ampadu", rating: 4, date: "19 Jun 2025", text: "Ordered the Desert Trek Boots on Tuesday, had them by Thursday. Very impressed with the quality and the speed of delivery." },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function StarRating({ rating, count, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn(sz, i <= Math.round(rating) ? "fill-amber-500 text-amber-500" : "fill-gray-200 text-gray-200")} />
      ))}
      {count !== undefined && <span className="text-xs text-muted-foreground ml-1">({count})</span>}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">{children}</p>
  );
}

function SectionHeading({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2 className={cn("font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight", center && "text-center")}>
      {children}
    </h2>
  );
}

function ProductBadge({ type }: { type: "new" | "sale" | "best" }) {
  const styles = {
    new: "bg-primary text-white",
    sale: "bg-red-600 text-white",
    best: "bg-amber-500 text-white",
  };
  const labels = { new: "New", sale: "Sale", best: "Best Seller" };
  return (
    <span className={cn("px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full", styles[type])}>
      {labels[type]}
    </span>
  );
}

function ProductCard({ product, navigate, onAddToCart }: {
  product: Product;
  navigate: (p: Page, params?: Record<string, string>) => void;
  onAddToCart: (p: Product, size: string, color: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate("product", { id: product.id })}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F5F0E8] aspect-[4/5]">
        <img
          src={hovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && <ProductBadge type="new" />}
          {product.isBestSeller && <ProductBadge type="best" />}
          {discount && <ProductBadge type="sale" />}
        </div>
        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors shadow-sm"
          onClick={e => { e.stopPropagation(); toast.success("Added to wishlist"); }}
        >
          <Heart className="w-3.5 h-3.5" />
        </button>
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            className="w-full py-3 bg-foreground text-background text-xs font-bold tracking-[0.15em] uppercase hover:bg-primary hover:text-white transition-colors"
            onClick={e => { e.stopPropagation(); onAddToCart(product, product.sizes[0], product.colors[0]); }}
          >
            Quick Add
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">{product.brand}</p>
        <h3 className="text-sm font-semibold text-foreground mb-2 truncate">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <StarRating rating={product.rating} />
        </div>
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar({ currentPage, navigate, cartCount }: {
  currentPage: Page;
  navigate: (p: Page, params?: Record<string, string>) => void;
  cartCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const shopCategories = [
    { label: "Men", subs: ["Sneakers", "Loafers", "Sandals", "Slippers", "Boots", "Formal Shoes"] },
    { label: "Accessories", subs: ["Socks", "Shoe Polish", "Insoles", "Shoe Bags"] },
  ];

  const navLinks: { label: string; page: Page }[] = [
    { label: "Collections", page: "collections" },
    { label: "About", page: "about" },
    { label: "Size Guide", page: "size-guide" },
    { label: "Contact", page: "contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button onClick={() => navigate("home")} className="flex items-center flex-shrink-0 gap-3">
            <img src={logoImage1} alt="Footwear Empire" className="h-26 w-auto object-contain" />
            <span className="sr-only">Footwear Empire</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <div
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-secondary transition-colors py-2">
                Shop <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {shopOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 bg-white border border-border rounded-2xl p-6 shadow-2xl grid grid-cols-2 gap-6">
                  {shopCategories.map(cat => (
                    <div key={cat.label}>
                      <button
                        className="text-xs font-bold tracking-widest uppercase text-foreground mb-3 hover:text-secondary transition-colors block"
                        onClick={() => { navigate("shop", { category: cat.label.toLowerCase() }); setShopOpen(false); }}
                      >
                        {cat.label}
                      </button>
                      <ul className="space-y-2">
                        {cat.subs.map(sub => (
                          <li key={sub}>
                            <button
                              className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                              onClick={() => { navigate("shop", { category: cat.label.toLowerCase(), sub }); setShopOpen(false); }}
                            >
                              {sub}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={cn(
                  "text-sm font-medium transition-colors py-2",
                  currentPage === link.page ? "text-secondary border-b-2 border-secondary" : "text-foreground hover:text-secondary"
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="hidden sm:flex p-2.5 text-muted-foreground hover:text-secondary transition-colors rounded-xl hover:bg-secondary">
              <Search className="w-4.5 h-4.5" />
            </button>
            <button
              className="p-2.5 text-muted-foreground hover:text-secondary transition-colors rounded-xl hover:bg-secondary"
              onClick={() => navigate("account")}
            >
              <User className="w-4.5 h-4.5" />
            </button>
            <button
              className="relative p-2.5 text-muted-foreground hover:text-secondary transition-colors rounded-xl hover:bg-secondary"
              onClick={() => navigate("cart")}
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="lg:hidden p-2.5 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="px-5 py-4 space-y-0.5">
            {[
              { label: "Home", action: () => navigate("home") },
              { label: "Men's Shoes", action: () => navigate("shop", { category: "men" }) },
              { label: "Accessories", action: () => navigate("shop", { category: "accessories" }) },
              { label: "Collections", action: () => navigate("collections") },
              { label: "About Us", action: () => navigate("about") },
              { label: "Size Guide", action: () => navigate("size-guide") },
              { label: "Contact", action: () => navigate("contact") },
            ].map(item => (
              <button
                key={item.label}
                className="w-full text-left py-3 text-sm font-medium text-foreground hover:text-primary transition-colors border-b border-border last:border-0"
                onClick={() => { item.action(); setMenuOpen(false); }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer({ navigate }: { navigate: (p: Page, params?: Record<string, string>) => void }) {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#1A1208] text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="items-center justify-center px-5 py-3 mb-5">
              <img src={logoImage} alt="Footwear Empire" className="h-28 w-auto object-contain" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              Premium footwear for every occasion, delivered nationwide with care and confidence.
            </p>
            <div className="flex items-center gap-2">
              {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-primary hover:text-white transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-5">Shop</p>
            <ul className="space-y-3">
              {[
                { label: "Men's Shoes", cat: "men" },
                { label: "Accessories", cat: "accessories" },
                { label: "New Arrivals", cat: "men" },
                { label: "Best Sellers", cat: "men" },
                { label: "Sale", cat: "men" },
              ].map(c => (
                <li key={c.label}>
                  <button onClick={() => navigate("shop", { category: c.cat })} className="text-sm text-white/60 hover:text-white transition-colors">
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-5">Help</p>
            <ul className="space-y-3">
              {[
                { label: "About Us", page: "about" as Page },
                { label: "Delivery & Returns", page: "delivery" as Page },
                { label: "Size Guide", page: "size-guide" as Page },
                { label: "FAQ", page: "faq" as Page },
                { label: "Contact Us", page: "contact" as Page },
              ].map(l => (
                <li key={l.page}>
                  <button onClick={() => navigate(l.page)} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-5">Newsletter</p>
            <p className="text-sm text-white/60 mb-4 leading-relaxed">Subscribe for exclusive offers and the latest arrivals.</p>
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-4 py-3 text-base bg-white/5 text-white placeholder:text-white/30 focus:outline-none"
              />
              <button
                onClick={() => { if (email) { toast.success("Subscribed!"); setEmail(""); } }}
                className="px-4 py-3 bg-primary text-white hover:bg-accent transition-colors flex-shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2025 Footwear Empire. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="text-xs text-white/30 hover:text-white transition-colors">Privacy Policy</button>
            <button className="text-xs text-white/30 hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage({ navigate, addToCart }: {
  navigate: (p: Page, params?: Record<string, string>) => void;
  addToCart: (p: Product, size: string, color: string) => void;
}) {
  const { products, loading } = useProducts(); // 👈 ADD THIS LINE

  // 👇 ADD THIS BLOCK (Optional: handles the split-second while fetching from Supabase)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading store...</p>
      </div>
    );
  }

  const newArrivals = products.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const categories = [
    { label: "Sneakers", img: img("1491553895911-0055eca6402d", 500, 640), sub: "Sneakers", cat: "men" },
    { label: "Formal", img: formal, sub: "Formal Shoes", cat: "men" },
    { label: "Boots", img: boots, sub: "Boots", cat: "men" },
    { label: "Loafers", img: loafers, sub: "Loafers", cat: "men" },
    { label: "Sandals", img: sandals, sub: "Sandals", cat: "men" },
    { label: "Accessories", img: accessories, cat: "accessories" },
  ];

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="grid lg:grid-cols-2 min-h-[75vh] lg:min-h-[75vh]">
        {/* Left: copy */}
        <div className="flex flex-col bg-[#FFFCF5] order-2 lg:order-1">

          {/* Hero copy — centred in remaining space */}
          <div className="flex flex-col justify-start flex-1 px-8 md:px-14 lg:px-16 pt-12 pb-16">
            <div className="max-w-lg">
              <div className="animate-fade-slide-down" style={{ animationDelay: "100ms" }}>
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-secondary mb-5 lg:mb-8">
                  <span className="w-8 h-px bg-secondary" /> New Season 2025
                </span>
              </div>
              <div style={{ opacity: 0, animation: "fadeSlideDown 0.7s ease 250ms forwards" }}>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground leading-[1.08] mb-5 lg:mb-8">
                  Walk With<br />
                  <em className="not-italic text-secondary">Confidence</em>
                </h1>
              </div>
              <div style={{ opacity: 0, animation: "fadeSlideDown 0.7s ease 400ms forwards" }}>
                <p className="text-muted-foreground text-base leading-relaxed mb-8 lg:mb-12 max-w-md">
                  Premium footwear for the modern man. Handpicked styles, genuine quality, fast nationwide delivery.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mb-10 lg:mb-16" style={{ opacity: 0, animation: "fadeSlideDown 0.7s ease 550ms forwards" }}>
                <button
                  onClick={() => navigate("shop")}
                  className="px-7 py-3.5 bg-secondary text-white text-sm font-semibold tracking-wider uppercase rounded-xl hover:bg-accent hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/20 animate-pulse-ring"
                >
                  Shop the Collection
                </button>
                <button
                  onClick={() => navigate("collections")}
                  className="px-7 py-3.5 text-secondary text-sm font-semibold tracking-wider uppercase rounded-xl border-2 border-secondary hover:border-secondary/80 hover:text-secondary hover:scale-105 active:scale-95 transition-all"
                >
                  Explore Edits
                </button>
              </div>
              <div className="flex items-center gap-15 pt-6 lg:pt-10 border-t border-border" style={{ opacity: 0, animation: "fadeSlideDown 0.7s ease 700ms forwards" }}>
                {[
                  { value: "200+", label: "Styles" },
                  { value: "5K+", label: "Customers" },
                  { value: "20+", label: "Cities" },
                ].map(s => (
                  <div key={s.label} className="hover:scale-110 transition-transform cursor-default">
                    <p className="font-serif text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground tracking-widest uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: lifestyle image — desktop only */}
        <div className="hidden lg:block relative overflow-hidden bg-[#FFFCF5] order-2">
          <img
            src={rightimage}
            alt="Nike sneakers on wall"
            className="w-full h-full object-contain p-10 -translate-y-16 transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders over ₵999.99" },
              { icon: RotateCcw, title: "3-Day Returns", desc: "Hassle-free exchanges" },
              { icon: Shield, title: "100% Genuine", desc: "Quality guaranteed" },
              { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 px-6 py-5">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <FadeUp className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel>Browse by Style</SectionLabel>
            <SectionHeading>Shop by Category</SectionHeading>
          </div>
          <button onClick={() => navigate("shop")} className="hidden sm:flex items-center gap-2 text-sm font-semibold text-secondary hover:text-accent transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </FadeUp>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <FadeUp key={cat.label} delay={i * 80}>
              <button
                onClick={() => navigate("shop", cat.sub ? { category: cat.cat!, sub: cat.sub } : { category: cat.cat! })}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] text-left shadow-sm hover:shadow-lg transition-all duration-300 w-full"
              >
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-bold uppercase tracking-wide text-white">{cat.label}</p>
                </div>
              </button>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────────────────────── */}
      <section className="bg-[#F8F3E8] py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <SectionLabel>Fresh In</SectionLabel>
              <SectionHeading>New Arrivals</SectionHeading>
            </div>
            <button onClick={() => navigate("collections")} className="hidden sm:flex items-center gap-2 text-sm font-semibold text-secondary hover:text-accent transition-colors">
              See All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {newArrivals.map((p, i) => <FadeUp key={p.id} delay={i * 100}><ProductCard product={p} navigate={navigate} onAddToCart={addToCart} /></FadeUp>)}
          </div>
        </div>
      </section>

      {/* ── EDITORIAL BANNER ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#1A1208] grid lg:grid-cols-5">
          <div className="lg:col-span-3 p-10 lg:p-16 flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-6">
              <span className="w-6 h-px bg-accent" /> Empire Prestige Line
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
              Handcrafted<br />for the Discerning<br /><em className="text-accent not-italic">Gentleman</em>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-8 max-w-md">
              Full-grain leather, Goodyear welt construction, and hand-burnished finishes. Shoes that only get better with time.
            </p>
            <button
              onClick={() => navigate("shop", { category: "men", sub: "Formal Shoes" })}
              className="inline-flex items-center gap-3 px-8 py-4 bg-secondary text-white text-sm font-semibold tracking-wider uppercase rounded-xl hover:bg-accent transition-colors w-fit shadow-lg shadow-secondary/20"
            >
              Shop Formal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden lg:block lg:col-span-2 relative overflow-hidden">
            <img
              src={img("1515347619252-60a4bf4fff4f", 700, 600)}
              alt="Premium formal shoes"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1208]/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel>Most Loved</SectionLabel>
            <SectionHeading>Best Sellers</SectionHeading>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {bestSellers.map((p, i) => <FadeUp key={p.id} delay={i * 100}><ProductCard product={p} navigate={navigate} onAddToCart={addToCart} /></FadeUp>)}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="bg-[#1A1208] pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <SectionLabel>What Customers Say</SectionLabel>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">Trusted by Thousands</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.id} delay={i * 100}>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                  <Quote className="w-8 h-8 text-primary/60 mb-4" />
                  <p className="text-sm text-white/70 leading-relaxed mb-5">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <StarRating rating={t.rating} />
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="bg-secondary py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <SectionLabel>Stay in the Loop</SectionLabel>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Get 10% Off Your First Order</h2>
          <p className="text-muted-foreground text-sm mb-8">Subscribe for exclusive deals, early access to new arrivals, and style tips.</p>
          <div className="flex gap-0 rounded-xl overflow-hidden shadow-sm border border-border max-w-md mx-auto">
            <input
              placeholder="Enter your email address"
              className="flex-1 px-5 py-4 text-base bg-white text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="px-6 py-4 bg-primary text-white text-xs font-bold tracking-widest uppercase hover:bg-accent transition-colors flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────

function ShopPage({ navigate, addToCart, category, sub, collection }: {
  navigate: (p: Page, params?: Record<string, string>) => void;
  addToCart: (p: Product, size: string, color: string) => void;
  category?: string;
  sub?: string;
  collection?: string;
}) {
  const { products, loading } = useProducts(); // 👈 ADD THIS LINE

  // 👇 ADD THIS BLOCK (Optional: handles the split-second while fetching from Supabase)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  const [activeCategory, setActiveCategory] = useState(category || "all");
  const [activeSub, setActiveSub] = useState(sub || "");
  const [activeCollection, setActiveCollection] = useState(collection || "");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(30000);

  useEffect(() => {
    setActiveCategory(category || "all");
    setActiveSub(sub || "");
    setActiveCollection(collection || "");
  }, [category, sub, collection]);

  const categories = [
    { id: "all", label: "All Products", subs: [] },
    { id: "men", label: "Men", subs: ["Sneakers", "Loafers", "Sandals", "Slippers", "Boots", "Formal Shoes"] },
    { id: "accessories", label: "Accessories", subs: ["Socks", "Shoe Polish", "Insoles", "Shoe Bags"] },
  ];

  let filtered = products.filter(p => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (activeSub && p.subcategory !== activeSub) return false;
    if (activeCollection) {
      const normalized = p.collection.toLowerCase().replace(/\s+/g, "-");
      if (normalized !== activeCollection) return false;
    }
    if (p.price > maxPrice) return false;
    return true;
  });

  if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const collectionLabel = COLLECTIONS_DATA.find(c => c.id === activeCollection)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="mb-8">
        <SectionLabel>Browse</SectionLabel>
        <h1 className="font-serif text-4xl font-bold text-foreground">
          {collectionLabel ? `Collection: ${collectionLabel}` : activeCategory === "all" ? "All Products" : categories.find(c => c.id === activeCategory)?.label}
          {activeSub && !collectionLabel && <span className="text-muted-foreground font-normal"> — {activeSub}</span>}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{filtered.length} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-border p-5 sticky top-28">
            <div className="mb-6">
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-foreground mb-4">Category</p>
              <div className="space-y-1">
                {categories.map(cat => (
                  <div key={cat.id}>
                    <button
                      onClick={() => { setActiveCategory(cat.id); setActiveSub(""); }}
                      className={cn(
                        "w-full text-left text-sm py-2 px-3 rounded-lg transition-colors font-medium",
                        activeCategory === cat.id ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                      )}
                    >
                      {cat.label}
                    </button>
                    {activeCategory === cat.id && cat.subs.length > 0 && (
                      <div className="ml-3 mt-1 space-y-0.5">
                        <button
                          onClick={() => setActiveSub("")}
                          className={cn("w-full text-left text-xs py-1.5 px-3 rounded-lg transition-colors", !activeSub ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}
                        >
                          All {cat.label}
                        </button>
                        {cat.subs.map(s => (
                          <button
                            key={s}
                            onClick={() => setActiveSub(s)}
                            className={cn("w-full text-left text-xs py-1.5 px-3 rounded-lg transition-colors", activeSub === s ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-foreground mb-4">Max Price</p>
              <input
                type="range" min={1000} max={30000} step={500}
                value={maxPrice}
                onChange={e => setMaxPrice(+e.target.value)}
                className="w-full accent-primary"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">₵1,000</span>
                <span className="text-xs font-bold text-primary">{formatPrice(maxPrice)}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="w-4 h-4" />
              <span>{filtered.length} items</span>
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm bg-white border border-border rounded-xl text-foreground px-4 py-2.5 focus:outline-none focus:border-primary"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} navigate={navigate} onAddToCart={addToCart} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL PAGE ──────────────────────────────────────────────────────

function ProductDetailPage({ productId, navigate, addToCart }: {
  productId?: string;
  navigate: (p: Page, params?: Record<string, string>) => void;
  addToCart: (p: Product, size: string, color: string) => void;
}) {
  const { products, loading } = useProducts(); // 👈 ADD THIS

  // 👇 CHANGE 'PRODUCTS' to 'products' and add '?' to prevent crashes while loading
  const product = products.find(p => p.id === productId) || products[0];

  const [mainImg, setMainImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || "");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "delivery">("description");

  // 👇 CHANGE 'PRODUCTS' to 'products' and add '?'
  const related = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);
  const discount = product?.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  // 👇 ADD THIS: Updates the default size/color once the data actually finishes loading
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "");
      setSelectedColor(product.colors[0] || "");
    }
  }, [product]);

  // 👇 ADD THIS: Shows a loading screen while waiting for Supabase
  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
        <button onClick={() => navigate("home")} className="hover:text-primary transition-colors">Home</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate("shop", { category: product.category })} className="hover:text-primary capitalize transition-colors">{product.category}</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-20">
        {/* Gallery */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setMainImg(i)}
                className={cn("w-16 h-20 overflow-hidden rounded-xl border-2 transition-colors bg-[#F5F0E8]", i === mainImg ? "border-primary" : "border-border")}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-[4/5] overflow-hidden rounded-2xl bg-[#F5F0E8] relative">
            <img src={product.images[mainImg]} alt={product.name} className="w-full h-full object-cover" />
            {discount && (
              <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                -{discount}%
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">{product.brand}</p>
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          </div>
          <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-border">
            <span className="font-serif text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>}
          </div>

          {/* Color */}
          <div className="mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-foreground mb-3">
              Colour: <span className="text-primary normal-case font-semibold">{selectedColor}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={cn("px-4 py-2 text-xs font-semibold rounded-xl border-2 transition-colors", selectedColor === c ? "border-primary text-primary bg-secondary" : "border-border text-muted-foreground hover:border-primary/50")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-widest uppercase text-foreground">
                Size (UK): <span className="text-primary normal-case font-semibold">{selectedSize}</span>
              </p>
              <button onClick={() => navigate("size-guide")} className="text-xs text-primary flex items-center gap-1 font-semibold hover:text-accent transition-colors">
                <Ruler className="w-3 h-3" /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={cn("min-w-[44px] h-11 px-2 text-xs font-bold rounded-xl border-2 transition-colors", selectedSize === s ? "border-primary text-primary bg-secondary" : "border-border text-muted-foreground hover:border-primary/50")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mb-7">
            <p className="text-xs font-bold tracking-widest uppercase text-foreground mb-3">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-foreground">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => { for (let i = 0; i < qty; i++) addToCart(product, selectedSize, selectedColor); }}
              className="flex-1 py-4 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                for (let i = 0; i < qty; i++) addToCart(product, selectedSize, selectedColor);
                navigate("checkout");
              }}
              className="flex-1 py-4 border-2 border-foreground text-foreground text-sm font-bold tracking-widest uppercase rounded-xl hover:border-primary hover:text-primary transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-secondary rounded-2xl">
            {[{ icon: Truck, label: "Free over ₵15k" }, { icon: RotateCcw, label: "3-Day Returns" }, { icon: Shield, label: "100% Genuine" }].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                <b.icon className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">{b.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-8 border-t border-border pt-6">
            <div className="flex border-b border-border mb-5">
              {(["description", "features", "delivery"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn("px-5 py-3 text-xs font-bold tracking-widest uppercase transition-colors ", activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === "description" && <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>}
            {activeTab === "features" && (
              <ul className="space-y-2">
                {product.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "delivery" && (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-start gap-2"><Truck className="w-4 h-4 text-primary mt-0.5" /> Standard 3–5 days. Express available at checkout.</p>
                <p className="flex items-start gap-2"><Package className="w-4 h-4 text-primary mt-0.5" /> Free delivery on orders over ₵999.99.</p>
                <p className="flex items-start gap-2"><RotateCcw className="w-4 h-4 text-primary mt-0.5" /> Returns accepted within 3 days.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <div className="mb-8">
            <SectionLabel>You May Also Like</SectionLabel>
            <SectionHeading>Related Products</SectionHeading>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(p => <ProductCard key={p.id} product={p} navigate={navigate} onAddToCart={addToCart} />)}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────

function AboutPage() {
  return (
    <div>
      <div className="relative h-72 md:h-96 overflow-hidden bg-[#1A1208]">
        <img src={img("1560769629-975ec94e6a86", 1400, 600)} alt="About" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 w-full">
            <SectionLabel>Our Brand</SectionLabel>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-white">About Us</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <SectionLabel>Our Story</SectionLabel>
            <SectionHeading>Building an Empire, One Step at a Time</SectionHeading>
            <p className="text-muted-foreground leading-relaxed mt-5 mb-4">
              Footwear Empire was founded in 2018 with a single belief: every person deserves footwear that is both beautiful and built to last, without paying luxury prices.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we serve customers in all 16 regions, offering a curated selection of over 200 styles across men&apos;s and accessories categories. Every product is hand-selected, quality-checked, and shipped with care.
            </p>
          </div>
          <div className="bg-secondary rounded-3xl p-10">
            <Quote className="w-10 h-10 text-primary/40 mb-5" />
            <p className="font-serif text-xl font-medium text-foreground leading-relaxed italic mb-5">
              "Great shoes are not a luxury — they are the foundation of confidence, the first impression you make."
            </p>
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">— Chidi Okafor, Founder</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { value: "2018", label: "Founded" },
            { value: "50K+", label: "Customers" },
            { value: "200+", label: "Styles" },
            { value: "36", label: "States" },
          ].map(s => (
            <div key={s.label} className="p-8 bg-primary rounded-2xl text-center shadow-lg shadow-primary/20">
              <p className="font-serif text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs text-white/60 tracking-widest uppercase font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-20">
          {[
            { title: "Our Mission", icon: "🎯", text: "To democratise access to quality footwear across Africa — making premium styles available at honest prices, backed by exceptional service." },
            { title: "Our Vision", icon: "🌍", text: "To become the most loved footwear brand on the continent, known for style, quality, and a customer experience that feels like shopping with a trusted friend." },
          ].map(item => (
            <div key={item.title} className="p-8 bg-white rounded-2xl border border-border shadow-sm">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            "Hand-picked selection from trusted manufacturers and emerging designers",
            "Rigorous quality checks before any product reaches your door",
            "Flexible payment options including pay-on-delivery in select cities",
            "Dedicated customer care team available 7 days a week",
            "Simple, no-fuss 3-day return and exchange policy",
            "Eco-conscious packaging designed to minimise waste",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-5 bg-white rounded-xl border border-border">
              <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COLLECTIONS PAGE ─────────────────────────────────────────────────────────

function CollectionsPage({ navigate }: { navigate: (p: Page, params?: Record<string, string>) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
      <div className="mb-12">
        <SectionLabel>Curated Edits</SectionLabel>
        <SectionHeading>Collections</SectionHeading>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLLECTIONS_DATA.map(col => (
          <button
            key={col.id}
            onClick={() => navigate("shop", { collection: col.id })}
            className="group relative overflow-hidden rounded-2xl aspect-[3/4] text-left shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <img src={col.image} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-xs text-accent font-semibold tracking-widest uppercase mb-1">{col.desc}</p>
              <h3 className="font-serif text-xl font-bold text-white">{col.name}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs text-white/60 group-hover:text-white transition-colors">
                Explore <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SIZE GUIDE PAGE ──────────────────────────────────────────────────────────

function SizeGuidePage() {
  const sizeTable = [
    { uk: "6", eu: "39", us: "6.5", cm: "24.5" },
    { uk: "7", eu: "40", us: "7.5", cm: "25.5" },
    { uk: "8", eu: "41", us: "8.5", cm: "26.5" },
    { uk: "9", eu: "43", us: "9.5", cm: "27.5" },
    { uk: "10", eu: "44", us: "10.5", cm: "28.5" },
    { uk: "11", eu: "45", us: "11.5", cm: "29.5" },
    { uk: "12", eu: "46", us: "12.5", cm: "30.5" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-14">
      <div className="mb-10">
        <SectionLabel>Find Your Fit</SectionLabel>
        <SectionHeading>Size Guide</SectionHeading>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-sm mb-12">
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-white">
              {["UK Size", "EU Size", "US Size", "Length (cm)"].map(h => (
                <th key={h} className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizeTable.map((row, i) => (
              <tr key={row.uk} className={cn("border-b border-border hover:bg-secondary transition-colors", i % 2 === 0 ? "bg-white" : "bg-[#FFFCF5]")}>
                <td className="px-6 py-4 text-sm font-bold text-foreground text-center">{row.uk}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground text-center">{row.eu}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground text-center">{row.us}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground text-center">{row.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-secondary rounded-3xl p-8">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" /> How to Measure
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { step: "01", title: "Prepare", desc: "Stand on a flat surface with your foot on paper. Wear the socks you plan to use." },
            { step: "02", title: "Trace", desc: "Trace around your foot with a pencil held vertically throughout." },
            { step: "03", title: "Measure", desc: "Measure the longest point (heel to longest toe) in centimetres." },
            { step: "04", title: "Match", desc: "Find your CM measurement in the table above. If between sizes, size up." },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-4">
              <span className="font-serif text-4xl font-bold text-primary/25">{s.step}</span>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DELIVERY & RETURNS PAGE ──────────────────────────────────────────────────

function DeliveryReturnsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-14">
      <div className="mb-10">
        <SectionLabel>Know Before You Shop</SectionLabel>
        <SectionHeading>Delivery &amp; Returns</SectionHeading>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {[
          {
            icon: Truck, title: "Delivery", color: "bg-blue-50 text-blue-600",
            items: [
              { title: "Standard (3–5 business days)", desc: "Costs less· Free on orders over ₵999.99", icon: Clock },
              { title: "Express (1–2 business days)", desc: "Costs Relatively More · within Accra", icon: ArrowRight },
              { title: "Same-Day Accra", desc: "Order before 12pm", icon: Check },
              { title: "Nationwide", desc: "All 16 regions. Remote areas 3-5 days.", icon: Globe },
            ]
          },
          {
            icon: RotateCcw, title: "Returns", color: "bg-green-50 text-green-600",
            items: [
              { title: "3-Day Window", desc: "Return within 3 days of delivery for full refund.", icon: Clock },
              { title: "Returns", desc: "We arrange a pickup at a cost.", icon: RefreshCw },
              { title: "Condition", desc: "Unworn, original packaging with all tags attached.", icon: Check },
              { title: "Refund Timeline", desc: "Processed within 3–5 business days.", icon: Package },
            ]
          }
        ].map(section => (
          <div key={section.title} className="p-8 bg-white rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", section.color)}>
                <section.icon className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.items.map(item => (
                <div key={item.title} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                  <div className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-secondary rounded-3xl p-10">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-8">How to Return an Item</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Initiate", desc: "Log in to your account and select the order to return." },
            { step: "2", title: "Pack", desc: "Place item in original packaging with all tags." },
            { step: "3", title: "Schedule", desc: "Book a pickup via our portal." },
            { step: "4", title: "Refund", desc: "Refund processed within 5 days of receipt." },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-primary text-white font-bold text-lg rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                {s.step}
              </div>
              <p className="text-sm font-bold text-foreground mb-1">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FAQ PAGE ─────────────────────────────────────────────────────────────────

function FAQPage() {
  const [activeTab, setActiveTab] = useState("ordering");

  const faqs: Record<string, { q: string; a: string }[]> = {
    ordering: [
      { q: "How do I place an order?", a: "Browse our products, select your size and colour, then add to cart. When ready, proceed to checkout. You can pay online or choose pay-on-delivery in eligible areas." },
      { q: "Can I modify or cancel my order?", a: "Orders can be modified or cancelled within 1 hour of placement by contacting our support team via WhatsApp. After that, orders enter fulfilment and cannot be changed." },
      { q: "Do you offer bulk or corporate orders?", a: "Yes! We offer discounts for bulk orders of 20+ pairs. Contact our corporate sales team at corporate@footwearempire.com for a custom quote." },
    ],
    payments: [
      { q: "What payment methods do you accept?", a: "We accept debit and credit cards (Visa, Mastercard), bank transfer, and Mobile Momo payments." },
      { q: "Is my payment information secure?", a: "Yes. All transactions are processed through Paystack and Flutterwave, which are PCI-DSS compliant. We never store your card details." },
    ],
    delivery: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3–5 business days nationwide. Express delivery (1–2 days) is available in major cities. Same-day delivery in Accra for orders before 12pm." },
      { q: "How do I track my order?", a: "Once dispatched, you'll receive an SMS and email with a tracking link. You can also track from the Orders section of your account." },
      { q: "Do you deliver outside Ghana?", a: "Not yet, but international shipping is coming soon! Subscribe to our newsletter to be notified when we launch." },
    ],
    returns: [
      { q: "What is your return policy?", a: "We accept returns within 3 days of delivery. Items must be unworn, in original condition, with all tags and packaging intact." },
      { q: "How long does a refund take?", a: "Once we receive and inspect your return, refunds are processed within 3–5 business days to your original payment method." },
      { q: "What if I receive a wrong or faulty item?", a: "Contact us within 48 hours of delivery via WhatsApp or email with photos. We will arrange an immediate exchange or full refund." },
    ],
  };

  const tabs = [
    { id: "ordering", label: "Ordering" },
    { id: "payments", label: "Payments" },
    { id: "delivery", label: "Delivery" },
    { id: "returns", label: "Returns" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-14">
      <div className="mb-10">
        <SectionLabel>Got Questions?</SectionLabel>
        <SectionHeading>Frequently Asked</SectionHeading>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-xl border-2 transition-colors",
              activeTab === tab.id ? "bg-primary text-white border-primary shadow-sm" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AccordionPrimitive.Root type="single" collapsible className="space-y-3">
        {faqs[activeTab].map((item, i) => (
          <AccordionPrimitive.Item key={i} value={`item-${i}`} className="border border-border bg-white rounded-2xl overflow-hidden">
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-foreground text-left hover:text-primary transition-colors group">
                {item.q}
                <ChevronDown className="w-4 h-4 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform flex-shrink-0 ml-4" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
              {item.a}
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  }

  const inputCls = "w-full px-4 py-3 bg-white border-2 border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
      <div className="mb-10">
        <SectionLabel>Get in Touch</SectionLabel>
        <SectionHeading>Contact Us</SectionHeading>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-foreground block mb-1.5">Full Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Chidi Okafor" />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-foreground block mb-1.5">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="chidi@example.com" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-foreground block mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+234 800 000 0000" />
            </div>
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-foreground block mb-1.5">Subject *</label>
              <select required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputCls}>
                <option value="">Select a subject</option>
                <option>Order Enquiry</option>
                <option>Return / Exchange</option>
                <option>Product Question</option>
                <option>Delivery Issue</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest uppercase text-foreground block mb-1.5">Message *</label>
            <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={cn(inputCls, "resize-none")} placeholder="Tell us how we can help..." />
          </div>
          <button type="submit" className="flex items-center gap-2 px-8 py-4 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20">
            <Send className="w-4 h-4" /> Send Message
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: Phone, title: "Phone", content: "+233 59 882 7441", sub: "Mon–Sat, 9am–6pm", color: "bg-blue-50 text-blue-600" },
            { icon: MessageCircle, title: "WhatsApp", content: "+233 59 882 7441", sub: "Reply within 24 hours", color: "bg-green-50 text-green-600" },
            { icon: Mail, title: "Email", content: "hello@footwearempire.com", sub: "Reply within 24 hours", color: "bg-purple-50 text-purple-600" },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", item.color)}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-0.5">{item.title}</p>
                <p className="text-sm font-semibold text-foreground">{item.content}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNT PAGE ─────────────────────────────────────────────────────────────

function AccountPage({ navigate }: { navigate: (p: Page, params?: Record<string, string>) => void }) {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("orders");

  const inputCls = "w-full px-4 py-3 bg-[#FFFCF5] border-2 border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  // Fetch user's real orders from Supabase when they log in
  useEffect(() => {
    if (user) {
      getOrders({ userId: user.id }).then(res => setOrders(res.orders));
    } else {
      setOrders([]); // Clear orders when logged out
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      // Clear form on success
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Loading account...</p>
      </div>
    );
  }

  // ─── LOGIN / SIGNUP FORM (Shows when NOT logged in) ──────────────────
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl border border-border shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
            <p className="text-sm text-muted-foreground">{isLogin ? "Sign in to track your orders" : "Join Footwear Empire today"}</p>
          </div>
          <div className="flex bg-secondary rounded-xl p-1 mb-6">
            <button onClick={() => setIsLogin(true)} className={cn("flex-1 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors", isLogin ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Sign In</button>
            <button onClick={() => setIsLogin(false)} className={cn("flex-1 py-2.5 text-xs font-bold tracking-widest uppercase rounded-lg transition-colors", !isLogin ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Register</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-bold uppercase text-foreground block mb-1.5">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} placeholder="Chidi Okafor" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase text-foreground block mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-foreground block mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-4 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20">
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── LOGGED IN DASHBOARD (Shows when logged in) ──────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <SectionLabel>My Account</SectionLabel>
          <h1 className="font-serif text-3xl font-bold text-foreground">Hello 👋</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <button onClick={signOut} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Sign Out</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {[{ id: "orders", label: "My Orders" }, { id: "wishlist", label: "Wishlist" }, { id: "addresses", label: "Addresses" }, { id: "profile", label: "Profile" }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn("px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-xl transition-colors border-2", activeTab === tab.id ? "bg-primary text-white border-primary shadow-sm" : "border-border text-muted-foreground hover:text-primary hover:border-primary")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
              <button onClick={() => navigate("shop")} className="px-6 py-3 bg-primary text-white text-sm font-bold uppercase rounded-xl hover:bg-accent transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="p-5 bg-white rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-bold text-foreground">{order.orderNumber}</p>
                    <span className={cn("text-xs px-3 py-1 font-semibold rounded-full capitalize",
                      order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                    )}>
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{order.items?.map(i => i.productName).join(", ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-foreground">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "wishlist" && (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
        </div>
      )}

      {activeTab === "addresses" && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs bg-secondary text-primary px-3 py-1 font-bold rounded-full">Default</span>
              <button className="text-xs text-primary hover:text-accent transition-colors font-semibold">Edit</button>
            </div>
            <p className="text-sm font-bold text-foreground">My Address</p>
            <p className="text-sm text-muted-foreground">You can update your shipping address during checkout.</p>
          </div>
          <button className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-semibold">
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="max-w-md bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div>
            <label className="text-xs font-bold tracking-widest uppercase text-foreground block mb-1.5">Email</label>
            <input value={user.email} disabled className={cn(inputCls, "opacity-60 cursor-not-allowed")} />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
          </div>
          <button onClick={() => toast.success("Profile updated")} className="px-8 py-3.5 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────

function CartPage({ cart, updateQty, removeItem, navigate }: {
  cart: CartItem[];
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  navigate: (p: Page, params?: Record<string, string>) => void;
}) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const deliveryFee = subtotal >= 999.99 ? 0 : 40;
  const discountAmount = Math.round(subtotal * discount);
  const total = subtotal - discountAmount + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">You haven&apos;t added any items yet.</p>
        <button onClick={() => navigate("shop")} className="px-8 py-4 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
      <div className="mb-8">
        <SectionLabel>Your Selection</SectionLabel>
        <h1 className="font-serif text-4xl font-bold text-foreground">Shopping Cart <span className="text-muted-foreground font-normal text-2xl">({cart.length})</span></h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-20 h-24 bg-[#F5F0E8] rounded-xl flex-shrink-0 overflow-hidden">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{item.product.brand}</p>
                    <p className="text-sm font-bold text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size} · {item.color}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-foreground">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-primary">{formatPrice(item.product.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="p-5 bg-white rounded-2xl border border-border shadow-sm">
            <p className="text-xs font-bold tracking-widest uppercase text-foreground mb-3 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-primary" /> Have a Coupon?
            </p>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="Enter code (try EMPIRE10)"
                disabled={couponApplied}
                className="flex-1 px-4 py-2.5 bg-[#FFFCF5] border-2 border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                onClick={() => {
                  if (coupon.toUpperCase() === "EMPIRE10") { setDiscount(0.1); setCouponApplied(true); toast.success("10% discount applied!"); }
                  else toast.error("Invalid coupon code");
                }}
                disabled={couponApplied}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-border shadow-sm h-fit sticky top-28">
          <p className="text-xs font-bold tracking-widest uppercase text-foreground mb-5">Order Summary</p>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Item Total</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount (EMPIRE10)</span>
                <span className="text-green-600 font-bold">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            {subtotal >= 999.99 ? (
              <p className="text-xs font-semibold text-green-800">FREE DELIVERY!</p>
            ) : (
              <p className="text-xs text-muted-foreground">Add {formatPrice(999.99 - subtotal)} more for free delivery</p>
            )}
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-sm font-bold">Subtotal</span>
              <span className="font-serif text-2xl font-bold text-primary">{formatPrice(subtotal)}</span>
            </div>
          </div>
          <button onClick={() => navigate("checkout")} className="w-full py-4 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20">
            Proceed to Checkout
          </button>
          <button onClick={() => navigate("shop")} className="w-full py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors mt-2 flex items-center justify-center gap-1 font-medium">
            <ChevronLeft className="w-3.5 h-3.5" /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────

function CheckoutPage({ cart, navigate, clearCart }: {
  cart: CartItem[];
  navigate: (p: Page, params?: Record<string, string>) => void;
  clearCart: () => void;
}) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", town: "",
    delivery: "standard", payment: "card",
  });

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const deliveryFee = form.delivery === "express" ? 50 : subtotal >= 999.99 ? 0 : 40;
  const total = subtotal + deliveryFee;

  // ─── PAYSTACK CONFIG ───────────────────────────────────────────────────
  const paystackConfig = {
    reference: `FE_${new Date().getTime()}_${Math.random().toString(36).slice(2)}`,
    email: form.email || "customer@footwearempire.com",
    amount: Math.round(total * 100), // Paystack uses kobo (₵ × 100)
    publicKey: PAYSTACK_PUBLIC_KEY || "",
    currency: "GHS",
    metadata: {
      custom_fields: [
        { display_name: "Customer Name", variable_name: "customer_name", value: `${form.firstName} ${form.lastName}` },
        { display_name: "Phone", variable_name: "phone", value: form.phone },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  // ─── HANDLE PAYMENT SUCCESS ─────────────────────────────────────────────
  async function handlePaymentSuccess(response: any) {
    // Paystack returns an object, we extract the reference string from it
    const reference = response?.reference || `REF_${new Date().getTime()}`;

    setProcessing(true);
    try {
      const order = await createOrder(
        {
          firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
          address: form.address, city: form.city, state: form.state, town: form.town,
          deliveryMethod: form.delivery as "standard" | "express",
          paymentMethod: form.payment as "card" | "transfer" | "cod",
          subtotal, deliveryFee, total,
          paystackReference: reference, // 👈 Save it to the database
        },
        cart.map(i => ({
          productId: i.product.id, productName: i.product.name,
          size: i.size, color: i.color, qty: i.qty, unitPrice: i.product.price,
        })),
        user?.id
      );

      await notifyOwner(order);
      clearCart();
      toast.success("Order placed successfully! 🎉 You will receive a confirmation email shortly.", { duration: 5000 });
      navigate("account");
    } catch (err) {
      toast.error("Order failed. Please try again or contact support.");
      console.error("Order error:", err);
    } finally {
      setProcessing(false);
    }
  }

  // ─── BLOCK CHECKOUT IF NOT LOGGED IN ──────────────────────────────────
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
          <User className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Login Required</h1>
        <p className="text-muted-foreground mb-8">Please sign in or create an account to complete your purchase.</p>
        <button onClick={() => navigate("account")} className="px-8 py-4 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20">
          Go to Login
        </button>
      </div>
    );
  }

  // ─── HANDLE PAYMENT CLOSED/FAILED ───────────────────────────────────────
  function handlePaymentClose() {
    toast.error("Payment was not completed. Your cart is still saved.");
  }

  // ─── FORM SUBMIT ────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.payment) {
      // Launch Paystack payment modal
      initializePayment({
        onSuccess: (response: any) => handlePaymentSuccess(response),
        onClose: () => handlePaymentClose(),
      });
    } else {
      await handlePaymentSuccess({ reference: `MANUAL_${new Date().getTime()}` });
    }
  }

  const inputCls = "w-full px-4 py-3 bg-[#FFFCF5] border-2 border-border rounded-xl text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
      <div className="mb-8">
        <SectionLabel>Almost There</SectionLabel>
        <h1 className="font-serif text-4xl font-bold text-foreground">Checkout</h1>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-10">
        {[{ n: 1, l: "Shipping" }, { n: 2, l: "Delivery" }, { n: 3, l: "Payment" }].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors", step >= s.n ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
              {step > s.n ? <Check className="w-4 h-4" /> : s.n}
            </div>
            <span className={cn("text-sm font-medium hidden sm:block", step === s.n ? "text-foreground" : "text-muted-foreground")}>{s.l}</span>
            {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1: Shipping Address */}
            <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold tracking-widest uppercase text-foreground flex items-center gap-2">
                  <span className={cn("w-7 h-7 text-xs font-bold flex items-center justify-center rounded-full", step >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>1</span>
                  Shipping Address
                </h2>
                {step > 1 && <button type="button" onClick={() => setStep(1)} className="text-xs text-primary font-bold hover:text-accent transition-colors">Edit</button>}
              </div>
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold uppercase mb-1.5 block">First Name *</label><input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className={inputCls} placeholder="Nana" /></div>
                    <div><label className="text-xs font-bold uppercase mb-1.5 block">Last Name *</label><input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className={inputCls} placeholder="King" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold uppercase mb-1.5 block">Email *</label><input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="nana@example.com" /></div>
                    <div><label className="text-xs font-bold uppercase mb-1.5 block">Phone *</label><input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="+233 12 345 6789" /></div>
                  </div>
                  <div><label className="text-xs font-bold uppercase mb-1.5 block">Address *</label><input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inputCls} placeholder="123 Kofi Street" /></div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div><label className="text-xs font-bold uppercase mb-1.5 block">City *</label><input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls} placeholder="Accra" /></div>
                    <div><label className="text-xs font-bold uppercase mb-1.5 block">Region *</label><input required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className={inputCls} placeholder="Greater Accra" /></div>
                    <div><label className="text-xs font-bold uppercase mb-1.5 block">Town *</label><input required value={form.town} onChange={e => setForm(f => ({ ...f, town: e.target.value }))} className={inputCls} placeholder="Cantonments" /></div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const missing: string[] = [];
                      if (!form.firstName.trim()) missing.push("First Name");
                      if (!form.lastName.trim()) missing.push("Last Name");
                      if (!form.email.trim()) missing.push("Email");
                      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
                        toast.error("Please enter a valid email address.");
                        return;
                      }
                      if (!form.phone.trim()) missing.push("Phone");
                      if (!form.address.trim()) missing.push("Address");
                      if (!form.city.trim()) missing.push("City");
                      if (!form.state.trim()) missing.push("Region");
                      if (!form.town.trim()) missing.push("Town");

                      if (missing.length > 0) {
                        toast.error(`Please fill in: ${missing.join(", ")}`);
                        return;
                      }
                      setStep(2);
                    }}
                    className="px-8 py-3.5 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20"
                  >
                    Continue to Delivery
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{form.firstName} {form.lastName} · {form.address}, {form.city}</p>
              )}
            </div>

            {/* Step 2: Delivery Method */}
            {step >= 2 && (
              <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold tracking-widest uppercase text-foreground flex items-center gap-2">
                    <span className="w-7 h-7 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-full">2</span>
                    Delivery Method
                  </h2>
                  {step > 2 && <button type="button" onClick={() => setStep(2)} className="text-xs text-primary font-bold hover:text-accent transition-colors">Edit</button>}
                </div>
                {step === 2 ? (
                  <div className="space-y-3">
                    {[
                      { id: "standard", label: "Standard", sub: "3–5 business days", price: subtotal >= 999.99 ? "Free!" : 'Paid to Courier (cheaper)' },
                      { id: "express", label: "Express", sub: "1–2 business days", price: 'Paid to Courier' },
                    ].map(opt => (
                      <label key={opt.id} className={cn("flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors", form.delivery === opt.id ? "border-primary bg-secondary" : "border-border hover:border-primary/40")}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="delivery" value={opt.id} checked={form.delivery === opt.id} onChange={e => setForm(f => ({ ...f, delivery: e.target.value }))} className="accent-primary" />
                          <div>
                            <p className="text-sm font-bold text-foreground">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.sub}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-foreground text-right">{opt.price}</span>
                      </label>
                    ))}
                    <button type="button" onClick={() => setStep(3)} className="px-8 py-3.5 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20 mt-2">
                      Continue to Payment
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground capitalize">{form.delivery} delivery</p>
                )}
              </div>
            )}

            {/* Step 3: Payment Method */}
            {step >= 3 && (
              <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
                <h2 className="text-sm font-bold tracking-widest uppercase text-foreground flex items-center gap-2 mb-5">
                  <span className="w-7 h-7 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-full">3</span>
                  Payment Method
                </h2>
                <div className="space-y-3 mb-5">
                  {[
                    { id: "card", label: "Pay with Card", sub: "Visa, Mastercard, Verve — secured by Paystack" },
                    { id: "transfer", label: "Bank Transfer", sub: "Transfer and we'll confirm manually" },
                    { id: "cod", label: "Pay with Mobile Money", sub: "MTN Mobile Money, AT Money, Telecel Cash" },
                  ].map(opt => (
                    <label key={opt.id} className={cn("flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors", form.payment === opt.id ? "border-primary bg-secondary" : "border-border hover:border-primary/40")}>
                      <input type="radio" name="payment" value={opt.id} checked={form.payment === opt.id} onChange={e => setForm(f => ({ ...f, payment: e.target.value }))} className="accent-primary" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {processing ? "Processing..." : `Pay ₵${subtotal.toLocaleString()} with Paystack`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="p-6 bg-white rounded-2xl border border-border shadow-sm h-fit sticky top-28">
            <p className="text-xs font-bold tracking-widest uppercase text-foreground mb-4">Order Summary</p>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-14 bg-[#F5F0E8] rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full">{item.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">UK {item.size}</p>
                  </div>
                  <span className="text-xs font-bold text-foreground">{formatPrice(item.product.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Delivery</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "font-medium"}>{deliveryFee === 0 ? "Free" : `Paid to Courier`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-sm font-bold">Total</span>
                <span className="font-serif text-xl font-bold text-primary">{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

function AppShell() {
  const { page, pageParams, navigate } = useAppNav();
  const [cart, setCart] = useState<CartItem[]>([]);


  function addToCart(product: Product, size: string, color: string) {
    setCart(prev => {
      const key = `${product.id}-${size}-${color}`;
      const existing = prev.find(i => i.id === key);
      if (existing) { toast.success("Quantity updated"); return prev.map(i => i.id === key ? { ...i, qty: i.qty + 1 } : i); }
      toast.success("Added to cart");
      return [...prev, { id: key, product, size, color, qty: 1 }];
    });
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(122,92,20,0.4)} 70%{box-shadow:0 0 0 12px rgba(122,92,20,0)} 100%{box-shadow:0 0 0 0 rgba(122,92,20,0)} }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-fade-slide-down { animation: fadeSlideDown 0.7s ease forwards; }
        .animate-scale-in { animation: scaleIn 0.6s ease forwards; }
        .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #7A5C14 0%, #C49A3C 40%, #F0D090 60%, #7A5C14 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
      <Toaster position="top-right" richColors />
      <Navbar currentPage={page} navigate={navigate} cartCount={cartCount} />
      <main>
        {page === "home" && <HomePage navigate={navigate} addToCart={addToCart} />}
        {page === "shop" && <ShopPage navigate={navigate} addToCart={addToCart} category={pageParams.category} sub={pageParams.sub} collection={pageParams.collection} />}
        {page === "product" && <ProductDetailPage productId={pageParams.id} navigate={navigate} addToCart={addToCart} />}
        {page === "about" && <AboutPage />}
        {page === "collections" && <CollectionsPage navigate={navigate} />}
        {page === "size-guide" && <SizeGuidePage />}
        {page === "delivery" && <DeliveryReturnsPage />}
        {page === "faq" && <FAQPage />}
        {page === "contact" && <ContactPage />}
        {page === "account" && <AccountPage navigate={navigate} />}
        {page === "cart" && <CartPage cart={cart} updateQty={updateQty} removeItem={id => { setCart(p => p.filter(i => i.id !== id)); toast.success("Item removed"); }} navigate={navigate} />}
        {page === "checkout" && <CheckoutPage cart={cart} navigate={navigate} clearCart={() => setCart([])} />}
        {page === "admin" && <AdminGuard><AdminPage /></AdminGuard>}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}
export default function App() {
  return (
    <>
      <LoadingScreen />
      <BrowserRouter>
        <AuthProvider>
          <ProductsProvider>
            <Routes>
              <Route path="/" element={<AppShell />} />
              <Route path="/shop" element={<AppShell />} />
              <Route path="/product/:id" element={<AppShell />} />
              <Route path="/about" element={<AppShell />} />
              <Route path="/collections" element={<AppShell />} />
              <Route path="/size-guide" element={<AppShell />} />
              <Route path="/delivery" element={<AppShell />} />
              <Route path="/faq" element={<AppShell />} />
              <Route path="/contact" element={<AppShell />} />
              <Route path="/account" element={<AppShell />} />
              <Route path="/cart" element={<AppShell />} />
              <Route path="/checkout" element={<AppShell />} />
              <Route path="/admin" element={<AppShell />} />
              <Route path="*" element={<AppShell />} />
            </Routes>
          </ProductsProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
    );
}
