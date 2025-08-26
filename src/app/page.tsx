
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, PlusCircle, LogOut, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Client, Account, OAuthProvider } from 'appwrite';

type ApiResponse = {
  source: string;
  html: string;
  originalEndpoint: string;
  error?: boolean;
};

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
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const { toast } = useToast();
  const queryInputRef = useRef<HTMLTextAreaElement>(null);
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [completedRequests, setCompletedRequests] = useState(0);

  const endpoints = [
    { name: 'Appwrite1', url: 'https://6894bf8b00245593cabc.fra.appwrite.run/', headers: { 'Content-Type': 'text/plain' }, bodyIsJson: false },
    { name: 'Appwrite2', url: 'https://689cc68f00299eeb37ee.fra.appwrite.run/', headers: { 'Content-Type': 'text/plain' }, bodyIsJson: false },
    { name: 'Appwrite3', url: 'https://689f1d6200262a0c8456.fra.appwrite.run/', headers: { 'Content-Type': 'text/plain' }, bodyIsJson: false },
    ];

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
    setIsFollowUp(true);
    if (queryInputRef.current) {
      queryInputRef.current.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    toast({
      title: 'Current contexts are attached',
      description: 'Ask your follow-up question now.',
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
    setResponses([]);
    setCompletedRequests(0);

    const promptWithSuffix = `${query}. It is mandatory to generate the response in simple and basic html format which can be rendered easily`;

    const getSuccessHtml = () => responses.find(r => !r.error)?.html || '';

    endpoints.forEach(async (endpoint) => {
        let finalQuery = promptWithSuffix;
        if (isFollowUp) {
            const previousResponse = responses.find(r => r.originalEndpoint === endpoint.url);
            let contextHtml = '';
            if (previousResponse && !previousResponse.error && previousResponse.html !== 'Unable to generate answer from this source. Results will be available from other sources shortly') {
                contextHtml = previousResponse.html;
            } else {
                contextHtml = getSuccessHtml();
            }

            if(contextHtml){
                 const cleanedResponseHtml = contextHtml.replace(/<think>[\s\S]*?<\/think>/g, '');
                 finalQuery = `Query-${query}.Supporting context in html format-${cleanedResponseHtml}.You may need to extract the text from html format before using it for context.In response give the answer of the query. Supporting context is for background information only.It is mandatory to generate the response in simple and basic html format which can be rendered easily. `
            }
        }

        try {
            const response = await fetch(endpoint.url, {
                method: 'POST',
                headers: endpoint.headers,
                body: endpoint.bodyIsJson ? JSON.stringify({ prompt: finalQuery }) : finalQuery,
            });

            if (!response.ok) {
              throw new Error('System Error. Please try after sometime');
            }

            const result = await response.json();
            const html = result.json || result.html || 'Unable to generate answer from this source. Results will be available from other sources shortly';

            setResponses(prev => [
                ...prev,
                { source: `Source ${prev.length + 1}`, html, originalEndpoint: endpoint.url }
            ]);

        } catch (error: any) {
            setResponses(prev => [
                ...prev,
                { source: `Source ${prev.length + 1}`, html: 'Unable to generate answer from this source. Results will be available from other sources shortly', originalEndpoint: endpoint.url, error: true }
            ]);
             toast({
              title: `Error from ${endpoint.name}`,
              description: error.message || 'Failed to fetch response.',
              variant: 'destructive',
            });
        } finally {
            setCompletedRequests(prev => prev + 1);
        }
    });

    setQuery('');
    setIsFollowUp(false);
  };

  useEffect(() => {
    if (completedRequests === endpoints.length && completedRequests > 0) {
      setIsLoading(false);
    }
  }, [completedRequests, endpoints.length]);


  const isButtonDisabled = !query.trim() || isLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col p-4">
        <header className="flex items-center justify-between w-full mb-2 md:mb-0">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-8 w-8 text-accent" />
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

        <div className={cn("flex-1 flex flex-col items-center justify-center", responses.length > 0 && "justify-start")}>
            <div className={cn("w-full max-w-3xl space-y-4", responses.length > 0 ? "mt-8 md:mt-12" : "mt-2 md:mt-2")}>
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
                    <p className="text-xs italic font-light text-muted-foreground text-right mt-1 mr-2">*Use chat agent for realtime search</p>
                </div>

                {isLoading && (
                  <div className="text-center text-sm font-medium text-foreground/90 animate-pulse-fast">
                    Generating comprehensive answer from several sources. This may take a few seconds...
                  </div>
                )}

                {responses.length > 0 && (
                    <Tabs defaultValue={responses[0].source} className="w-full mt-12">
                        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-lg">
                            {responses.map(res => (
                                <TabsTrigger 
                                    key={res.source} 
                                    value={res.source}
                                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100"
                                >
                                    {res.source}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {responses.map(res => (
                            <TabsContent key={res.source} value={res.source}>
                                <Card className="overflow-hidden bg-[hsl(0_0%_99%)] dark:bg-[hsl(240_6%_11%)] border-0 shadow-none rounded-2xl mt-2">
                                    <CardContent className="p-4 sm:p-6">
                                        <div
                                        className="w-full font-body text-sm prose dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: res.html }}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}

                {responses.length > 0 && !isLoading && (
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
    

    

    
