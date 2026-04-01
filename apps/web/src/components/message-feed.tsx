'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getMessageControllerFindAllQueryKey,
  messageControllerFindAll,
  useMessageControllerDelete,
  useMessageControllerUpdate,
} from '@/api/messages/messages';

import { ComposeForm } from './compose-form';
import type { Filters } from './filter-bar';
import { FilterBar } from './filter-bar';
import { MessageCard } from './message-card';

const PAGE_SIZE = 20;

export function MessageFeed() {
  const queryClient = useQueryClient();
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
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: getMessageControllerFindAllQueryKey() }),
    [queryClient],
  );

  const updateMutation = useMessageControllerUpdate({
    mutation: { onSuccess: invalidate },
  });

  const deleteMutation = useMessageControllerDelete({
    mutation: { onSuccess: invalidate },
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
      <ComposeForm />

      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading && <p className="py-8 text-center text-sm text-gray-500">Loading messages…</p>}

      {isError && <p className="py-8 text-center text-sm text-red-500">Failed to load messages.</p>}

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
              onSaveEdit={(id, content) => updateMutation.mutate({ id, data: { content } })}
              isSaving={updateMutation.isPending}
              onDelete={(id) => deleteMutation.mutate({ id })}
              isDeleting={deleteMutation.isPending}
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
