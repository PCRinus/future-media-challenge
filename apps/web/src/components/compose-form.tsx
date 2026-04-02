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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { getErrorMessage } from '@/lib/get-error-message';

export function ComposeForm() {
  const { isAuthenticated } = useAuth();
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

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950">
        <a href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
          Sign in
        </a>{' '}
        or{' '}
        <a href="/register" className="text-blue-600 hover:underline dark:text-blue-400">
          create an account
        </a>{' '}
        to post a message.
      </div>
    );
  }

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
          <Select value={tagId} onValueChange={setTagId}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              {tags?.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
