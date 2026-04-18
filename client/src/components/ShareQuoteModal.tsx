import { useState } from "react";
import { X, Copy, Check, ExternalLink, Twitter, Facebook, Linkedin, Users } from "lucide-react";

interface Quote {
  id: number;
  text: string;
  speaker: string;
  topic?: string | null;
  videoUrl?: string | null;
}

interface ShareQuoteModalProps {
  quote: Quote;
  onClose: () => void;
}

export default function ShareQuoteModal({ quote, onClose }: ShareQuoteModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `"${quote.text}"\n\n— ${quote.speaker}\n\nVia Words of Wisdom · The School of Hard Knocks`;
  const appUrl = window.location.origin;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${quote.text.slice(0, 200)}..." — ${quote.speaker} | @hardknocksedu`)}&url=${encodeURIComponent(appUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = shareText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Words of Wisdom", text: shareText, url: appUrl });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(30,24,18,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg rounded-sm overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#faf7f2" }}
      >
        {/* Gold top bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #b8960c, #d4af37, #b8960c)" }} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="px-7 pt-6 pb-7">
          {/* Header */}
          <p className="text-xs tracking-[0.25em] uppercase text-stone-400 mb-4">Share This Wisdom</p>

          {/* Quote card preview */}
          <div
            className="rounded-sm p-5 mb-5"
            style={{ backgroundColor: "#1a1612", border: "1px solid #3d3020" }}
          >
            {quote.topic && (
              <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "#d4af37" }}>
                {quote.topic}
              </p>
            )}
            <p
              className="text-base italic leading-relaxed mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#faf7f2", fontSize: "1.1rem" }}
            >
              "{quote.text.length > 220 ? quote.text.slice(0, 220) + "…" : quote.text}"
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">— {quote.speaker}</p>
                <p className="text-xs" style={{ color: "rgba(212,175,55,0.6)" }}>
                  The School of Hard Knocks
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#d4af37", color: "#1a1612", fontFamily: "'Playfair Display', serif" }}
              >
                W
              </div>
            </div>
          </div>

          {/* Copy full text */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm text-sm font-semibold tracking-widest uppercase transition-all mb-3"
            style={{
              backgroundColor: copied ? "#2d5a27" : "#1a1612",
              color: copied ? "#7fcf6e" : "#faf7f2",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied to Clipboard" : "Copy Quote Text"}
          </button>

          {/* Social share row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#f0ebe0", color: "#1a1612", border: "1px solid #d4c5a0" }}
            >
              <Twitter size={13} />
              Twitter
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#f0ebe0", color: "#1a1612", border: "1px solid #d4c5a0" }}
            >
              <Facebook size={13} />
              Facebook
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-sm text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#f0ebe0", color: "#1a1612", border: "1px solid #d4c5a0" }}
            >
              <Linkedin size={13} />
              LinkedIn
            </a>
          </div>

          {/* Native share (mobile) */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-80 mb-4"
              style={{ backgroundColor: "#f0ebe0", color: "#1a1612", border: "1px solid #d4c5a0" }}
            >
              Share via Device
            </button>
          )}

          {/* Video source link */}
          {quote.videoUrl && (
            <a
              href={quote.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-sm text-xs tracking-widest uppercase transition-opacity hover:opacity-80 mb-4"
              style={{ border: "1px solid #d4c5a0", color: "#6b5d3f" }}
            >
              <ExternalLink size={12} />
              Watch the Source Interview
            </a>
          )}

          {/* Skool CTA */}
          <div
            className="rounded-sm p-4 flex items-center justify-between gap-3"
            style={{ backgroundColor: "#1a1612" }}
          >
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase mb-0.5" style={{ color: "#d4af37" }}>
                Want more wisdom like this?
              </p>
              <p className="text-xs text-stone-400">
                Join James's School of Mentors community
              </p>
            </div>
            <a
              href="https://www.skool.com/school-of-mentors-1850/about"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold tracking-wide uppercase whitespace-nowrap transition-opacity hover:opacity-90 flex-shrink-0"
              style={{ backgroundColor: "#d4af37", color: "#1a1612" }}
            >
              <Users size={12} />
              Join Now
            </a>
          </div>
        </div>

        {/* Gold bottom bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #b8960c, #d4af37, #b8960c)" }} />
      </div>
    </div>
  );
}
