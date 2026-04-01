'use client';

import { useState } from 'react';

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
  onSaveEdit?: (id: string, content: string) => void;
  isSaving?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function MessageCard({ message, onSaveEdit, isSaving, onDelete, isDeleting }: MessageCardProps) {
  const { user } = useAuth();
  const isAuthor = user?.id === message.author.id;
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) {
      setEditing(false);
      setEditContent(message.content);
      return;
    }
    onSaveEdit?.(message.id, trimmed);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditContent(message.content);
  };

  const handleDelete = () => {
    onDelete?.(message.id);
  };

  const remaining = 240 - editContent.length;

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

        {isAuthor && !editing && !confirmDelete && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={240}
            rows={3}
            className="w-full resize-none rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:focus:border-gray-500"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className={`text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400'}`}>
              {remaining}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!editContent.trim() || isSaving}
                className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      )}

      {confirmDelete && (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-red-50 p-3 dark:bg-red-950/30">
          <p className="flex-1 text-xs text-red-700 dark:text-red-400">Delete this message?</p>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="rounded-md px-3 py-1 text-xs text-gray-500 hover:bg-white dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}

      <div className="mt-3">
        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {message.tag.name}
        </span>
      </div>
    </article>
  );
}
