
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AiIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-primary"
    >
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <path d="M12 2a10 10 0 0 0-10 10" />
      <path d="M12 22a10 10 0 0 0 10-10" />
      <path d="M12 22a10 10 0 0 1-10-10" />
      <path d="M2 12a10 10 0 0 1 10-10" />
      <path d="M22 12a10 10 0 0 0-10-10" />
      <path d="M2 12a10 10 0 0 0 10 10" />
      <path d="M22 12a10 10 0 0 1-10 10" />
    </svg>
  );


export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseHtml, setResponseHtml] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponseHtml('');

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 120000); // 2 minutes timeout

    try {
      const response = await fetch(
        '/api/query',
        {
 headers: {
 'Content-Type': 'text/plain',
 },
          method: 'POST',
          body: query,
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
    <>
      <main className="flex min-h-screen w-full flex-col p-4 font-body sm:p-8">
        <header className="flex items-center space-x-2 self-start">
          <AiIcon />
          <h1 className="text-sm font-semibold text-foreground/80">Definitive AI</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl space-y-4">
                <div className="text-center text-2xl sm:text-3xl font-bold text-[#2d3748] dark:text-gray-200">
                    How can I help you today?
                </div>

                <div className="w-full">
                    <form onSubmit={handleSubmit} className="relative">
                    <Textarea
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
                    <Card className="overflow-hidden border-primary/10 shadow-xl rounded-2xl">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="font-headline text-primary text-xl sm:text-2xl">
                        Response
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <div
                        className="w-full font-code text-sm prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: responseHtml }}
                        />
                    </CardContent>
                    </Card>
                    )}
            </div>
        </div>
      </main>
    </>
  );
}
