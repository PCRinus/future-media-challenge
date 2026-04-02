'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  getMessageControllerFindAllQueryKey,
  useMessageControllerCreate,
} from '@/api/messages/messages';
import { useTagControllerFindAll } from '@/api/tags/tags';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/get-error-message';

export function ComposeForm() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [tagId, setTagId] = useState('');

  const { data: tags } = useTagControllerFindAll();

  const createMutation = useMessageControllerCreate({
    mutation: {
      onSuccess: () => {
        setContent('');
        queryClient.invalidateQueries({ queryKey: getMessageControllerFindAllQueryKey() });
        toast.success('Message posted');
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, 'Failed to post message'));
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
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
    >
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        maxLength={240}
        rows={3}
        className="resize-none"
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

        <Button
          type="submit"
          disabled={!content.trim() || !tagId || createMutation.isPending}
          size="sm"
        >
          {createMutation.isPending ? 'Posting…' : 'Post'}
        </Button>
      </div>
    </form>
  );
}
