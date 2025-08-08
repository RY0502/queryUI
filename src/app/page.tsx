'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 font-body sm:p-8">
        <div className="w-full max-w-3xl space-y-6">
          <Card className="overflow-hidden border-primary/10 shadow-xl rounded-2xl">
            <CardHeader className="text-center p-8">
              <CardTitle className="text-3xl font-bold font-headline text-primary">
                QueryCraft AI
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground pt-2">
                How can I help you today?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="query" className="sr-only">
                    Your Query
                  </Label>
                  <Textarea
                    id="query"
                    placeholder="Type your query here..."
                    className="min-h-[140px] resize-none rounded-lg p-4 text-base focus-visible:ring-primary/50"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isButtonDisabled}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    aria-label="Submit query"
                  >
                    <span>Send</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {responseHtml && !isLoading && (
            <Card className="overflow-hidden border-primary/10 shadow-xl rounded-2xl">
              <CardHeader className="p-6">
                <CardTitle className="font-headline text-primary">
                  Response
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div
                  className="w-full font-code text-sm"
                  dangerouslySetInnerHTML={{ __html: responseHtml }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
