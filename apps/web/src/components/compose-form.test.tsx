import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

const mockMutate = vi.fn();
vi.mock('@/api/messages/messages', () => ({
  getMessageControllerFindAllQueryKey: () => ['messages'],
  useMessageControllerCreate: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock('@/api/tags/tags', () => ({
  useTagControllerFindAll: () => ({
    data: [
      { id: 'tag-1', name: 'General', createdAt: '' },
      { id: 'tag-2', name: 'Tech', createdAt: '' },
    ],
  }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ComposeForm } from './compose-form';

afterEach(() => {
  cleanup();
  mockMutate.mockClear();
});

describe('ComposeForm', () => {
  it('renders textarea and tag select', () => {
    render(<ComposeForm />);

    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByText('Select a tag')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
  });

  it('shows character count starting at 240', () => {
    render(<ComposeForm />);
    expect(screen.getByText('240')).toBeInTheDocument();
  });

  it('updates character count as user types', async () => {
    render(<ComposeForm />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");

    await userEvent.type(textarea, 'Hello');
    expect(screen.getByText('235')).toBeInTheDocument();
  });

  it('disables Post button when textarea is empty', () => {
    render(<ComposeForm />);
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });

  it('disables Post button when no tag is selected', async () => {
    render(<ComposeForm />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await userEvent.type(textarea, 'Some message');

    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
  });

  it('enables Post button when content and tag are provided', async () => {
    render(<ComposeForm />);
    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await userEvent.type(textarea, 'Some message');

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'tag-1');

    expect(screen.getByRole('button', { name: 'Post' })).toBeEnabled();
  });

  it('calls mutate with trimmed content and tagId on submit', async () => {
    render(<ComposeForm />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await userEvent.type(textarea, '  Hello world  ');

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'tag-2');

    await userEvent.click(screen.getByRole('button', { name: 'Post' }));

    expect(mockMutate).toHaveBeenCalledWith({
      data: { content: 'Hello world', tagId: 'tag-2' },
    });
  });

  it('does not call mutate when content is only whitespace', async () => {
    render(<ComposeForm />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await userEvent.type(textarea, '   ');

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'tag-1');

    await userEvent.click(screen.getByRole('button', { name: 'Post' }));

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
