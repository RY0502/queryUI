'use client';

import { CopilotKit } from "@copilotkit/react-core";

export default function CopilotProvider({ children }: { children: React.ReactNode }) {
  const publicApiKey = process.env.NEXT_PUBLIC_COPILOT_PUBLIC_API_KEY || "";
  return <CopilotKit publicApiKey={publicApiKey as string}>{children}</CopilotKit>;
}
