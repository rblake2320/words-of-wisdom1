import { getAllQuotes } from "./db.js";
import { seedQuotes } from "./seedData.js";
import { shortsSeedData } from "./shortsSeedData.js";

interface NormalizedQuote {
  text: string;
  speakerName: string;
  topic: string;
  videoUrl: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

let _cache: NormalizedQuote[] | null = null;
let _cacheExpiresAt = 0;

function seedFallback(): NormalizedQuote[] {
  const long: NormalizedQuote[] = seedQuotes.map((q: any) => ({
    text: q.text,
    speakerName: q.speakerName ?? "",
    topic: q.topic ?? "",
    videoUrl: q.videoUrl ?? "",
  }));
  const shorts: NormalizedQuote[] = shortsSeedData.map((q: any) => ({
    text: q.quote,
    speakerName: q.speakerName ?? "",
    topic: q.topic ?? "",
    videoUrl: q.videoId ? `https://www.youtube.com/shorts/${q.videoId}` : "",
  }));
  return [...long, ...shorts];
}

/**
 * Quotes used to ground the AI Adviser. Sourced from the live database
 * (so admin-added quotes are included) with a 5-minute cache; falls back
 * to the static seed corpus when the DB is unavailable or empty.
 */
export async function getAllQuotesForSearch(): Promise<NormalizedQuote[]> {
  const now = Date.now();
  if (_cache && now < _cacheExpiresAt) return _cache;

  try {
    const rows = await getAllQuotes();
    if (rows.length > 0) {
      _cache = rows.map((q) => ({
        text: q.text,
        speakerName: q.speakerName ?? "",
        topic: q.topic ?? "",
        videoUrl: q.videoUrl ?? "",
      }));
      _cacheExpiresAt = now + CACHE_TTL_MS;
      return _cache;
    }
  } catch (error) {
    console.warn("[QuoteIndex] DB unavailable, using seed corpus:", error);
  }

  _cache = seedFallback();
  _cacheExpiresAt = now + CACHE_TTL_MS;
  return _cache;
}

export async function searchQuotes(query: string, limit = 8): Promise<NormalizedQuote[]> {
  const all = await getAllQuotesForSearch();
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) {
    return [...all].sort(() => Math.random() - 0.5).slice(0, limit);
  }
  const scored = all.map((q) => {
    const haystack = `${q.text} ${q.topic} ${q.speakerName}`.toLowerCase();
    const score = words.reduce((n, w) => n + (haystack.includes(w) ? 1 : 0), 0);
    return { q, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.q);
}
