import { supabase } from "./supabaseClient";
import { NewsArticle, NewsArticleRow, newsArticleFromRow, newsArticleToRow } from "./types";

const LOCAL_STORAGE_KEY = "footwearempire_news_articles";

export const DEFAULT_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "footwear-empire-history",
    title: "From Kantamanto to the Empire: The Untold Story of Footwear Empire",
    subtitle: "On April 12, 2022, Nana King and Kay stepped out with a dream called DezyKay Sneakers. Here is how passion and Kantamanto grit built an empire.",
    brand: "Footwear Empire",
    sneakerModel: "Foundation & Heritage",
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1000&auto=format&fit=crop&q=80",
    excerpt: "Starting on the 12th of April, 2022, Nana King and Kay roamed Kantamanto under the scorching sun searching tirelessly for reliable sources of authentic sneakers. Returning time and time again, their relentless dedication transformed DezyKay Sneakers into Footwear Empire in 2024—recently celebrating their four-year milestone by giving back and donating to the streets that shaped them.",
    content: `Every empire has its foundation, and for Footwear Empire, that foundation was forged under the blazing sun in the bustling corridors of Accra.

The journey began on the 12th of April, 2022. Founded by Nana King and Kay, the brand took its first steps under the name DezyKay Sneakers. In those early days, there were no luxury showrooms or automated systems—just two passionate sneakerheads, unmatched determination, and a relentless commitment to authenticity.

Day after day, Nana King and Kay roamed the labyrinth of Kantamanto Market under the scorching afternoon sun. They dug through bales, scrutinized stitching, inspected sole flexibility, and tested leather quality. They were on an unyielding quest to find the most trustworthy, reliable sources to supply premium sneakers to clients who trusted their word.

They kept returning to Kantamanto every single time. They built genuine relationships with veteran traders, learned the footwear trade from the ground up, and refused to settle for second best. That uncompromising eye for quality quickly set them apart, and sneaker lovers across Accra and beyond began to take notice.

In 2024, as the vision outgrew its humble beginnings, DezyKay Sneakers officially evolved into Footwear Empire. The rebrand signaled a new chapter: elevating Ghanaian sneaker retail with curated releases, nationwide door-to-door delivery, and an uncompromising standard of authentic quality.

Yet, despite their exponential growth, Nana King and Kay remain deeply rooted in their origins. Celebrating their four-year anniversary milestone, the founders returned to where it all began—organizing a heartfelt donation drive on the streets to clothe, support, and uplift the youth and community whose resilience inspires them daily.

'Kantamanto taught us resilience, grit, and how to spot genuine quality with our eyes closed,' share Nana King and Kay. 'Footwear Empire wasn't built in an ivory tower—it was built on the streets, under the sun, step by step, for the culture.'`,
    author: "Footwear Empire",
    publishedAt: "2026-11-05T12:00:00Z",
    tag: "Brand History",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "fyt-air-jordan-16",
    title: "Free The Youth x Air Jordan 16: Ghana's Streetwear Movement Takes Flight",
    subtitle: "How the Tema-born collective merged West African grit with high-fashion storytelling on Jordan's iconic shrouded silhouette.",
    brand: "Jordan Brand × Free The Youth",
    sneakerModel: "Air Jordan 16 Retro",
    imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&auto=format&fit=crop&q=80",
    excerpt: "Born on the streets of Tema, Ghana, creative collective Free The Youth teamed up with Jordan Brand to reimagine the Air Jordan 16—infusing the silhouette with authentic West African youth energy, custom shroud craftsmanship, and a historic tribute to Ghanaian independence.",
    content: `From their humble beginnings in Tema, Ghana, selling graphic tees out of car trunks and documenting Accra's skate and youth culture, Free The Youth (founded by Jonathan Coffie, Kelly Kurlz, Shannik, and Prince Amine) has evolved into West Africa's most prominent streetwear powerhouse.

Their landmark collaboration with Jordan Brand centers around the Air Jordan 16—a legendary silhouette originally penned by Wilson Smith III in 2001, celebrated for its transformative magnetic shroud that converts an on-court battle shoe into a formal, off-court luxury piece.

In Free The Youth's hands, the sneaker sheds corporate boardroom nostalgia and embraces the raw vitality of West African creativity. The design incorporates deep forest greens and sunburst golds reflecting Ghana's natural wealth and national colors, contrasted with premium distressed leather and raw canvas textures.

The removable shroud features embossed Adinkra-inspired symbols and embroidered detailing reading 'Free The Youth / For The Youth'. When the shroud is removed, the exposed mesh tongue reveals custom coordinates pointing directly to the streets of Tema where the brand was founded.

'We didn't just want to design a shoe; we wanted to bottle the feeling of waking up in Ghana with impossible dreams and watching them materialize before the world,' the collective shared.

With this release, Footwear Empire celebrates an undeniable milestone: African youth culture commanding center stage on one of global basketball's most revered sneaker canvases.`,
    author: "Footwear Empire",
    publishedAt: "2026-11-01T10:00:00Z",
    tag: "Ghanaian Heritage",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "air-jordan-4-bred-reimagined",
    title: "The Return of an Icon: Air Jordan 4 Retro 'Bred Reimagined'",
    subtitle: "Jordan Brand replaces traditional nubuck with buttery tumbled leather on Michael Jordan's immortal 1989 silhouette.",
    brand: "Jordan Brand",
    sneakerModel: "Air Jordan 4 Retro",
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1000&auto=format&fit=crop&q=80",
    excerpt: "Thirty-five years after 'The Shot' over Cleveland, the Air Jordan 4 'Bred' is reborn with an elevated tumbled leather finish, cement grey eyelets, and the timeless Nike Air insignia on the heel.",
    content: `Few sneakers possess the cultural gravity of the Air Jordan 4 'Bred'. Originally laced up by Michael Jordan during the historic 1989 NBA Playoffs—culminating in 'The Shot' over Craig Ehlo—the black and red battle shoe has defined generations of sneakerheads.

For the 35th anniversary, Jordan Brand gave the silhouette the coveted 'Reimagined' treatment. In place of the traditional synthetic Durabuck from 1989, this new iteration features a rich, supple full-grain tumbled leather upper designed to age with grace and withstand daily wear.

All the defining details remain sacred: the signature quarter-panel netting, the structural TPU support wings, fire red accents on the tongue and outsole, and the crowning glory—original 'Nike Air' branding embossed sharply across the rubber heel tab.

The Air Jordan 4 'Bred Reimagined' is more than just nostalgia; it is an undeniable testament to why 1980s basketball design continues to reign supreme in modern streetwear rotations worldwide.`,
    author: "Footwear Empire",
    publishedAt: "2026-10-28T14:00:00Z",
    tag: "Iconic Release",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "asics-gel-kayano-14-metallics",
    title: "Silver Speed: How the Asics GEL-Kayano 14 Conquered Global Fashion",
    subtitle: "From high-mileage marathon training to the pinnacle of streetwear styling, the 2008 technical runner leads the modern sneaker wave.",
    brand: "Asics SportStyle",
    sneakerModel: "GEL-Kayano 14",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&auto=format&fit=crop&q=80",
    excerpt: "With metallic silver overlays, breathable open-mesh construction, and signature visible GEL cushioning, the GEL-Kayano 14 has become an indispensable rotation piece for creatives and tastemakers worldwide.",
    content: `When the Asics GEL-Kayano 14 was introduced in 2008, it won Runner's World awards for its uncompromising long-distance engineering. Designed by Hidenori Yamashita—taking over from legendary series creator Toshikazu Kayano—the shoe was built purely to perform.

Fast forward to today, and the GEL-Kayano 14 has undergone one of the most remarkable cultural ascents in sneaker history. Embraced by creative directors, tastemakers, and street stylists across Accra, London, and Tokyo, its late-2000s metallic aesthetics have become the gold standard of contemporary everyday footwear.

The sneaker balances high-shine chrome accents and cream meshes with responsive GEL technology in the heel and forefoot, joined by the iconic TRUSSTIC support system under the arch.

Offering effortless pairing with baggy denim, tailored trousers, or relaxed shorts, the Kayano 14 proves that genuine performance design with authentic pedigree will always transcend the racetrack.`,
    author: "Footwear Empire",
    publishedAt: "2026-10-20T11:00:00Z",
    tag: "Trending Silhouette",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "wales-bonner-samba-silver",
    title: "Wales Bonner x adidas Samba: Metallic Splendor & Diasporic Elegance",
    subtitle: "Grace Wales Bonner elevates football terrace culture into runway art with mirror-finished metallic leather and artisanal stitching.",
    brand: "adidas Originals × Wales Bonner",
    sneakerModel: "adidas Samba 'Silver Metallic'",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&auto=format&fit=crop&q=80",
    excerpt: "Exploring British-Jamaican heritage and 1970s sound system culture, this iteration of the Samba features mirrored silver leather, extended fold-over tongue, and handcrafted crochet detailing.",
    content: `Few collaborations have reshaped modern everyday footwear like Grace Wales Bonner's continuous partnership with adidas Originals. The British-Jamaican designer has turned the utilitarian Samba football trainer into a global wardrobe staple.

The 'Silver Metallic' edition takes this dialogue to its most daring extreme. Swapping traditional suede for a high-gloss, mirrored metallic silver upper, the shoe demands attention while honoring vintage athletic elegance.

Subtle knit crochet stripes line the flanks, creating tactile contrast against the metallic skin, while an oversized fold-over tongue drapes over the laces in true retro football fashion.

The shoe serves as an example of how tailoring and football heritage intersect, making it an essential entry in Footwear Empire's curated rotation for those who appreciate design dialogue alongside sneaker prestige.`,
    author: "Footwear Empire",
    publishedAt: "2026-10-15T09:00:00Z",
    tag: "Fashion & Culture",
    isFeatured: false,
    isActive: true,
  },
  {
    id: "jumpman-jack-cactus-jack",
    title: "Travis Scott's Jordan Jumpman Jack: The Signature Era Begins",
    subtitle: "La Flame debuts his first entirely bespoke silhouette with Jordan Brand, drawing from 90s cross-trainers and skate culture.",
    brand: "Jordan Brand × Cactus Jack",
    sneakerModel: "Jordan Jumpman Jack TR",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80",
    excerpt: "Travis Scott officially expands beyond retro colorways with his first full signature model, featuring a midfoot forefoot strap, rugged canvas base, and iconic inverted Swoosh.",
    content: `After years of creating some of the most sought-after retro Jordan 1s and Jordan 4s in sneaker history, Travis Scott and Jordan Brand introduced the Jumpman Jack—his first true signature model designed from the sole up.

Taking aesthetic cues from classic 1990s turf trainers, indoor football boots, and bulky skate shoes, the Jumpman Jack delivers an aggressive, low-to-the-ground stance. The silhouette is anchored by a heavy-duty forefoot midfoot strap embossed with Cactus Jack branding, a gum rubber outsole that wraps up the lateral sidewall, and premium nubuck overlays.

Underneath the translucent gum outsole, Scott's hand-drawn 'JACK' logo is painted in bold lettering. The tongue features a stylized Jumpman emblem with Scott's signature cactus crown motif.

Whether styled with oversized workwear pants or athletic shorts, the Jumpman Jack represents a turning point in artist collaborations: moving past simple colorway swaps into complete architectural shoe design.`,
    author: "Footwear Empire",
    publishedAt: "2026-10-10T14:30:00Z",
    tag: "Signature Drop",
    isFeatured: false,
    isActive: true,
  },
];

