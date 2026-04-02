'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useUserControllerSearch } from '@/api/users/users';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface UserComboboxProps {
  value?: string;
  onChange: (userId: string | undefined) => void;
}

export function UserCombobox({ value, onChange }: UserComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: users } = useUserControllerSearch(
    { q: debouncedSearch || undefined, limit: 10 },
    { query: { enabled: open } },
  );

  const selectedUser = users?.find((u) => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between font-normal"
        >
          <span className="truncate">
            {value ? (selectedUser?.username ?? 'Loading...') : 'All users'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search users..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(undefined);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', !value ? 'opacity-100' : 'opacity-0')} />
                All users
              </CommandItem>
              {users?.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => {
                    onChange(user.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === user.id ? 'opacity-100' : 'opacity-0')}
                  />
                  {user.username}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
