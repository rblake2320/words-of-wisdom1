import { useEffect, useState } from "react";
import { X, BookOpen, Users, TrendingUp, Play } from "lucide-react";

const WELCOME_KEY = "wow_welcome_seen_v1";

export default function WelcomeScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_KEY);
    if (!seen) {
      // Small delay so the page loads first
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(WELCOME_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(30,24,18,0.72)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-2xl rounded-sm overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#faf7f2", border: "1px solid #d4c5a0" }}
      >
        {/* Top gold rule */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #b8960c, #d4af37, #b8960c)" }} />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-8 pb-6">
          {/* Eyebrow */}
          <p className="text-xs tracking-[0.25em] text-stone-400 uppercase mb-3">
            Welcome to
          </p>

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif", color: "#1a1612" }}
          >
            Words of Wisdom
          </h1>
          <p
            className="text-lg italic mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#6b5d3f" }}
          >
            Daily counsel from those who built empires.
          </p>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: "#d4c5a0", marginBottom: "1.5rem" }} />

          {/* About section */}
          <div className="flex gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: "#1a1612", color: "#d4af37", fontFamily: "'Playfair Display', serif" }}
            >
              JD
            </div>
            <div>
              <p className="font-semibold text-stone-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Curated by James Dumoulin
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                Founder of <strong>The School of Hard Knocks</strong> — a media company with 2M+ subscribers and 
                287M+ views dedicated to financial literacy. Every quote in this app comes directly from James's 
                interviews with real millionaires and billionaires.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: BookOpen, value: "559+", label: "Verified Quotes" },
              { icon: Users, value: "2M+", label: "YouTube Subscribers" },
              { icon: TrendingUp, value: "287M+", label: "Total Views" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="text-center py-3 px-2 rounded-sm"
                style={{ backgroundColor: "#f0ebe0", border: "1px solid #d4c5a0" }}
              >
                <Icon size={16} className="mx-auto mb-1" style={{ color: "#b8960c" }} />
                <p className="font-bold text-stone-800 text-lg leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {value}
                </p>
                <p className="text-xs text-stone-500 mt-0.5 tracking-wide uppercase">{label}</p>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://www.skool.com/school-of-mentors-1850/about"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm text-sm font-semibold tracking-wide uppercase transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1a1612", color: "#d4af37", fontFamily: "'Playfair Display', serif", letterSpacing: "0.1em" }}
            >
              <Users size={15} />
              Join School of Mentors
            </a>
            <a
              href="https://www.youtube.com/@theschoolofhardknocks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-sm text-sm font-semibold tracking-wide uppercase transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#f0ebe0", color: "#1a1612", border: "1px solid #1a1612", fontFamily: "'Playfair Display', serif", letterSpacing: "0.1em" }}
            >
              <Play size={15} />
              Watch the Channel
            </a>
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="w-full mt-4 text-xs text-stone-400 hover:text-stone-600 transition-colors tracking-widest uppercase"
          >
            Enter the Library →
          </button>
        </div>

        {/* Bottom gold rule */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #b8960c, #d4af37, #b8960c)" }} />
      </div>
    </div>
  );
}
