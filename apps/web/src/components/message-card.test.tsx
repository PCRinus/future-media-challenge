import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MessageResponseDto } from '@/api/model';

import { MessageCard } from './message-card';

vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({ user: undefined })),
}));

import { useAuth } from '@/contexts/auth-context';
const mockUseAuth = vi.mocked(useAuth);

function makeMessage(overrides?: Partial<MessageResponseDto>): MessageResponseDto {
  return {
    id: 'msg-1',
    content: 'Hello world',
    author: { id: 'user-1', username: 'alice' },
    tag: { id: 'tag-1', name: 'General' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

afterEach(cleanup);

describe('MessageCard', () => {
  it('renders message content, author, and tag', () => {
    const msg = makeMessage();
    render(<MessageCard message={msg} />);

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('shows author avatar initial', () => {
    render(<MessageCard message={makeMessage()} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows "(edited)" when updatedAt differs from createdAt', () => {
    const msg = makeMessage({
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });
    render(<MessageCard message={msg} />);
    expect(screen.getByText('(edited)')).toBeInTheDocument();
  });

  it('does not show "(edited)" when timestamps match', () => {
    const ts = '2026-01-01T00:00:00.000Z';
    const msg = makeMessage({ createdAt: ts, updatedAt: ts });
    render(<MessageCard message={msg} />);
    expect(screen.queryByText('(edited)')).not.toBeInTheDocument();
  });

  describe('when user is not the author', () => {
    it('does not show Edit or Delete buttons', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'other-user',
          username: 'bob',
          email: 'bob@test.com',
          createdAt: '',
          updatedAt: '',
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(<MessageCard message={makeMessage()} />);
      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });
  });

  describe('when user is the author', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-1',
          username: 'alice',
          email: 'alice@test.com',
          createdAt: '',
          updatedAt: '',
        },
        isLoading: false,
        isAuthenticated: true,
        login: vi.fn(),
        logout: vi.fn(),
      });
    });

    it('shows Edit and Delete buttons', () => {
      render(<MessageCard message={makeMessage()} />);
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('enters edit mode when Edit is clicked', async () => {
      render(<MessageCard message={makeMessage()} />);
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      expect(screen.getByRole('textbox')).toHaveValue('Hello world');
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('cancels editing and restores original content', async () => {
      render(<MessageCard message={makeMessage()} />);
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const textarea = screen.getByRole('textbox');
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Changed text');

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('calls onSaveEdit with trimmed content', async () => {
      const onSaveEdit = vi.fn();
      render(<MessageCard message={makeMessage()} onSaveEdit={onSaveEdit} />);

      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const textarea = screen.getByRole('textbox');
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '  Updated message  ');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSaveEdit).toHaveBeenCalledWith('msg-1', 'Updated message');
    });

    it('does not save if content is unchanged', async () => {
      const onSaveEdit = vi.fn();
      render(<MessageCard message={makeMessage()} onSaveEdit={onSaveEdit} />);

      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSaveEdit).not.toHaveBeenCalled();
    });

    it('does not save if content is only whitespace', async () => {
      const onSaveEdit = vi.fn();
      render(<MessageCard message={makeMessage()} onSaveEdit={onSaveEdit} />);

      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
      const textarea = screen.getByRole('textbox');
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '   ');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSaveEdit).not.toHaveBeenCalled();
    });

    it('disables Save button when textarea is empty', async () => {
      render(<MessageCard message={makeMessage()} />);
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      const textarea = screen.getByRole('textbox');
      await userEvent.clear(textarea);

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('shows remaining character count in edit mode', async () => {
      const msg = makeMessage({ content: 'Hi' });
      render(<MessageCard message={msg} />);
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      expect(screen.getByText('238')).toBeInTheDocument();
    });

    it('shows delete confirmation when Delete is clicked', async () => {
      render(<MessageCard message={makeMessage()} />);
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      expect(screen.getByText('Delete this message?')).toBeInTheDocument();
    });

    it('cancels delete confirmation', async () => {
      render(<MessageCard message={makeMessage()} />);
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByText('Delete this message?')).not.toBeInTheDocument();
    });

    it('calls onDelete when confirmed', async () => {
      const onDelete = vi.fn();
      render(<MessageCard message={makeMessage()} onDelete={onDelete} />);

      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
      // There are now two "Delete" buttons — the confirmation one is the last
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      await userEvent.click(deleteButtons[deleteButtons.length - 1]);

      expect(onDelete).toHaveBeenCalledWith('msg-1');
    });

    it('shows "Saving…" while isSaving is true', async () => {
      render(<MessageCard message={makeMessage()} isSaving />);
      await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

      expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    });

    it('shows "Deleting…" while isDeleting is true', async () => {
      render(<MessageCard message={makeMessage()} isDeleting />);
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      expect(screen.getByRole('button', { name: 'Deleting…' })).toBeDisabled();
    });
  });
});
