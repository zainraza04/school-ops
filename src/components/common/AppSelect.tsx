'use client';

import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface AppSelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  'aria-label'?: string;
  id?: string;
}

export function AppSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className,
  triggerClassName,
  'aria-label': ariaLabel,
  id,
}: AppSelectProps): ReactNode {
  const selected = options.find((o) => o.value === value);

  return (
    <Select
      value={value || null}
      onValueChange={(next) => {
        if (next != null) onValueChange(next);
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          'h-10 w-full min-w-[140px] rounded-md border-input bg-background px-3 text-sm shadow-none',
          triggerClassName
        )}
      >
        <SelectValue placeholder={placeholder}>
          {selected?.label ?? placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false} className={className}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
