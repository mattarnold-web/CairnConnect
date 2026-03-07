'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  glass?: boolean;
}

export function SearchBar({
  placeholder = 'Search trails, businesses, activities...',
  value: controlledValue,
  onChange,
  className,
  glass = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue ?? internalValue;
  const setValue = onChange ?? setInternalValue;

  return (
    <div
      className={clsx(
        'relative flex items-center rounded-full border h-11',
        glass ? 'glass border-gray-200/50' : 'bg-gray-50 border-gray-200',
        className
      )}
    >
      <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full bg-transparent pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none rounded-full"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3.5 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
