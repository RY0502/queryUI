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
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    <path d="M15 6.5A3.5 3.5 0 0 0 8.5 3A3.5 3.5 0 0 0 5 6.5a3.5 3.5 0 0 0 3.5 3.5h7A3.5 3.5 0 0 0 19 6.5a3.5 3.5 0 0 0-3.5-3.5m-3.5 7A3.5 3.5 0 0 0 5 17.5a3.5 3.5 0 0 0 3.5 3.5A3.5 3.5 0 0 0 12 17.5V10m7 3.5A3.5 3.5 0 0 0 15.5 10a3.5 3.5 0 0 0-3.5 3.5A3.5 3.5 0 0 0 15.5 17h0" />
  </svg>
);


export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseHtml, setResponseHtml] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResponseHtml('');

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 120000); // 2 minutes timeout

    try {
      const response = await fetch(
        'https://6894bf8b00245593cabc.fra.appwrite.run/',
        {
          method: 'POST',
          body: query,
          signal: abortController.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const html = await response.text();
      setResponseHtml(html);
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
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm text-center p-4">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-semibold text-foreground">
            Generating definitive results.
          </p>
          <p className="text-muted-foreground">It might take several minutes....</p>
        </div>
      )}
      <main className="flex min-h-screen w-full flex-col p-4 font-body sm:p-8">
        <header className="flex items-center space-x-2 self-start">
          <AiIcon />
          <h1 className="text-2xl font-bold text-foreground">Definitive AI</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl space-y-8">
                <div className="text-center text-3xl sm:text-4xl font-bold text-[#2d3748] dark:text-gray-200">
                    How can I help you today ?
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
