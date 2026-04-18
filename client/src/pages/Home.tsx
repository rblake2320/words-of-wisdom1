import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Copy, Check, Bookmark, BookmarkCheck, ExternalLink, Bell, BellOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [subEmail, setSubEmail] = useState(user?.email ?? "");

  const { data: daily, isLoading } = trpc.quotes.daily.useQuery();
  const { data: stats } = trpc.quotes.stats.useQuery();
  const { data: favoriteIds = [], refetch: refetchFavs } = trpc.favorites.ids.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: subscription, refetch: refetchSub } = trpc.subscriptions.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const toggleFav = trpc.favorites.toggle.useMutation({
    onSuccess: () => refetchFavs(),
    onError: () => toast.error("Could not update favorites"),
  });

  const upsertSub = trpc.subscriptions.upsert.useMutation({
    onSuccess: () => {
      refetchSub();
      setShowSubscribeForm(false);
      toast.success(subscription?.active ? "Unsubscribed from daily wisdom" : "Subscribed to daily wisdom!");
    },
    onError: () => toast.error("Could not update subscription"),
  });

  const isFavorited = daily ? favoriteIds.includes(daily.id) : false;

  const handleCopy = async () => {
    if (!daily) return;
    await navigator.clipboard.writeText(`"${daily.text}" — ${daily.speakerName ?? "School of Hard Knocks"}`);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (daily) toggleFav.mutate({ quoteId: daily.id });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    upsertSub.mutate({ email: subEmail, active: true });
  };

  const handleUnsubscribe = () => {
    if (!subscription) return;
    upsertSub.mutate({ email: subscription.email, active: false });
  };

  // Format today's date in editorial style
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="min-h-screen">
      {/* Hero section */}
      <section className="border-b border-foreground/10">
        <div className="container py-16 md:py-24">
          {/* Top rule + date */}
          <div className="flex items-center gap-6 mb-12">
            <div className="flex-1 border-t border-foreground/20" />
            <span className="font-label text-foreground/40 whitespace-nowrap">{dateStr}</span>
            <div className="flex-1 border-t border-foreground/20" />
          </div>

          {/* Masthead */}
          <div className="text-center mb-16">
            <p className="font-label text-foreground/40 mb-4 tracking-widest">The School of Hard Knocks</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight text-foreground mb-4">
              Today's<br />
              <span className="italic font-normal">Wisdom</span>
            </h1>
            <p className="font-label text-foreground/35">Daily counsel from those who built empires</p>
          </div>

          {/* Daily Quote */}
          {isLoading ? (
            <div className="max-w-3xl mx-auto">
              <div className="h-8 bg-foreground/5 rounded mb-4 animate-pulse" />
              <div className="h-8 bg-foreground/5 rounded mb-4 animate-pulse w-4/5" />
              <div className="h-8 bg-foreground/5 rounded animate-pulse w-3/5" />
            </div>
          ) : daily ? (
            <div className="max-w-3xl mx-auto animate-slide-up">
              {/* Gold rule */}
              <div className="w-12 border-t-2 mb-8 mx-auto" style={{ borderColor: "var(--gold)" }} />

              {/* Topic tag */}
              {daily.topic && (
                <p className="font-label text-foreground/35 text-center mb-6">{daily.topic}</p>
              )}

              {/* Quote */}
              <blockquote className="quote-text text-2xl md:text-3xl lg:text-4xl text-foreground text-center leading-relaxed mb-8">
                "{daily.text}"
              </blockquote>

              {/* Attribution */}
              <div className="text-center mb-10">
                {daily.speakerName ? (
                  <Link
                    href={`/speakers/${encodeURIComponent(daily.speakerName)}`}
                    className="font-display text-xl font-bold hover:text-foreground/60 transition-colors"
                  >
                    {daily.speakerName}
                  </Link>
                ) : (
                  <span className="font-display text-xl font-bold">School of Hard Knocks</span>
                )}
                {daily.videoTitle && (
                  <p className="font-label text-foreground/35 mt-1 max-w-sm mx-auto truncate">{daily.videoTitle}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 font-label text-foreground/50 hover:text-foreground border border-foreground/20 hover:border-foreground/50 px-4 py-2 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Quote"}
                </button>
                <button
                  onClick={handleFavorite}
                  className="flex items-center gap-2 font-label text-foreground/50 hover:text-foreground border border-foreground/20 hover:border-foreground/50 px-4 py-2 transition-all"
                >
                  {isFavorited ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  {isFavorited ? "Saved" : "Save"}
                </button>
                {daily.videoUrl && (
                  <a
                    href={daily.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-label text-foreground/50 hover:text-foreground border border-foreground/20 hover:border-foreground/50 px-4 py-2 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Watch Video
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center font-body text-foreground/50">No quote available today.</p>
          )}

          {/* Bottom rule */}
          <div className="flex items-center gap-6 mt-16">
            <div className="flex-1 border-t border-foreground/20" />
            <div className="w-2 h-2 bg-foreground/20 rotate-45" />
            <div className="flex-1 border-t border-foreground/20" />
          </div>
        </div>
      </section>

      {/* Subscription section */}
      <section className="border-b border-foreground/10">
        <div className="container py-12">
          <div className="max-w-lg mx-auto text-center">
            <p className="font-label text-foreground/40 mb-3">Daily Delivery</p>
            <h2 className="font-display text-2xl font-bold mb-3">Receive Wisdom Each Morning</h2>
            <p className="font-body text-foreground/60 mb-6 text-lg italic">
              A single quote, delivered to your inbox every day.
            </p>

            {isAuthenticated ? (
              subscription?.active ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="font-label text-foreground/50">Subscribed · {subscription.email}</span>
                  <button
                    onClick={handleUnsubscribe}
                    className="flex items-center gap-1.5 font-label text-foreground/40 hover:text-destructive transition-colors"
                  >
                    <BellOff className="w-3.5 h-3.5" />
                    Unsubscribe
                  </button>
                </div>
              ) : showSubscribeForm ? (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto">
                  <input
                    type="email"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 border border-foreground/20 bg-transparent px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground/50"
                  />
                  <button
                    type="submit"
                    disabled={upsertSub.isPending}
                    className="font-label bg-foreground text-background px-4 py-2 hover:bg-foreground/80 transition-colors disabled:opacity-50"
                  >
                    Subscribe
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => { setSubEmail(user?.email ?? ""); setShowSubscribeForm(true); }}
                  className="flex items-center gap-2 font-label text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/50 px-5 py-2.5 mx-auto transition-all"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Subscribe to Daily Wisdom
                </button>
              )
            ) : (
              <a
                href={getLoginUrl()}
                className="inline-flex items-center gap-2 font-label text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/50 px-5 py-2.5 transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                Sign in to Subscribe
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Navigation teasers */}
      <section>
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-foreground/10">
            <Link href="/library" className="bg-background p-8 hover:bg-accent/30 transition-colors group">
              <p className="font-label text-foreground/40 mb-3">Explore</p>
              <h3 className="font-display text-xl font-bold mb-2 group-hover:text-foreground/70 transition-colors">Quote Library</h3>
              <p className="font-body text-foreground/55 italic">Browse all {stats?.totalQuotes ?? "…"} pieces of wisdom, searchable by topic or speaker.</p>
            </Link>
            <Link href="/speakers" className="bg-background p-8 hover:bg-accent/30 transition-colors group">
              <p className="font-label text-foreground/40 mb-3">Profiles</p>
              <h3 className="font-display text-xl font-bold mb-2 group-hover:text-foreground/70 transition-colors">The Speakers</h3>
              <p className="font-body text-foreground/55 italic">Discover every voice — entrepreneurs, investors, and visionaries.</p>
            </Link>
            {isAuthenticated ? (
              <Link href="/favorites" className="bg-background p-8 hover:bg-accent/30 transition-colors group">
                <p className="font-label text-foreground/40 mb-3">Personal</p>
                <h3 className="font-display text-xl font-bold mb-2 group-hover:text-foreground/70 transition-colors">Your Saved Quotes</h3>
                <p className="font-body text-foreground/55 italic">Revisit the wisdom you've chosen to keep close.</p>
              </Link>
            ) : (
              <a href={getLoginUrl()} className="bg-background p-8 hover:bg-accent/30 transition-colors group">
                <p className="font-label text-foreground/40 mb-3">Personal</p>
                <h3 className="font-display text-xl font-bold mb-2 group-hover:text-foreground/70 transition-colors">Save Favorites</h3>
                <p className="font-body text-foreground/55 italic">Sign in to bookmark and revisit the quotes that resonate most.</p>
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
