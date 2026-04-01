'use client';

import type { MessageResponseDto } from '@/api/model';
import { useAuth } from '@/contexts/auth-context';

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

interface MessageCardProps {
  message: MessageResponseDto;
  onEdit?: (message: MessageResponseDto) => void;
  onDelete?: (message: MessageResponseDto) => void;
}

export function MessageCard({ message, onEdit, onDelete }: MessageCardProps) {
  const { user } = useAuth();
  const isAuthor = user?.id === message.author.id;

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            {message.author.username.charAt(0).toUpperCase()}
          </span>
          <span className="font-medium">{message.author.username}</span>
          <span className="text-gray-400">·</span>
          <time className="text-gray-500" dateTime={message.createdAt} title={new Date(message.createdAt).toLocaleString()}>
            {formatRelativeTime(message.createdAt)}
          </time>
        </div>

        {isAuthor && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(message)}
              className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(message)}
              className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

      <div className="mt-3">
        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {message.tag.name}
        </span>
      </div>
    </article>
  );
}
