'use client';

import { useEffect, useState } from "react";
import { Account } from "appwrite";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type User = {
  name?: string;
  email?: string;
  prefs?: Record<string, unknown>;
};

export default function UserStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    if (!endpoint || !project) {
      setLoading(false);
      setUser(null);
      return;
    }
    import("@/lib/appwrite").then(({ getAppwriteAccount }) => {
      const account: Account = getAppwriteAccount();
      account
        .get()
        .then((u) => {
          const name = (u as { name?: string }).name;
          const email = (u as { email?: string }).email;
          const prefs = (u as { prefs?: Record<string, unknown> }).prefs;
          setUser({ name, email, prefs });
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    });
  }, []);

  const login = () => {
    import("@/lib/appwrite").then(({ getAppwriteAccount }) => {
      const account: Account = getAppwriteAccount();
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const success = `${base}/auth/callback`;
      const failure = `${base}/auth/callback`;
      account.createOAuth2Session("google", success, failure);
    });
  };

  const logout = async () => {
    import("@/lib/appwrite").then(async ({ getAppwriteAccount }) => {
      const account: Account = getAppwriteAccount();
      try {
        await account.deleteSession("current");
        setUser(null);
      } catch {}
    });
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">…</div>;
  }

  if (!user) {
    return (
      <Button variant="secondary" onClick={login}>
        Sign In
      </Button>
    );
  }

  const initials = (user.name || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage alt={user.name || user.email || "User"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="hidden md:block">
        <div className="text-sm font-medium">{user.name || user.email}</div>
        <div className="text-xs text-muted-foreground">Signed in</div>
      </div>
      <Button variant="ghost" onClick={logout}>
        Sign Out
      </Button>
    </div>
  );
}
