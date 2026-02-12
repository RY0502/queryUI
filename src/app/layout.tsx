import type { Metadata } from "next";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { CopilotKit } from "@copilotkit/react-core";

export const metadata: Metadata = {
  title: "Definitive AI",
  description: "Assistant UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeUrl = process.env.NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL || "http://localhost:3000/api/copilotkit";
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <CopilotKit runtimeUrl={runtimeUrl} agent="routerAgent">
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
