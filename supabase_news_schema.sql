-- ==============================================================================
-- SNEAKER NEWS & RELEASES TABLE SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor if you want database-level persistence
-- across all devices and browsers.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.news_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  brand TEXT,
  sneaker_model TEXT,
  image_url TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Footwear Empire Editorial',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  tag TEXT DEFAULT 'Exclusive Drop',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active articles
CREATE POLICY "Allow public read access to active news"
  ON public.news_articles
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users / admins full access
CREATE POLICY "Allow full access to authenticated admins"
  ON public.news_articles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon full access (if anon key is used by admin client)
CREATE POLICY "Allow anon read and write access"
  ON public.news_articles
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Seed initial Footwear Empire Brand History and Free The Youth articles
INSERT INTO public.news_articles (
  id,
  title,
  subtitle,
  brand,
  sneaker_model,
  image_url,
  excerpt,
  content,
  author,
  published_at,
  tag,
  is_featured,
  is_active
) VALUES (
  'footwear-empire-history',
  'From Kantamanto to the Empire: The Untold Story of Footwear Empire',
  'On April 12, 2022, Nana King and Kay stepped out with a dream called DezyKay Sneakers. Here is how passion and Kantamanto grit built an empire.',
  'Footwear Empire',
  'Foundation & Heritage',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1000&auto=format&fit=crop&q=80',
  'Starting on the 12th of April, 2022, Nana King and Kay roamed Kantamanto under the scorching sun searching tirelessly for reliable sources of authentic sneakers. Returning time and time again, their relentless dedication transformed DezyKay Sneakers into Footwear Empire in 2024—recently celebrating their four-year milestone by giving back and donating to the streets that shaped them.',
  'Every empire has its foundation, and for Footwear Empire, that foundation was forged under the blazing sun in the bustling corridors of Accra.

The journey began on the 12th of April, 2022. Founded by Nana King and Kay, the brand took its first steps under the name DezyKay Sneakers. In those early days, there were no luxury showrooms or automated systems—just two passionate sneakerheads, unmatched determination, and a relentless commitment to authenticity.

Day after day, Nana King and Kay roamed the labyrinth of Kantamanto Market under the scorching afternoon sun. They dug through bales, scrutinized stitching, inspected sole flexibility, and tested leather quality. They were on an unyielding quest to find the most trustworthy, reliable sources to supply premium sneakers to clients who trusted their word.

They kept returning to Kantamanto every single time. They built genuine relationships with veteran traders, learned the footwear trade from the ground up, and refused to settle for second best. That uncompromising eye for quality quickly set them apart, and sneaker lovers across Accra and beyond began to take notice.

In 2024, as the vision outgrew its humble beginnings, DezyKay Sneakers officially evolved into Footwear Empire. The rebrand signaled a new chapter: elevating Ghanaian sneaker retail with curated releases, nationwide door-to-door delivery, and an uncompromising standard of authentic quality.

Yet, despite their exponential growth, Nana King and Kay remain deeply rooted in their origins. Celebrating their four-year anniversary milestone, the founders returned to where it all began—organizing a heartfelt donation drive on the streets to clothe, support, and uplift the youth and community whose resilience inspires them daily.

''Kantamanto taught us resilience, grit, and how to spot genuine quality with our eyes closed,'' share Nana King and Kay. ''Footwear Empire wasn''t built in an ivory tower—it was built on the streets, under the sun, step by step, for the culture.''',
  'Footwear Empire',
  NOW(),
  'Brand History',
  TRUE,
  TRUE
),
(
  'fyt-air-jordan-16',
  'Free The Youth x Air Jordan 16: Ghana''s Streetwear Movement Takes Flight',
  'How the Tema-born collective merged West African grit with high-fashion storytelling on Jordan''s iconic shrouded silhouette.',
  'Jordan Brand × Free The Youth',
  'Air Jordan 16 Retro',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1000&auto=format&fit=crop&q=80',
  'Born on the streets of Tema, Ghana, creative collective Free The Youth teamed up with Jordan Brand to reimagine the Air Jordan 16—infusing the silhouette with authentic West African youth energy, custom shroud craftsmanship, and a historic tribute to Ghanaian independence.',
  'From their humble beginnings in Tema, Ghana, selling graphic tees out of car trunks and documenting Accra''s skate and youth culture, Free The Youth (founded by Jonathan Coffie, Kelly Kurlz, Shannik, and Prince Amine) has evolved into West Africa''s most prominent streetwear powerhouse.

Their landmark collaboration with Jordan Brand centers around the Air Jordan 16—a legendary silhouette originally penned by Wilson Smith III in 2001, celebrated for its transformative magnetic shroud that converts an on-court battle shoe into a formal, off-court luxury piece.

In Free The Youth''s hands, the sneaker sheds corporate boardroom nostalgia and embraces the raw vitality of West African creativity. The design incorporates deep forest greens and sunburst golds reflecting Ghana''s natural wealth and national colors, contrasted with premium distressed leather and raw canvas textures.

The removable shroud features embossed Adinkra-inspired symbols and embroidered detailing reading ''Free The Youth / For The Youth''. When the shroud is removed, the exposed mesh tongue reveals custom coordinates pointing directly to the streets of Tema where the brand was founded.

''We didn''t just want to design a shoe; we wanted to bottle the feeling of waking up in Ghana with impossible dreams and watching them materialize before the world,'' the collective shared.

With this release, Footwear Empire celebrates an undeniable milestone: African youth culture commanding center stage on one of global basketball''s most revered sneaker canvases.',
  'Footwear Empire',
  NOW(),
  'Ghanaian Heritage',
  TRUE,
  TRUE
) ON CONFLICT (id) DO NOTHING;
