import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import QuoteCard from "@/components/QuoteCard";
import { Bookmark } from "lucide-react";
import { Link } from "wouter";

export default function Favorites() {
  const { isAuthenticated, loading } = useAuth();

  const { data: quotes = [], isLoading, refetch } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: favoriteIds = [], refetch: refetchIds } = trpc.favorites.ids.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const handleFavoriteToggle = () => {
    refetch();
    refetchIds();
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="container py-20 text-center">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen">
        <section className="border-b border-foreground/10">
          <div className="container py-16 text-center">
            <Bookmark className="w-10 h-10 text-foreground/20 mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold mb-3">Sign in to view your saved quotes</h1>
            <p className="font-body text-foreground/55 italic mb-8">
              Bookmark the wisdom that resonates most with you.
            </p>
            <a
              href={getLoginUrl()}
              className="inline-flex font-label text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/50 px-6 py-3 transition-all"
            >
              Sign In
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-foreground/10">
        <div className="container py-12 md:py-16">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 border-t border-foreground/20" />
            <span className="font-label text-foreground/40">Personal Collection</span>
            <div className="flex-1 border-t border-foreground/20" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-3">
              Your <span className="italic font-normal">Saved</span> Quotes
            </h1>
            <p className="font-body text-foreground/55 text-lg italic">
              {quotes.length} {quotes.length === 1 ? "quote" : "quotes"} in your collection
            </p>
          </div>
        </div>
      </section>

      {/* Quotes */}
      <section>
        <div className="container py-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-20">
              <Bookmark className="w-10 h-10 text-foreground/20 mx-auto mb-4" />
              <p className="font-display text-2xl font-bold mb-2">No saved quotes yet</p>
              <p className="font-body text-foreground/50 italic mb-6">
                Browse the library and bookmark the wisdom that speaks to you.
              </p>
              <Link
                href="/library"
                className="inline-flex font-label text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/50 px-5 py-2.5 transition-all"
              >
                Explore the Library
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes.map((quote, i) => (
                <div key={quote.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <QuoteCard
                    quote={quote}
                    favoriteIds={favoriteIds}
                    onFavoriteToggle={handleFavoriteToggle}
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
