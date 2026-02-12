import { NextRequest } from "next/server";
import { HttpAgent } from "@ag-ui/client";
import { CopilotRuntime, ExperimentalEmptyAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";

export const runtime = "nodejs";

const agent = new HttpAgent({
  url: process.env.COPILOT_AGENT_URL || "http://localhost:3000/api/agui",
});

const copilot = new CopilotRuntime({
  agents: {
    routerAgent: agent,
  },
});

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilot,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
}

