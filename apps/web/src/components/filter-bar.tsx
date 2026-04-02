'use client';

import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { useTagControllerFindAll } from '@/api/tags/tags';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { UserCombobox } from './user-combobox';

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

  const activeCount = [filters.tagId, filters.userId, filters.dateFrom, filters.dateTo].filter(
    Boolean,
  ).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>
          Filters
          {activeCount > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white dark:bg-gray-100 dark:text-gray-900">
              {activeCount}
            </span>
          )}
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
      </Button>

      {open && (
        <div className="border-t border-gray-200 px-4 pt-3 pb-3 dark:border-gray-800">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="filter-tag" className="text-xs text-gray-500">
                Tag
              </Label>
              <Select
                value={filters.tagId ?? '__all__'}
                onValueChange={(v) => update({ tagId: v === '__all__' ? undefined : v })}
              >
                <SelectTrigger id="filter-tag">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All tags</SelectItem>
                  {tags?.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-gray-500">User</Label>
              <UserCombobox value={filters.userId} onChange={(userId) => update({ userId })} />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-gray-500">From</Label>
              <DatePicker
                value={filters.dateFrom}
                onChange={(v) => update({ dateFrom: v })}
                placeholder="Pick a date"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-gray-500">To</Label>
              <DatePicker
                value={filters.dateTo}
                onChange={(v) => update({ dateTo: v })}
                placeholder="Pick a date"
              />
            </div>

            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => onChange({})}>
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-[200px] justify-start font-normal', !date && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? format(d, 'yyyy-MM-dd') : undefined);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
