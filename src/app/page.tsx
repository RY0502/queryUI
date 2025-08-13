
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, PlusCircle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Client, Account, OAuthProvider } from 'appwrite';

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

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('688334d2001da7a18383');

const account = new Account(client);

const getInitials = (name = '') => {
  if (!name) return 'F4A';
  const [firstName, lastName] = name.split(' ');
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }
  if (firstName) {
    return firstName.substring(0, 2);
  }
  return 'F4A';
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseHtml, setResponseHtml] = useState('');
  const [user, setUser] = useState<{ name: string } | null>(null);
  const { toast } = useToast();
  const queryInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    checkSession();
  }, []);

  const handleLogin = () => {
    account.createOAuth2Token(
      OAuthProvider.Google,
      `${window.location.origin}/auth/callback`,
      `${window.location.origin}/`
    );
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      // Also clear any appwrite-related keys from localStorage
      for (const key in localStorage) {
        if (key.startsWith('cookieFallback')) {
          localStorage.removeItem(key);
        }
      }
      setUser(null);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

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

    if (!user) {
        handleLogin();
        return;
    }

    setIsLoading(true);
    
    let finalQuery = query;
    if (responseHtml) {
        const cleanedResponseHtml = responseHtml.replace(/<think>[\s\S]*?<\/think>/g, '');
        finalQuery = `${query}.Previous context in html format-${cleanedResponseHtml}.You may need to extract the text from html format before using it for context.`
    }
    
    setResponseHtml('');
    setQuery('');

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 120000); // 2 minutes timeout

    try {
      const response = await fetch(
        'https://6894bf8b00245593cabc.fra.appwrite.run/',
        {
         headers: {
         'Content-Type': 'text/plain',
         },
          method: 'POST',
          body: finalQuery,
          signal: abortController.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Increased system load. Please try after sometime',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
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
      <main className="flex-1 flex flex-col p-4">
        <header className="flex items-center justify-between w-full mb-4 md:mb-0">
          <div className="flex items-center space-x-2">
            <AiIcon />
            <h1 className="text-xl md:text-lg font-semibold text-foreground/80">Definitive AI</h1>
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-center bg-accent text-accent-foreground rounded-full h-8 w-8 md:h-10 md:w-10 text-sm font-bold cursor-pointer">
                  {getInitials(user.name)}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <div className={cn("flex-1 flex flex-col items-center", responseHtml ? "justify-start" : "justify-center")}>
            <div className={cn("w-full max-w-3xl space-y-4", responseHtml ? "mt-4 md:mt-12" : "mb-16 sm:mb-0 md:mb-16")}>
                <div className="text-center text-xl sm:text-2xl font-bold text-[#2d3748] dark:text-gray-200">
                    How can I help you today?
                </div>

                <div className="w-full">
                    <form onSubmit={handleSubmit} className="relative">
                    <Textarea
                        ref={queryInputRef}
                        id="query"
                        placeholder="Ask anything..."
                        className="min-h-[56px] resize-none rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 pr-16 sm:pr-28 text-base shadow-lg focus-visible:ring-2 focus-visible:ring-primary/50 font-body"
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
                        className="w-full font-body text-sm prose dark:prose-invert max-w-none"
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
      <footer className="w-full text-center text-xs text-muted-foreground opacity-50 py-2 px-4">
          &copy; RYaxn
      </footer>
    </div>
  );
}
