'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { getMessageControllerFindAllQueryKey, useMessageControllerCreate } from '@/api/messages/messages';
import { useTagControllerFindAll } from '@/api/tags/tags';

export function ComposeForm() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [tagId, setTagId] = useState('');
  const [error, setError] = useState('');

  const { data: tags } = useTagControllerFindAll();

  const createMutation = useMessageControllerCreate({
    mutation: {
      onSuccess: () => {
        setContent('');
        setError('');
        queryClient.invalidateQueries({ queryKey: getMessageControllerFindAllQueryKey() });
      },
      onError: (err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to post message');
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !tagId) return;
    createMutation.mutate({ data: { content: content.trim(), tagId } });
  };

  const remaining = 240 - content.length;

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      {error && <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        maxLength={240}
        rows={3}
        className="w-full resize-none rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:focus:border-gray-500"
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Select a tag</option>
            {tags?.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <span className={`text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400'}`}>
            {remaining}
          </span>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || !tagId || createMutation.isPending}
          className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {createMutation.isPending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
