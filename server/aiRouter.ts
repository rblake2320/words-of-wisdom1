import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc.js";
import { searchQuotes } from "./quoteIndex.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

export const aiRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        return "The AI Adviser is almost ready! Ask James anything about business, mindset, wealth, or entrepreneurship.";
      }

      const lastUser = [...input.messages]
        .reverse()
        .find((m) => m.role === "user")?.content ?? "";

      const relevant = searchQuotes(lastUser, 8);
      const quoteBlock =
        relevant.length > 0
          ? `Relevant wisdom from School of Hard Knocks guests:\n${relevant
              .map((q, i) => `${i + 1}. "${q.text}" — ${q.speakerName}`)
              .join("\n")}`
          : "";

      const systemPrompt = `You are the AI Adviser for School of Hard Knocks, James Dumoulin's platform for entrepreneurial wisdom. You answer questions using real insights from 728 interviews with entrepreneurs, investors, and self-made success stories.

${quoteBlock}

Rules:
- Be direct, practical, and inspiring
- Reference specific quotes above when relevant  
- Keep answers under 150 words
- End with a relevant call to action`;

      const resp = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...input.messages.filter((m) => m.role !== "system"),
          ],
          max_tokens: 250,
          temperature: 0.7,
        }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        console.error("Groq error:", err);
        throw new Error("AI service temporarily unavailable. Please try again.");
      }

      const data = (await resp.json()) as any;
      return data.choices[0].message.content as string;
    }),
});
