'use client';

import { ProtectedRoute } from '@/components/protected-route';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">Messages feed coming soon…</p>
      </div>
    </ProtectedRoute>
  );
}
