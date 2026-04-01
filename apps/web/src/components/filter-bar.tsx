'use client';

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

  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial });
  };

  const hasActiveFilters = filters.tagId || filters.userId || filters.dateFrom || filters.dateTo;

  return (
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

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          Clear
        </button>
      )}
    </div>
  );
}
