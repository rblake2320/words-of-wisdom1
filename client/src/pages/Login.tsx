import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLink = trpc.auth.requestLoginLink.useMutation({
    onSuccess: (data, variables) => {
      setError(null);
      setSentTo(variables.email);
      setDevLink("devLink" in data && data.devLink ? data.devLink : null);
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    requestLink.mutate({ email: email.trim() });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <p
          className="text-xs uppercase mb-8"
          style={{ letterSpacing: "3px", color: "#B8860B" }}
        >
          Words of Wisdom
        </p>
        <h1
          className="text-3xl mb-3"
          style={{ fontFamily: "Playfair Display, serif", color: "#1a1a1a" }}
        >
          Sign in
        </h1>

        {sentTo ? (
          <div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Check your inbox — we sent a sign-in link to <strong>{sentTo}</strong>.
              It expires in 15 minutes.
            </p>
            {devLink && (
              <p className="text-sm text-gray-400 mb-6">
                Dev mode (email not configured):{" "}
                <a href={devLink} className="underline" style={{ color: "#B8860B" }}>
                  open your sign-in link
                </a>
              </p>
            )}
            <button
              onClick={() => setSentTo(null)}
              className="text-sm underline text-gray-500 hover:text-gray-700"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-gray-600 leading-relaxed mb-8">
              Enter your email and we&rsquo;ll send you a one-time sign-in link. No
              password needed.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 mb-4 bg-white text-center outline-none focus:ring-2"
              style={{ border: "1px solid #e8e0d0", fontFamily: "Georgia, serif" }}
            />
            <button
              type="submit"
              disabled={requestLink.isPending}
              className="w-full py-3 text-white text-sm uppercase disabled:opacity-60"
              style={{ background: "#B8860B", letterSpacing: "2px" }}
            >
              {requestLink.isPending ? "Sending…" : "Email me a sign-in link"}
            </button>
            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
