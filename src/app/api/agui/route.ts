import { NextRequest } from "next/server";
import { runAgentChatStream } from "@/lib/agent/langchainAgent";

export const runtime = "nodejs";

type RunAgentInput = {
  thread_id: string;
  run_id: string;
  messages: { id: string; role: "user" | "assistant" | "system"; content: string }[];
  tools?: unknown[];
  context?: unknown[];
  forwarded_props?: Record<string, unknown>;
  state?: Record<string, unknown>;
};

function encodeEvent(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

export async function POST(req: NextRequest) {
  const input = (await req.json()) as RunAgentInput;
  const userMsg = [...(input.messages || [])]
    .reverse()
    .find((m) => m.role === "user");
  const prompt = userMsg?.content ?? "";

  const stream = new ReadableStream({
    async start(controller) {
      const messageId = crypto.randomUUID();
      const heartbeatMs = 10000;
      let hb: NodeJS.Timeout | null = null;
      const startHeartbeat = () => {
        if (hb) return;
        hb = setInterval(() => {
          controller.enqueue(
            new TextEncoder().encode(
              encodeEvent("RAW", { label: "HEARTBEAT", timestamp: new Date().toISOString() })
            )
          );
        }, heartbeatMs);
      };
      const stopHeartbeat = () => {
        if (hb) {
          clearInterval(hb);
          hb = null;
        }
      };
      controller.enqueue(
        new TextEncoder().encode(
          encodeEvent("RUN_STARTED", {
            threadId: input.thread_id || input["threadId"],
            runId: input.run_id || input["runId"],
          })
        )
      );

      controller.enqueue(
        new TextEncoder().encode(
          encodeEvent("STATE_SNAPSHOT", {
            status: { phase: "initialized", error: null, timestamp: new Date().toISOString() },
            ui: { showInput: true, activeTab: "chat", loading: false },
          })
        )
      );

      controller.enqueue(
        new TextEncoder().encode(
          encodeEvent("MESSAGES_SNAPSHOT", {
            messages: (input.messages || []).map((m) => ({
              id: m.id || crypto.randomUUID(),
              role: m.role,
              content: m.content,
              timestamp: new Date().toISOString(),
            })),
          })
        )
      );

      controller.enqueue(
        new TextEncoder().encode(
          encodeEvent("TEXT_MESSAGE_START", {
            messageId,
            role: "assistant",
          })
        )
      );

      if (!prompt) {
        controller.enqueue(
          new TextEncoder().encode(
            encodeEvent("TEXT_MESSAGE_CONTENT", {
              messageId,
              delta: "Connected. Ask me something to get started.",
            })
          )
        );
      } else {
        try {
          startHeartbeat();
          const gen = runAgentChatStream(
            input.messages || [{ id: crypto.randomUUID(), role: "user", content: prompt }]
          );
          for await (const delta of gen) {
            controller.enqueue(
              new TextEncoder().encode(
                encodeEvent("TEXT_MESSAGE_CONTENT", { messageId, delta })
              )
            );
          }
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
          controller.enqueue(
            new TextEncoder().encode(
              encodeEvent("RUN_ERROR", {
                messageId,
                error: errorMsg,
                timestamp: new Date().toISOString(),
              })
            )
          );
          controller.enqueue(
            new TextEncoder().encode(
              encodeEvent("STATE_SNAPSHOT", {
                status: { phase: "error", error: errorMsg, timestamp: new Date().toISOString() },
                ui: { showInput: true, activeTab: "chat", loading: false },
              })
            )
          );
        } finally {
          stopHeartbeat();
        }
      }

      controller.enqueue(
        new TextEncoder().encode(
          encodeEvent("TEXT_MESSAGE_END", { messageId })
        )
      );
      controller.enqueue(
        new TextEncoder().encode(
          encodeEvent("RUN_FINISHED", {
            threadId: input.thread_id || input["threadId"],
            runId: input.run_id || input["runId"],
          })
        )
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
