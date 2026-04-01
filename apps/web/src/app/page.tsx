'use client';

import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/protected-route';

export default function Home() {
  return (
    <ProtectedRoute>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p className="text-gray-500">Messages feed coming soon…</p>
      </main>
    </ProtectedRoute>
  );
}
