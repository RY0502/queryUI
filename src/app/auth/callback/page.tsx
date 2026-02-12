'use client';

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAppwriteAccount } from "@/lib/appwrite";
import type { Account } from "appwrite";

export const dynamic = "force-dynamic";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");
    if (userId && secret) {
      const account: Account = getAppwriteAccount();
      account
        .createSession(userId, secret)
        .then(() => router.push("/"))
        .catch(() => router.push("/"));
    } else {
      router.push("/");
    }
  }, [router, searchParams]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p>Completing authentication…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p>Completing authentication…</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
