'use client';

import { Header } from '@/components/header';
import { MessageFeed } from '@/components/message-feed';
import { ProtectedRoute } from '@/components/protected-route';

export default function Home() {
  return (
    <ProtectedRoute>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <MessageFeed />
      </main>
    </ProtectedRoute>
  );
}
