import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Bookmark, BookmarkCheck, Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type Quote = {
  id: number;
  text: string;
  speakerName?: string | null;
  videoUrl?: string | null;
  videoTitle?: string | null;
  topic?: string | null;
  source?: string | null;
};

interface QuoteCardProps {
  quote: Quote;
  favoriteIds?: number[];
  onFavoriteToggle?: () => void;
  variant?: "default" | "hero" | "compact";
}

export default function QuoteCard({
  quote,
  favoriteIds = [],
  onFavoriteToggle,
  variant = "default",
}: QuoteCardProps) {
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const isFavorited = favoriteIds.includes(quote.id);

  const toggleFav = trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      onFavoriteToggle?.();
    },
    onError: () => toast.error("Could not update favorites"),
  });

  const handleCopy = async () => {
    const text = `"${quote.text}" — ${quote.speakerName ?? "School of Hard Knocks"}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Quote copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    toggleFav.mutate({ quoteId: quote.id });
  };

  if (variant === "compact") {
    return (
      <div className="group border-b border-foreground/10 py-5 hover:bg-accent/30 transition-colors px-2 -mx-2">
        <p className="quote-text text-base text-foreground/85 mb-2 leading-relaxed">
          "{quote.text}"
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {quote.speakerName && (
              <Link
                href={`/speakers/${encodeURIComponent(quote.speakerName)}`}
                className="font-label text-foreground/50 hover:text-foreground transition-colors"
              >
                {quote.speakerName}
              </Link>
            )}
            {quote.topic && (
              <span className="font-label text-foreground/30">{quote.topic}</span>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1 text-foreground/40 hover:text-foreground transition-colors" title="Copy">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleFavorite} className="p-1 text-foreground/40 hover:text-foreground transition-colors" title="Save">
              {isFavorited ? <BookmarkCheck className="w-3.5 h-3.5 text-foreground" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
            {quote.videoUrl && (
              <a href={quote.videoUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-foreground/40 hover:text-foreground transition-colors" title="Watch video">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group border border-foreground/10 p-6 hover:border-foreground/25 transition-all bg-card">
      {quote.topic && (
        <div className="mb-4">
          <span className="font-label text-foreground/40">{quote.topic}</span>
          <div className="mt-2 rule-line-gold w-8" style={{ borderTopWidth: "1px", borderTopColor: "var(--gold)" }} />
        </div>
      )}
      <blockquote className="quote-text text-lg text-foreground/85 mb-5 leading-relaxed">
        "{quote.text}"
      </blockquote>
      <div className="flex items-center justify-between">
        <div>
          {quote.speakerName && (
            <Link
              href={`/speakers/${encodeURIComponent(quote.speakerName)}`}
              className="font-display text-sm font-bold hover:text-foreground/60 transition-colors"
            >
              {quote.speakerName}
            </Link>
          )}
          <p className="font-label text-foreground/35 mt-0.5">School of Hard Knocks</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-foreground/30 hover:text-foreground transition-colors hover:bg-accent rounded"
            title="Copy quote"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleFavorite}
            className="p-2 text-foreground/30 hover:text-foreground transition-colors hover:bg-accent rounded"
            title={isFavorited ? "Remove from saved" : "Save quote"}
          >
            {isFavorited ? (
              <BookmarkCheck className="w-4 h-4 text-foreground" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
          {quote.videoUrl && (
            <a
              href={quote.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-foreground/30 hover:text-foreground transition-colors hover:bg-accent rounded"
              title="Watch source video"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
