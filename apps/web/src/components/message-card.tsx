'use client';

import { useState } from 'react';

import type { MessageResponseDto } from '@/api/model';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
          {message.updatedAt !== message.createdAt && (
            <span className="text-gray-400" title={`Edited ${new Date(message.updatedAt).toLocaleString()}`}>
              (edited)
            </span>
          )}
        </div>

        {isAuthor && !editing && !confirmDelete && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="xs"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={240}
            rows={3}
            className="resize-none"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className={`text-xs ${remaining < 20 ? 'text-red-500' : 'text-gray-400'}`}>
              {remaining}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="xs"
                onClick={handleSave}
                disabled={!editContent.trim() || isSaving}
              >
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      )}

      {confirmDelete && (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-red-50 p-3 dark:bg-red-950/30">
          <p className="flex-1 text-xs text-red-700 dark:text-red-400">Delete this message?</p>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="xs"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      )}

      <div className="mt-3">
        <Badge variant="secondary">{message.tag.name}</Badge>
      </div>
    </article>
  );
}
