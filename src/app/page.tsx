
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const AiIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-primary"
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
      <path d="M12 18a6 6 0 1 0 0-12" />
    </svg>
  );


export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseHtml, setResponseHtml] = useState('');
  const { toast } = useToast();
  const queryInputRef = useRef<HTMLTextAreaElement>(null);


  const handleFollowUp = () => {
    if (queryInputRef.current) {
      queryInputRef.current.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    toast({
      title: 'Current context is attached',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    
    let finalQuery = query;
    if (responseHtml) {
        finalQuery = `${query}.Previous context in html format-${responseHtml}.You may need to extract the text from html format before using it for context.`
    }
    
    setResponseHtml('');

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 120000); // 2 minutes timeout

    try {
      const response = await fetch(
        //'https://6894bf8b00245593cabc.fra.appwrite.run/',
        'https://usdiugdjvlmeteiwsrwg.supabase.co/functions/v1/multi-ai-query',
        {
         headers: {
         //'Content-Type': 'text/plain',
         'Content-Type': 'application/json',
         'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjNlNjE5YzJjIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2FsdC5zdXBhYmFzZS5pby9hdXRoL3YxIiwic3ViIjoiYjE4YWM5ZjktZGU3ZS00MmFjLWIyZDYtNmVmMDUyZTIxMTQxIiwiYXVkIjoiYXV0aGVudGljYXRlZCIsImV4cCI6MTc1NDg5NzgxOSwiaWF0IjoxNzU0ODk3MjE5LCJlbWFpbCI6InJhdmlfeWFkYXYwNTAyQHlhaG9vLmluIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnaXRodWIiLCJwcm92aWRlcnMiOlsiZ2l0aHViIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTc5MzMzMzk_dj00IiwiZW1haWwiOiJyYXZpX3lhZGF2MDUwMkB5YWhvby5pbiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL2FwaS5naXRodWIuY29tIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJSWTA1MDIiLCJwcm92aWRlcl9pZCI6IjE3OTMzMzM5Iiwic3ViIjoiMTc5MzMzMzkiLCJ1c2VyX25hbWUiOiJSWTA1MDIifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvYXV0aCIsInRpbWVzdGFtcCI6MTc1NDg5NTY0M31dLCJzZXNzaW9uX2lkIjoiMDM1YzI4YWQtM2QyYS00YjQ3LWI0NTctZTI0OGIyOWQ1ODkyIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.SxwbjS9g-8i_-wcUzX8eVR3Kzn8NXLEU6IuKHV61nTPexVO-ZPk-vBR0u2pOVzyZyNLcWGtizVE34wrJy-Xs_OvEzqqeoMMBjYhxTpNL3MHNfGZJCSGG8jWYzd3Ri6leZoXFjC4Okumnjc-3rtyKIdQTna9dZj3CGa9WUj-D3Rf1VIV_o4Z7SV82Bh833PqAUllx3wfPw15IxH4VJOM2AIkfjsadAN_4mz_ZxuoRIrdhV1eg89UMuUeqbPxcpbayP4MkGTX3fY-59344c2pal8fWg2GZa9_KzvbN9e9wvWCyWpFU0EP92B0CUuy0UZ176X2uv_88N3i6PohNdw6P4A'
         },
          method: 'POST',
          body: finalQuery,
          signal: abortController.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const html = await response.json();
      setResponseHtml(html.json);
      setQuery('');
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        toast({
          title: 'Request Timed Out',
          description:
            'The request took too long to complete. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'An Error Occurred',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !query.trim() || isLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col p-4 md:p-6">
        <header className="flex items-center space-x-2 self-start mb-4">
          <AiIcon />
          <h1 className="text-xl md:text-lg font-semibold text-foreground/80">Definitive AI</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
            <div className={cn("w-full max-w-3xl space-y-4", responseHtml ? "mt-8" : "mb-8")}>
                <div className="text-center text-xl sm:text-2xl font-bold text-[#2d3748] dark:text-gray-200">
                    How can I help you today?
                </div>

                <div className="w-full">
                    <form onSubmit={handleSubmit} className="relative">
                    <Textarea
                        ref={queryInputRef}
                        id="query"
                        placeholder="Ask anything..."
                        className="min-h-[56px] resize-none rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 pr-16 sm:pr-28 text-base shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                        <Button
                            type="submit"
                            disabled={isButtonDisabled}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold p-2 rounded-full h-10 w-10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            aria-label="Submit query"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                    </form>
                </div>

                {isLoading && (
                  <div className="text-center text-sm text-muted-foreground animate-pulse">
                    Generating definitive results. This may take several minutes...
                  </div>
                )}
                

                {responseHtml && !isLoading && (
                    <Card className="overflow-hidden bg-[hsl(0_0%_99%)] dark:bg-[hsl(240_6%_11%)] border-0 shadow-none rounded-2xl">
                    <CardContent className="p-4 sm:p-6">
                        <div
                        className="w-full font-code text-sm prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: responseHtml }}
                        />
                    </CardContent>
                    </Card>
                    )}
                
                {responseHtml && !isLoading && (
                  <div className="flex items-center justify-center space-x-2 mt-4">
                      <span className="text-muted-foreground">Ask follow up question ?</span>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-accent"
                          onClick={handleFollowUp}
                      >
                          <PlusCircle className="h-6 w-6" />
                      </Button>
                  </div>
                )}
            </div>
        </div>
      </main>
      <footer className="w-full text-center text-xs text-muted-foreground opacity-50 py-4 px-4">
          &copy; RYaxn
      </footer>
    </div>
  );
}
