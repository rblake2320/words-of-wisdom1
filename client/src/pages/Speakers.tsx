import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Speakers() {
  const { data: speakerNames = [], isLoading } = trpc.quotes.speakerNames.useQuery();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-foreground/10">
        <div className="container py-12 md:py-16">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 border-t border-foreground/20" />
            <span className="font-label text-foreground/40">The Voices</span>
            <div className="flex-1 border-t border-foreground/20" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-3">
              The <span className="italic font-normal">Speakers</span>
            </h1>
            <p className="font-body text-foreground/55 text-lg italic">
              Entrepreneurs, investors, and visionaries who built from nothing
            </p>
          </div>
        </div>
      </section>

      {/* Speaker grid */}
      <section>
        <div className="container py-10">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : speakerNames.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl font-bold">No speakers yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-foreground/10">
              {speakerNames.map((name, i) => (
                <Link
                  key={name}
                  href={`/speakers/${encodeURIComponent(name)}`}
                  className="bg-background p-6 hover:bg-accent/30 transition-colors group flex items-center justify-between animate-fade-in"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <div>
                    <h3 className="font-display text-lg font-bold group-hover:text-foreground/70 transition-colors">
                      {name}
                    </h3>
                    <p className="font-label text-foreground/35 mt-0.5">School of Hard Knocks</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
