import { ExternalLink, Youtube, Instagram, Linkedin, Twitter, Users, TrendingUp, BookOpen, DollarSign, Play, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const businesses = [
  {
    name: "School of Mentors",
    type: "Community",
    description: "The #1 entrepreneurship community — weekly live calls with billionaires and millionaires, 100+ hours of masterclasses, and access to a 9-figure network.",
    metric: "6,100+ members",
    metricLabel: "@ $49/month",
    link: "https://www.skool.com/school-of-mentors-1850/about",
    cta: "Join the Community",
    highlight: true,
  },
  {
    name: "The School of Hard Knocks",
    type: "Media Channel",
    description: "A media company promoting financial literacy through street interviews with real millionaires and billionaires. Founded in June 2021 at age 19.",
    metric: "2.03M",
    metricLabel: "YouTube subscribers",
    link: "https://www.youtube.com/@theschoolofhardknocks",
    cta: "Watch the Channel",
    highlight: false,
  },
  {
    name: "Content Agency",
    type: "Agency",
    description: "Done-for-you personal brand building for wealthy entrepreneurs. James helps the millionaires he interviews build their own audiences and content presence.",
    metric: "~15 clients",
    metricLabel: "high-net-worth individuals",
    link: null,
    cta: null,
    highlight: false,
  },
  {
    name: "SOHK Newsletter",
    type: "Newsletter",
    description: "Weekly long-form profiles of the entrepreneurs featured on the channel — a written companion to the video content, delivered directly to subscribers' inboxes.",
    metric: "Weekly",
    metricLabel: "on Beehiiv",
    link: "https://schoolofhardknocks.beehiiv.com/",
    cta: "Subscribe",
    highlight: false,
  },
];

const stats = [
  { icon: Users, value: "15M+", label: "Total Followers" },
  { icon: Play, value: "4B+", label: "Total Views" },
  { icon: BookOpen, value: "700+", label: "Interviews" },
  { icon: DollarSign, value: "$300K+", label: "Monthly Revenue" },
];

const socials = [
  { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@theschoolofhardknocks", color: "#FF0000" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/realjamesdumoulin/", color: "#E1306C" },
  { icon: Twitter, label: "Twitter / X", href: "https://twitter.com/hardknocksedu", color: "#1DA1F2" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/the-school-of-hard-knocks-llc", color: "#0077B5" },
];

export default function JamesProfile() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf7f2" }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#1a1612", paddingTop: "5rem", paddingBottom: "4rem" }}>
        {/* Decorative lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: "#d4af37" }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ backgroundColor: "#d4af37" }} />
        </div>

        <div className="container max-w-4xl mx-auto px-6 text-center relative">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#d4af37" }}>
            The Curator
          </p>

          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold"
            style={{ backgroundColor: "#d4af37", color: "#1a1612", fontFamily: "'Playfair Display', serif", border: "3px solid #b8960c" }}
          >
            JD
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: "#faf7f2" }}
          >
            James Dumoulin
          </h1>
          <p
            className="text-xl italic mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "#d4af37" }}
          >
            Founder, The School of Hard Knocks
          </p>
          <p className="text-sm text-stone-400 tracking-wide mb-8">
            Austin, Texas · Founded June 2021 · Age 23
          </p>

          {/* Gold rule */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 max-w-24" style={{ backgroundColor: "#d4af37" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#d4af37" }} />
            <div className="h-px flex-1 max-w-24" style={{ backgroundColor: "#d4af37" }} />
          </div>

          {/* Bio */}
          <p className="text-stone-300 leading-relaxed max-w-2xl mx-auto mb-8 text-base">
            At 19 years old, James walked the streets of downtown Austin asking strangers for interviews — 
            collecting 50 rejections for every yes. Four years later, that relentless hustle has become 
            a $300,000/month media empire with 15 million followers and over 700 interviews with real 
            millionaires and billionaires. Every quote in this app comes directly from those conversations.
          </p>

          {/* Social links */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs tracking-widest uppercase transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)", color: "#d4af37" }}
              >
                <Icon size={13} />
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ backgroundColor: "#f0ebe0", borderBottom: "1px solid #d4c5a0" }}>
        <div className="container max-w-4xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon size={18} className="mx-auto mb-1" style={{ color: "#b8960c" }} />
                <p className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#1a1612" }}>
                  {value}
                </p>
                <p className="text-xs text-stone-500 tracking-wide uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Businesses */}
      <section className="container max-w-4xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.25em] uppercase text-stone-400 mb-2">The Empire</p>
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "#1a1612" }}
          >
            Four Revenue Verticals
          </h2>
          <div className="w-12 h-px mx-auto mt-4" style={{ backgroundColor: "#d4af37" }} />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {businesses.map((biz) => (
            <div
              key={biz.name}
              className="rounded-sm p-6 flex flex-col"
              style={{
                backgroundColor: biz.highlight ? "#1a1612" : "#fff",
                border: biz.highlight ? "none" : "1px solid #d4c5a0",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p
                    className="text-xs tracking-[0.2em] uppercase mb-1"
                    style={{ color: biz.highlight ? "#d4af37" : "#b8960c" }}
                  >
                    {biz.type}
                  </p>
                  <h3
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: biz.highlight ? "#faf7f2" : "#1a1612",
                    }}
                  >
                    {biz.name}
                  </h3>
                </div>
                <div className="text-right">
                  <p
                    className="text-lg font-bold leading-none"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: biz.highlight ? "#d4af37" : "#1a1612",
                    }}
                  >
                    {biz.metric}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: biz.highlight ? "rgba(212,175,55,0.7)" : "#9c8a6e" }}
                  >
                    {biz.metricLabel}
                  </p>
                </div>
              </div>

              <p
                className="text-sm leading-relaxed flex-1 mb-4"
                style={{ color: biz.highlight ? "#c5b89a" : "#6b5d3f" }}
              >
                {biz.description}
              </p>

              {biz.link && biz.cta && (
                <a
                  href={biz.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-80 mt-auto"
                  style={{ color: biz.highlight ? "#d4af37" : "#1a1612" }}
                >
                  {biz.cta}
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Skool CTA banner */}
      <section
        className="py-14"
        style={{ backgroundColor: "#1a1612", borderTop: "3px solid #d4af37" }}
      >
        <div className="container max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#d4af37" }}>
            Ready to go deeper?
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: "#faf7f2" }}
          >
            Join School of Mentors
          </h2>
          <p className="text-stone-400 mb-8 leading-relaxed">
            Weekly live calls with billionaires and millionaires. 100+ hours of on-demand masterclasses. 
            Access to the 9-Figure Network. 6,100+ members and growing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.skool.com/school-of-mentors-1850/about"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-sm text-sm font-semibold tracking-widest uppercase transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#d4af37", color: "#1a1612", fontFamily: "'Playfair Display', serif" }}
            >
              <Users size={15} />
              Join for $49/month
              <ArrowRight size={15} />
            </a>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-sm text-sm font-semibold tracking-widest uppercase transition-opacity hover:opacity-80"
              style={{ border: "1px solid rgba(212,175,55,0.4)", color: "#d4af37" }}
            >
              <BookOpen size={15} />
              Back to Quotes
            </Link>
          </div>
          <p className="text-stone-600 text-xs mt-4">7-day free trial available</p>
        </div>
      </section>
    </div>
  );
}
