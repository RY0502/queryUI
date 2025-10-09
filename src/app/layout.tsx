import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Definitive AI',
  description: 'Created by RYaxn',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <Script id="flowise-chatbot" strategy="lazyOnload">
          {`
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js";
            script.type = "module";
            script.async = true;
            script.onload = () => {
              if (window.Chatbot) {
                window.Chatbot.init({
                  chatflowid: "6a6a6d1d-acd4-44df-b5fd-74e2ce2ab9ec",
                  apiHost: "https://cloud.flowiseai.com",
                });
              }
            };
            document.body.appendChild(script);
          `}
        </Script>
      </body>
    </html>
  );
}
