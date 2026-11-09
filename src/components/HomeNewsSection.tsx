import { useEffect, useState, useRef } from "react";
import { ArrowRight, Sparkles, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { NewsArticle } from "@/lib/types";
import { getNewsArticles, DEFAULT_NEWS_ARTICLES } from "@/lib/newsService";
import { Page } from "@/router/useAppNav";

interface HomeNewsSectionProps {
  navigate: (p: Page, params?: Record<string, string>) => void;
}

export default function HomeNewsSection({ navigate }: HomeNewsSectionProps) {
  const [stories, setStories] = useState<NewsArticle[]>(DEFAULT_NEWS_ARTICLES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadStories() {
      try {
        const articles = await getNewsArticles({ onlyActive: true });
        // Use featured or all active stories
        const active = articles.filter(a => a.isActive !== false);
        setStories(active);
      } catch (err) {
        console.error("Failed to load news stories for home slideshow:", err);
      }
    }
    loadStories();
  }, []);

  // Slideshow auto-advance every 6.5 seconds, paused on hover
  useEffect(() => {
    if (stories.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % stories.length);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stories.length, isPaused]);

  function nextSlide() {
    if (stories.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % stories.length);
  }

  function prevSlide() {
    if (stories.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + stories.length) % stories.length);
  }

  if (stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <section className="bg-[#0A1810] py-20 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Section Header with Slideshow Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Sneaker Culture & Drops
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              The Release Wire
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Slide Index Counter */}
            {stories.length > 1 && (
              <span className="text-xs font-mono font-semibold text-muted-foreground mr-1">
                {String(currentIndex + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}
              </span>
            )}

            {/* Prev / Next Buttons */}
            {stories.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                  aria-label="Next story"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => navigate("news")}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-secondary hover:text-accent transition-colors ml-2"
            >
              Explore All News <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slideshow Card */}
        <div
          className="relative overflow-hidden rounded-3xl bg-[#112419] border border-border/80 p-6 sm:p-10 lg:p-12 shadow-xl transition-all"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/*
            RESPONSIVE LAYOUT SPEC:
            - Bigger screens (laptop / desktop): Text on left side, Image on right side.
            - Small screens (mobile): Image at top, Article beneath it.
            - Clean typography without unnecessary bubbles/pills.
          */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14">

            {/* TEXT: order-2 on mobile (beneath image), order-1 on lg (left side) */}
            <div className="w-full lg:w-7/12 order-2 lg:order-1 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-[11px] uppercase tracking-widest">
                {currentStory.tag && (
                  <span className="font-bold text-primary">{currentStory.tag}</span>
                )}
                {currentStory.tag && currentStory.sneakerModel && (
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                )}
                {currentStory.sneakerModel && (
                  <span className="font-medium text-white/60">{currentStory.sneakerModel}</span>
                )}
                <span className="ml-auto flex items-center gap-1.5 normal-case tracking-wide text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(currentStory.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                {currentStory.title}
              </h3>

              {currentStory.subtitle && (
                <p className="text-white/75 text-sm sm:text-base italic leading-relaxed mb-4 font-serif">
                  "{currentStory.subtitle}"
                </p>
              )}

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8 line-clamp-3">
                {currentStory.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {/* READ MORE BUTTON: takes user to the news section / article */}
                <button
                  onClick={() => navigate("news", { id: currentStory.id })}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-all duration-300 shadow-md group"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => navigate("news")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-white/10 border border-white/10 transition-colors"
                >
                  View All Stories
                </button>
              </div>

              {/* Slideshow Progress Bar Dots */}
              {stories.length > 1 && (
                <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/5">
                  {stories.map((s, idx) => (
                    <button
                      key={s.id || idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentIndex === idx
                          ? "w-8 bg-primary"
                          : "w-2.5 bg-white/20 hover:bg-white/40"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                      title={s.title}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* IMAGE: order-1 on mobile (at top), order-2 on lg (right side) */}
            <div className="w-full lg:w-5/12 order-1 lg:order-2">
              <div
                onClick={() => navigate("news", { id: currentStory.id })}
                className="relative aspect-[16/10] sm:aspect-[16/11] lg:aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer group"
              >
                <img
                  key={currentStory.id}
                  src={currentStory.imageUrl}
                  alt={currentStory.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                {currentStory.brand && (
                  <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                    {currentStory.brand}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
