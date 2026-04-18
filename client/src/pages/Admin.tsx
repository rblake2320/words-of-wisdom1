import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Plus, Trash2, Send, BookOpen, Users, Tag, Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({
    text: "",
    speakerName: "",
    videoUrl: "",
    videoTitle: "",
    topic: "",
  });

  const utils = trpc.useUtils();

  const { data: stats, refetch: refetchStats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: quotes = [], refetch: refetchQuotes } = trpc.quotes.list.useQuery(
    {},
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const invalidateAll = () => {
    refetchQuotes();
    refetchStats();
    utils.quotes.stats.invalidate();
    utils.quotes.speakerNames.invalidate();
    utils.quotes.topics.invalidate();
    utils.quotes.daily.invalidate();
  };

  const addQuote = trpc.quotes.add.useMutation({
    onSuccess: () => {
      toast.success("Quote added successfully");
      setForm({ text: "", speakerName: "", videoUrl: "", videoTitle: "", topic: "" });
      invalidateAll();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteQuote = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      toast.success("Quote deleted");
      invalidateAll();
    },
    onError: (e) => toast.error(e.message),
  });

  const sendNotification = trpc.admin.sendDailyNotification.useMutation({
    onSuccess: (data) => toast.success(`Notification sent to ${data.sent} subscriber(s)`),
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    addQuote.mutate({
      text: form.text.trim(),
      speakerName: form.speakerName || undefined,
      videoUrl: form.videoUrl || undefined,
      videoTitle: form.videoTitle || undefined,
      topic: form.topic || undefined,
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="container py-20 text-center">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen">
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Sign in required</h1>
          <a href={getLoginUrl()} className="font-label border border-foreground/20 px-5 py-2.5 hover:border-foreground/50 transition-all">
            Sign In
          </a>
        </div>
      </main>
    );
  }

  if (user?.role !== "admin") {
    return (
      <main className="min-h-screen">
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-3">Access Restricted</h1>
          <p className="font-body text-foreground/55 italic">This area is reserved for the owner.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b border-foreground/10">
        <div className="container py-12">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex-1 border-t border-foreground/20" />
            <span className="font-label text-foreground/40">Owner Panel</span>
            <div className="flex-1 border-t border-foreground/20" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-2">
            Admin <span className="italic font-normal">Dashboard</span>
          </h1>
          <p className="font-body text-foreground/55 italic">Manage quotes, speakers, and notifications</p>
        </div>
      </section>

      <div className="container py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-foreground/10 mb-10">
            {[
              { icon: BookOpen, label: "Total Quotes", value: stats.totalQuotes },
              { icon: Users, label: "Speakers", value: stats.totalSpeakers },
              { icon: Tag, label: "Topics", value: stats.totalTopics },
              { icon: Bell, label: "Subscribers", value: stats.totalSubscribers },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-background p-6">
                <Icon className="w-4 h-4 text-foreground/30 mb-3" />
                <p className="font-display text-3xl font-black">{value}</p>
                <p className="font-label text-foreground/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Quote Form */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-4 h-4 text-foreground/40" />
              <h2 className="font-display text-xl font-bold">Add New Quote</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-label text-foreground/50 block mb-1.5">Quote Text *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  rows={4}
                  required
                  placeholder="Enter the quote text..."
                  className="w-full border border-foreground/15 bg-transparent px-3 py-2.5 font-body text-sm focus:outline-none focus:border-foreground/40 resize-none placeholder:text-foreground/30"
                />
              </div>
              <div>
                <label className="font-label text-foreground/50 block mb-1.5">Speaker Name</label>
                <input
                  type="text"
                  value={form.speakerName}
                  onChange={(e) => setForm({ ...form, speakerName: e.target.value })}
                  placeholder="e.g. Dana White"
                  className="w-full border border-foreground/15 bg-transparent px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground/40 placeholder:text-foreground/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label text-foreground/50 block mb-1.5">Topic</label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder="e.g. mindset"
                    className="w-full border border-foreground/15 bg-transparent px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground/40 placeholder:text-foreground/30"
                  />
                </div>
                <div>
                  <label className="font-label text-foreground/50 block mb-1.5">Video Title</label>
                  <input
                    type="text"
                    value={form.videoTitle}
                    onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
                    placeholder="YouTube video title"
                    className="w-full border border-foreground/15 bg-transparent px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground/40 placeholder:text-foreground/30"
                  />
                </div>
              </div>
              <div>
                <label className="font-label text-foreground/50 block mb-1.5">Video URL</label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border border-foreground/15 bg-transparent px-3 py-2 font-body text-sm focus:outline-none focus:border-foreground/40 placeholder:text-foreground/30"
                />
              </div>
              <button
                type="submit"
                disabled={addQuote.isPending || !form.text.trim()}
                className="w-full font-label bg-foreground text-background py-3 hover:bg-foreground/80 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                {addQuote.isPending ? "Adding..." : "Add Quote"}
              </button>
            </form>

            {/* Send notification */}
            <div className="mt-8 pt-8 border-t border-foreground/10">
              <h3 className="font-display text-lg font-bold mb-2">Daily Notification</h3>
              <p className="font-body text-foreground/50 italic text-sm mb-4">
                Send today's quote to all active subscribers.
              </p>
              <button
                onClick={() => sendNotification.mutate()}
                disabled={sendNotification.isPending}
                className="flex items-center gap-2 font-label text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/50 px-4 py-2.5 transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                {sendNotification.isPending ? "Sending..." : "Send Today's Quote"}
              </button>
            </div>
          </div>

          {/* Quote list */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-4 h-4 text-foreground/40" />
              <h2 className="font-display text-xl font-bold">All Quotes ({quotes.length})</h2>
            </div>
            <div className="space-y-0 max-h-[600px] overflow-y-auto border border-foreground/10">
              {quotes.map((quote) => (
                <div key={quote.id} className="flex items-start gap-3 p-4 border-b border-foreground/8 hover:bg-accent/20 group">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-foreground/80 line-clamp-2 italic">
                      "{quote.text}"
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {quote.speakerName && (
                        <span className="font-label text-foreground/40">{quote.speakerName}</span>
                      )}
                      {quote.topic && (
                        <span className="font-label text-foreground/25">· {quote.topic}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Delete this quote?")) {
                        deleteQuote.mutate({ id: quote.id });
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-foreground/30 hover:text-destructive transition-all"
                    title="Delete quote"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