// Helper to get local articles with smart merge of new default articles
function getLocalArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_NEWS_ARTICLES));
      return DEFAULT_NEWS_ARTICLES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all current defaults (including brand history) are present
      const existingIds = new Set(parsed.map((a: any) => a.id));
      const missingDefaults = DEFAULT_NEWS_ARTICLES.filter(d => !existingIds.has(d.id));
      if (missingDefaults.length > 0) {
        const merged = [...missingDefaults, ...parsed];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return DEFAULT_NEWS_ARTICLES;
  } catch {
    return DEFAULT_NEWS_ARTICLES;
  }
}

// Helper to save local articles
function saveLocalArticles(articles: NewsArticle[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn("Failed to write news to localStorage", e);
  }
}

export interface NewsFilters {
  tag?: string;
  search?: string;
  onlyActive?: boolean;
}

export async function getNewsArticles(filters: NewsFilters = {}): Promise<NewsArticle[]> {
  const { tag, search, onlyActive = true } = filters;

  try {
    let query = supabase.from("news_articles").select("*").order("created_at", { ascending: false });
    if (onlyActive) {
      query = query.eq("is_active", true);
    }
    if (tag && tag !== "all") {
      query = query.eq("tag", tag);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%,sneaker_model.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      // Fallback to local storage
      let local = getLocalArticles();
      if (onlyActive) local = local.filter(a => a.isActive !== false);
      if (tag && tag !== "all") local = local.filter(a => a.tag?.toLowerCase() === tag.toLowerCase());
      if (search) {
        const q = search.toLowerCase();
        local = local.filter(a =>
          a.title.toLowerCase().includes(q) ||
          a.brand?.toLowerCase().includes(q) ||
          a.sneakerModel?.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)
        );
      }
      return local;
    }

    const converted = (data as NewsArticleRow[]).map(newsArticleFromRow);
    const existingIds = new Set(converted.map(a => a.id));
    const missingDefaults = DEFAULT_NEWS_ARTICLES.filter(d => !existingIds.has(d.id));
    const fullList = [...converted, ...missingDefaults];
    saveLocalArticles(fullList);
    return fullList;
  } catch {
    let local = getLocalArticles();
    if (onlyActive) local = local.filter(a => a.isActive !== false);
    return local;
  }
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> {
  try {
    const { data, error } = await supabase.from("news_articles").select("*").eq("id", id).maybeSingle();
    if (error || !data) {
      const local = getLocalArticles();
      return local.find(a => a.id === id) || null;
    }
    return newsArticleFromRow(data as NewsArticleRow);
  } catch {
    const local = getLocalArticles();
    return local.find(a => a.id === id) || null;
  }
}

