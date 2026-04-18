import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import QuoteCard from "@/components/QuoteCard";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";

export default function SpeakerDetail() {
  const params = useParams<{ name: string }>();
  const speakerName = decodeURIComponent(params.name ?? "");
  const { isAuthenticated } = useAuth();

  const { data: quotes = [], isLoading } = trpc.quotes.bySpeaker.useQuery(
    { speakerName },
    { enabled: !!speakerName }
  );

  const { data: favoriteIds = [], refetch: refetchFavs } = trpc.favorites.ids.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-foreground/10">
        <div className="container py-12 md:py-16">
          <Link href="/speakers" className="inline-flex items-center gap-2 font-label text-foreground/40 hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            All Speakers
          </Link>
          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 border-t border-foreground/20" />
            <span className="font-label text-foreground/40">Speaker Profile</span>
            <div className="flex-1 border-t border-foreground/20" />
          </div>
          <div>
            <p className="font-label text-foreground/40 mb-2">School of Hard Knocks</p>
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-3">
              {speakerName}
            </h1>
            <p className="font-body text-foreground/55 text-lg italic">
              {quotes.length} {quotes.length === 1 ? "quote" : "quotes"} in the collection
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
              <p className="font-display text-2xl font-bold mb-2">No quotes found</p>
              <p className="font-body text-foreground/50 italic">This speaker has no quotes yet.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {quotes.map((quote, i) => (
                <div key={quote.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <QuoteCard
                    quote={quote}
                    favoriteIds={favoriteIds}
                    onFavoriteToggle={refetchFavs}
                    variant="compact"
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
