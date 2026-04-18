import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import QuoteCard from "@/components/QuoteCard";
import { Search, X } from "lucide-react";
import { useState } from "react";

export default function Library() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");

  const { data: quotes = [], isLoading } = trpc.quotes.list.useQuery({
    search: search || undefined,
    topic: selectedTopic || undefined,
    speakerName: selectedSpeaker || undefined,
  });

  const { data: topics = [] } = trpc.quotes.topics.useQuery();
  const { data: speakerNames = [] } = trpc.quotes.speakerNames.useQuery();
  const { data: favoriteIds = [], refetch: refetchFavs } = trpc.favorites.ids.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const clearFilters = () => {
    setSearch("");
    setSelectedTopic("");
    setSelectedSpeaker("");
  };

  const hasFilters = search || selectedTopic || selectedSpeaker;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-foreground/10">
        <div className="container py-12 md:py-16">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 border-t border-foreground/20" />
            <span className="font-label text-foreground/40">The Collection</span>
            <div className="flex-1 border-t border-foreground/20" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-3">
              Quote <span className="italic font-normal">Library</span>
            </h1>
            <p className="font-body text-foreground/55 text-lg italic">
              {quotes.length} pieces of wisdom from the School of Hard Knocks
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-foreground/10 sticky top-14 bg-background/95 backdrop-blur-sm z-40">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quotes..."
                className="w-full pl-9 pr-3 py-2 border border-foreground/15 bg-transparent font-body text-sm focus:outline-none focus:border-foreground/40 placeholder:text-foreground/35"
              />
            </div>

            {/* Topic filter */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="border border-foreground/15 bg-background font-label text-foreground/60 px-3 py-2 focus:outline-none focus:border-foreground/40 text-xs"
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Speaker filter */}
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="border border-foreground/15 bg-background font-label text-foreground/60 px-3 py-2 focus:outline-none focus:border-foreground/40 text-xs"
            >
              <option value="">All Speakers</option>
              {speakerNames.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 font-label text-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Quotes grid */}
      <section>
        <div className="container py-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl font-bold mb-2">No quotes found</p>
              <p className="font-body text-foreground/50 italic">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes.map((quote, i) => (
                <div key={quote.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <QuoteCard
                    quote={quote}
                    favoriteIds={favoriteIds}
                    onFavoriteToggle={refetchFavs}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
