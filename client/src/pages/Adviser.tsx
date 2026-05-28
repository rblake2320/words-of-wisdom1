import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AIChatBox from "@/components/AIChatBox";

type Message = { role: "system" | "user" | "assistant"; content: string };

const SUGGESTED = [
  "How do I start a business with no money?",
  "What's the mindset of successful entrepreneurs?",
  "How do I build wealth from scratch?",
  "What do self-made millionaires have in common?",
  "How do I overcome fear of failure?",
];

export default function Adviser() {
  const [messages, setMessages] = useState<Message[]>([]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, something went wrong. Please try again. (${err.message})`,
        },
      ]);
    },
  });

  const handleSend = (content: string) => {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: "Playfair Display, serif", color: "#1a1a1a" }}
          >
            AI Adviser
          </h1>
          <p className="text-gray-600 text-lg">
            Ask anything. Get answers drawn from 728 episodes of real-world wisdom.
          </p>
          <div
            className="mt-2 text-sm font-medium"
            style={{ color: "#B8860B" }}
          >
            Powered by School of Hard Knocks
          </div>
        </div>

        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{ border: "1px solid #e8e0d0", background: "#fff" }}
        >
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={chatMutation.isPending}
            suggestedPrompts={messages.length === 0 ? SUGGESTED : undefined}
            placeholder="Ask about business, mindset, wealth, entrepreneurship..."
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Responses are grounded in quotes and insights from School of Hard Knocks guests.
        </p>
      </div>
    </div>
  );
}
