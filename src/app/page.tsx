
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
      viewBox="0 0 64 64"
      className="h-8 w-8 text-primary"
      fill="currentColor"
    >
      <path d="M32,12c-3.5,0-6.5,2.1-7.9,5.2c-1.3-1.1-3-1.9-4.9-1.9c-3.9,0-7.1,3.2-7.1,7.1c0,1.9,0.8,3.7,2,4.9 C11.3,31.5,9,35.1,9,39.3c0,4.8,3.9,8.7,8.7,8.7c3.5,0,6.5-2.1,7.9-5.2c1.3,1.1,3,1.9,4.9,1.9c3.9,0,7.1-3.2,7.1-7.1 c0-1.9-0.8-3.7-2-4.9c2.8-4.2,2.8-9.8,0-14C41.5,14.1,38.5,12,32,12z M22,24c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2S20.9,24,22,24z M17.7,44c-2.6,0-4.7-2.1-4.7-4.7s2.1-4.7,4.7-4.7s4.7,2.1,4.7,4.7S20.3,44,17.7,44z M32,41c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S33.1,41,32,41z M37,32c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S38.1,32,37,32z M45,26c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4 S47.2,26,45,26z M52,35c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S54.2,35,52,35z M56,45c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4 S58.2,45,56,45z M45,45c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4S47.2,45,45,45z" />
      <path d="M52,15.3c-1.1-0.7-2.4-1.1-3.8-1.1c-3.9,0-7.1,3.2-7.1,7.1c0,1.4,0.4,2.7,1.1,3.8c-2.8,4.2-2.8,9.8,0,14 c0.7,1.1,1.7,2,2.9,2.7c-0.4,1-0.6,2-0.6,3.1c0,3.9,3.2,7.1,7.1,7.1c3.9,0,7.1-3.2,7.1-7.1c0-3.9-3.2-7.1-7.1-7.1 c-0.6,0-1.2,0.1-1.8,0.2c-2.6-4-2.6-9.1,0-13.2C50.2,21,52,18.4,52,15.3z" />
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
          <h1 className="text-xl font-semibold text-foreground/80">Definitive AI</h1>
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
