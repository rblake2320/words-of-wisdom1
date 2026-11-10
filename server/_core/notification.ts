import { z } from "zod";
import { sendEmail } from "../email";
export type NotificationPayload = { title: string; content: string };
export async function notifyOwner(input: NotificationPayload): Promise<boolean> {
  const payload = z.object({ title: z.string().trim().min(1).max(1200), content: z.string().trim().min(1).max(20000) }).parse(input);
  if (!process.env.OWNER_EMAIL) return false;
  const safe = payload.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return sendEmail(process.env.OWNER_EMAIL, payload.title, `<pre>${safe}</pre>`);
}
