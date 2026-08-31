'use client';

import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppSelect } from '@/components/common/AppSelect';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  className?: string;
  children?: ReactNode;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  className,
  children,
}: FilterBarProps): ReactNode {
  return (
    <div
      className={cn(
        'mb-4 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center',
        className
      )}
    >
      {onSearchChange && (
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 pl-9"
            aria-label={searchPlaceholder}
          />
        </div>
      )}
      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[160px] sm:w-[180px]">
          <AppSelect
            value={filter.value}
            onValueChange={filter.onChange}
            options={filter.options}
            placeholder={filter.label}
            aria-label={filter.label}
          />
        </div>
      ))}
      {children}
    </div>
  );
}
