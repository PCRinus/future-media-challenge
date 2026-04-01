'use client';

import { useState } from 'react';

import { useTagControllerFindAll } from '@/api/tags/tags';

export interface Filters {
  tagId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const { data: tags } = useTagControllerFindAll();
  const [open, setOpen] = useState(false);

  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial });
  };

  const activeCount = [filters.tagId, filters.userId, filters.dateFrom, filters.dateTo].filter(Boolean).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>
          Filters{activeCount > 0 && <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white dark:bg-gray-100 dark:text-gray-900">{activeCount}</span>}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-200 px-4 pb-3 pt-3 dark:border-gray-800">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-tag" className="text-xs font-medium text-gray-500">
                Tag
              </label>
              <select
                id="filter-tag"
                value={filters.tagId ?? ''}
                onChange={(e) => update({ tagId: e.target.value || undefined })}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">All tags</option>
                {tags?.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="filter-user" className="text-xs font-medium text-gray-500">
                User
              </label>
              <input
                id="filter-user"
                type="text"
                placeholder="User ID"
                value={filters.userId ?? ''}
                onChange={(e) => update({ userId: e.target.value || undefined })}
                className="w-36 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="filter-from" className="text-xs font-medium text-gray-500">
                From
              </label>
              <input
                id="filter-from"
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => update({ dateFrom: e.target.value || undefined })}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="filter-to" className="text-xs font-medium text-gray-500">
                To
              </label>
              <input
                id="filter-to"
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => update({ dateTo: e.target.value || undefined })}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => onChange({})}
                className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