export async function createNewsArticle(article: Omit<NewsArticle, "id" | "publishedAt">): Promise<NewsArticle> {
  const newArticle: NewsArticle = {
    ...article,
    id: `news_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    publishedAt: new Date().toISOString(),
    isActive: article.isActive ?? true,
    isFeatured: article.isFeatured ?? false,
  };

  // Save to Supabase if possible
  try {
    const row = newsArticleToRow(newArticle);
    const { data, error } = await supabase.from("news_articles").insert([row]).select().maybeSingle();
    if (!error && data) {
      const created = newsArticleFromRow(data as NewsArticleRow);
      const local = [created, ...getLocalArticles().filter(a => a.id !== created.id)];
      saveLocalArticles(local);
      return created;
    }
  } catch (err) {
    console.warn("Supabase news insert skipped or failed:", err);
  }

  // Fallback to local storage
  const local = [newArticle, ...getLocalArticles()];
  saveLocalArticles(local);
  return newArticle;
}

export async function updateNewsArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle> {
  // Update in local storage
  const local = getLocalArticles();
  const index = local.findIndex(a => a.id === id);
  let updated: NewsArticle = { ...(local[index] || {}), ...updates, id } as NewsArticle;

  if (index !== -1) {
    local[index] = updated;
  } else {
    local.unshift(updated);
  }
  saveLocalArticles(local);

  // Update in Supabase if possible
  try {
    const row = newsArticleToRow(updates);
    const { data, error } = await supabase.from("news_articles").update(row).eq("id", id).select().maybeSingle();
    if (!error && data) {
      updated = newsArticleFromRow(data as NewsArticleRow);
      saveLocalArticles(local.map(a => a.id === id ? updated : a));
    }
  } catch (err) {
    console.warn("Supabase news update failed:", err);
  }

  return updated;
}

export async function deleteNewsArticle(id: string): Promise<void> {
  // Delete from local storage
  const local = getLocalArticles().filter(a => a.id !== id);
  saveLocalArticles(local);

  // Delete from Supabase
  try {
    await supabase.from("news_articles").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase news delete failed:", err);
  }
}

// Upload article image (supports Supabase storage with base64 fallback)
export async function uploadNewsImage(file: File): Promise<string> {
  const bucketName = "product-images"; // Use existing working bucket
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `news/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage.from(bucketName).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (!error) {
      const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
      return data.publicUrl;
    }
  } catch (err) {
    console.warn("Direct storage upload failed, falling back to data URL:", err);
  }

  // Fallback to data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
