import { seedQuotes } from "./seedData.js";
import { shortsSeedData } from "./shortsSeedData.js";

interface NormalizedQuote {
  text: string;
  speakerName: string;
  topic: string;
  videoUrl: string;
}

let _cache: NormalizedQuote[] | null = null;

export function getAllQuotesForSearch(): NormalizedQuote[] {
  if (_cache) return _cache;
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
  _cache = [...long, ...shorts];
  return _cache;
}

export function searchQuotes(query: string, limit = 8): NormalizedQuote[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (words.length === 0) {
    const all = getAllQuotesForSearch();
    return all.sort(() => Math.random() - 0.5).slice(0, limit);
  }
  const all = getAllQuotesForSearch();
  const scored = all.map(q => {
    const haystack = `${q.text} ${q.topic} ${q.speakerName}`.toLowerCase();
    const score = words.reduce((n, w) => n + (haystack.includes(w) ? 1 : 0), 0);
    return { q, score };
  });
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.q);
}
