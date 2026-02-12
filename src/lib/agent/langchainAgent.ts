import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";

function hasLiveKeywords(text: string): boolean {
  const kws = ["now", "today", "current", "live", "latest"];
  const t = text.toLowerCase();
  return kws.some((k) => t.includes(k));
}

type Msg = { role: "user" | "assistant" | "system"; content: string };

function lastUserContent(messages: Msg[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return "";
}

export async function* runAgentChatStream(messages: Msg[]): AsyncGenerator<string, void, unknown> {
  type Chunk = { content?: string; text?: string };
  const mistral = new ChatMistralAI({
    model: process.env.MISTRAL_MODEL || "mistral-large-latest",
  });
  const geminiBase = new ChatGoogle({
    model: process.env.GOOGLE_MODEL || "gemini-2.5-flash",
  }).bindTools([{ googleSearch: {} }]);

  const input = lastUserContent(messages).trim();
  if (!input) {
    yield "Connected. Ask me something to get started.";
    return;
  }

  let stream: AsyncIterable<Chunk>;
  if (hasLiveKeywords(input)) {
    stream = await geminiBase.stream(input);
  } else {
    stream = await mistral.stream([
      [
        "system",
        "You are a helpful assistant that answers user queries to the best of your knowledge.",
      ],
      ["human", input],
    ]);
  }

  for await (const chunk of stream) {
    const text = (chunk.text ?? chunk.content ?? "");
    if (text) {
      yield text;
    }
  }
}

export async function runAgentChat(messages: Msg[]): Promise<string> {
  let out = "";
  for await (const delta of runAgentChatStream(messages)) {
    out += delta;
  }
  return out;
}
