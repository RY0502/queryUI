
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Client, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('688334d2001da7a18383');

const account = new Account(client);

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (userId && secret) {
      const handleCallback = async () => {
        try {
          await account.createSession(userId, secret);
          router.push('/');
        } catch (e: any) {
          console.error('Authentication failed:', e);
          setError(e.message || 'An unknown error occurred during authentication.');
          // Optionally redirect to a failure page or show an error message
          setTimeout(() => router.push('/'), 5000); // Redirect home after 5s
        }
      };

      handleCallback();
    } else {
        // Handle cases where userId or secret are missing.
        setError("Invalid authentication callback parameters.");
        setTimeout(() => router.push('/'), 5000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error ? (
        <div className="text-red-500">
          <p>Authentication Failed: {error}</p>
          <p>Redirecting you to the homepage...</p>
        </div>
      ) : (
        <p>Please wait, authenticating...</p>
      )}
    </div>
  );
}


export default function AuthCallbackPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AuthCallback />
      </Suspense>
    );
}
