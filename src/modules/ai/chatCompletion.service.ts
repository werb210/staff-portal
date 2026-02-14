import OpenAI from "openai";
import { retrieveContext, type QueryableDb } from "./knowledge.service";

type SessionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const openai = new OpenAI({
  apiKey: (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.OPENAI_API_KEY
});

export async function createChatCompletion(db: QueryableDb, message: string, sessionMessages: SessionMessage[]) {
  const context = await retrieveContext(db, message);

  return openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are Maya, AI assistant for Boreal Financial.

Rules:
- Never name lenders.
- Always speak in ranges.
- Do not guarantee approval.
- Use underwriting language.
- Capital sources include institutional, banking, private capital and internal programs.
- If startup funding requested, inform it is coming soon and collect contact info.
`
      },
      {
        role: "system",
        content: `Context:\n${context}`
      },
      ...sessionMessages
    ]
  });
}
