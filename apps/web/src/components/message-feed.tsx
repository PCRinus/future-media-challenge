'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getMessageControllerFindAllQueryKey,
  messageControllerFindAll,
} from '@/api/messages/messages';
import type { MessageResponseDto } from '@/api/model';

import type { Filters } from './filter-bar';
import { FilterBar } from './filter-bar';
import { MessageCard } from './message-card';

const PAGE_SIZE = 20;

interface MessageFeedProps {
  onEdit?: (message: MessageResponseDto) => void;
  onDelete?: (message: MessageResponseDto) => void;
}

export function MessageFeed({ onEdit, onDelete }: MessageFeedProps) {
  const [filters, setFilters] = useState<Filters>({});
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [...getMessageControllerFindAllQueryKey(filters), 'infinite'],
      queryFn: ({ pageParam }) =>
        messageControllerFindAll({
          ...filters,
          cursor: pageParam as string | undefined,
          limit: PAGE_SIZE,
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => (lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined),
    });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const messages = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-500">Loading messages…</p>
      )}

      {isError && (
        <p className="py-8 text-center text-sm text-red-500">Failed to load messages.</p>
      )}

      {!isLoading && !isError && messages.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No messages yet. Be the first to post!
        </p>
      )}

      {messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      {isFetchingNextPage && (
        <p className="py-4 text-center text-sm text-gray-500">Loading more…</p>
      )}
    </div>
  );
}
