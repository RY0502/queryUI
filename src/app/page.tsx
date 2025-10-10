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
import { ArrowRight, PlusCircle, LogOut, Sparkles, Zap } from 'lucide-react';
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
    { name: 'Perplexity', url: 'https://6894bf8b00245593cabc.fra.appwrite.run/', headers: { 'Content-Type': 'text/plain' }, bodyIsJson: false },
    { name: 'Llama/GPT', url: 'https://689cc68f00299eeb37ee.fra.appwrite.run/', headers: { 'Content-Type': 'text/plain' }, bodyIsJson: false },
    { name: 'Gemini', url: 'https://689f1d6200262a0c8456.fra.appwrite.run/', headers: { 'Content-Type': 'text/plain' }, bodyIsJson: false },
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
            const previousResponse = responses.find(r => r.source === endpoint.name);
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
                { source: endpoint.name, html, originalEndpoint: endpoint.url }
            ].sort((a, b) => endpoints.findIndex(e => e.name === a.source) - endpoints.findIndex(e => e.name === b.source)));

        } catch (error: any) {
            setResponses(prev => [
                ...prev,
                { source: endpoint.name, html: 'Unable to generate answer from this source. Results will be available from other sources shortly', originalEndpoint: endpoint.url, error: true }
            ].sort((a, b) => endpoints.findIndex(e => e.name === a.source) - endpoints.findIndex(e => e.name === b.source)));
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
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Aurora Background */}
      <div className="aurora-bg" />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50/50 via-cyan-50/30 to-violet-50/50 dark:from-indigo-950/20 dark:via-cyan-950/10 dark:to-violet-950/20 pointer-events-none" />

      <main className="relative z-10 flex-1 flex flex-col p-4 md:p-6 pb-2">
        {/* Header */}
        <header className="flex items-center justify-between w-full mb-8 md:mb-12 fade-in">
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <Sparkles className="relative h-8 w-8 md:h-10 md:w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline gradient-text">
              Definitive AI
            </h1>
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="glass flex items-center justify-center rounded-full h-10 w-10 md:h-12 md:w-12 text-sm md:text-base font-bold cursor-pointer hover-glow smooth-transition shadow-lg">
                  <span className="gradient-text">{getInitials(user.name)}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-white/20">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col items-center",
          responses.length > 0 ? "justify-start" : "justify-center md:justify-center"
        )}>
          <div className={cn(
            "w-full max-w-4xl space-y-4 md:space-y-8",
            responses.length > 0 ? "mt-4 md:mt-8" : ""
          )}>
            {/* Hero Title */}
            {responses.length === 0 && (
              <div className="text-center space-y-3 md:space-y-4 fade-in">
                <h2 className="text-3xl md:text-6xl font-bold font-headline gradient-text leading-tight">
                  How can I help you today?
                </h2>
                <p className="text-base md:text-xl text-muted-foreground font-body">
                  Ask anything and get comprehensive answers from multiple sources
                </p>
              </div>
            )}

            {/* Query Input */}
            <div className="w-full scale-in">
              <form onSubmit={handleSubmit} className="relative">
                <div className="glass-strong rounded-3xl p-1 shadow-2xl hover-glow smooth-transition">
                  <Textarea
                    ref={queryInputRef}
                    id="query"
                    placeholder="Ask anything..."
                    className="min-h-[70px] md:min-h-[100px] resize-none rounded-3xl border-0 bg-transparent p-4 pr-16 md:p-6 md:pr-24 text-base md:text-lg font-body focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5">
                  <Button
                    type="submit"
                    disabled={isButtonDisabled}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold p-0 rounded-full h-11 w-11 md:h-14 md:w-14 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 glow-primary"
                    aria-label="Submit query"
                  >
                    <ArrowRight className="h-5 w-5 md:h-7 md:w-7" />
                  </Button>
                </div>
              </form>
              <p className="text-xs md:text-sm text-muted-foreground/70 text-right mt-2 mr-2 font-body italic">
                *Use chat agent for realtime search
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-4 py-12 fade-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <Zap className="relative h-12 w-12 md:h-16 md:w-16 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <p className="text-base md:text-lg font-medium text-foreground/90 animate-pulse font-body">
                  Generating comprehensive answer from multiple sources...
                </p>
                <p className="text-sm text-muted-foreground font-body">
                  This may take a few seconds
                </p>
              </div>
            )}

            {/* Responses */}
            {responses.length > 0 && (
              <div className="fade-in">
                <Tabs defaultValue={responses[0].source} className="w-full">
                  <TabsList className="glass w-full flex justify-center gap-8 p-2 rounded-2xl shadow-lg mb-6 bg-transparent border-0">
                    {responses.map((res) => (
                      <TabsTrigger 
                        key={res.source} 
                        value={res.source}
                        className="relative bg-transparent border-0 font-semibold text-foreground/60 data-[state=active]:text-foreground smooth-transition px-4 py-2 data-[state=active]:shadow-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-cyan-500 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
                      >
                        <span className="hidden sm:inline">{res.source}</span>
                        <span className="sm:hidden">{res.source}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {responses.map(res => (
                    <TabsContent key={res.source} value={res.source} className="mt-0">
                      <Card className="glass-strong overflow-hidden border-0 shadow-2xl rounded-3xl smooth-transition hover:shadow-3xl">
                        <CardContent className="p-6 md:p-8">
                          <div
                            className="w-full font-body text-sm md:text-base prose prose-indigo dark:prose-invert max-w-none prose-headings:font-headline prose-headings:gradient-text prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
                            dangerouslySetInnerHTML={{ __html: res.html }}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}

            {/* Follow-up Button */}
            {responses.length > 0 && !isLoading && (
              <div className="flex items-center justify-center space-x-3 mt-8 fade-in">
                <span className="text-sm md:text-base text-muted-foreground font-body">
                  Ask follow up question?
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass rounded-full h-10 w-10 md:h-12 md:w-12 hover-glow smooth-transition shadow-lg"
                  onClick={handleFollowUp}
                >
                  <PlusCircle className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 dark:text-indigo-400" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-3 md:py-4 px-4 mt-auto">
        <div className="glass rounded-2xl px-4 py-2 md:py-3 inline-block shadow-lg">
          <p className="text-xs md:text-sm font-medium font-body">
            <span className="text-muted-foreground/70">Crafted with</span>
            <span className="mx-1.5 text-indigo-500 dark:text-indigo-400 animate-pulse">✨</span>
            <span className="text-muted-foreground/70">by</span>
            <span className="ml-1.5 gradient-text font-semibold">RYaxn</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
