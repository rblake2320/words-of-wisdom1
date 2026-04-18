import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { BookOpen, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Today" },
    { href: "/library", label: "Library" },
    { href: "/speakers", label: "Speakers" },
    { href: "/james", label: "About James" },
    ...(isAuthenticated ? [{ href: "/favorites", label: "Saved" }] : []),
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="border-b border-foreground/10 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpen className="w-4 h-4 text-foreground/60 group-hover:text-foreground transition-colors" />
            <span className="font-display font-bold text-sm tracking-tight">
              Words of Wisdom
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-label text-[0.65rem] transition-colors ${
                  location === link.href
                    ? "text-foreground"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="font-label text-foreground/50">{user?.name?.split(" ")[0]}</span>
                <button
                  onClick={() => logout()}
                  className="font-label text-foreground/40 hover:text-foreground transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href={getLoginUrl()}
                className="font-label text-foreground/60 hover:text-foreground transition-colors border border-foreground/20 px-3 py-1.5 hover:border-foreground/50"
              >
                Sign In
              </a>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-foreground/10 py-4 space-y-3 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block font-label text-foreground/60 hover:text-foreground transition-colors py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-foreground/10">
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="font-label text-foreground/40 hover:text-foreground transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <a href={getLoginUrl()} className="font-label text-foreground/60 hover:text-foreground">
                  Sign In
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
