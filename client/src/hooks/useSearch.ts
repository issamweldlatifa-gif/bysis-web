import { useState, useMemo } from 'react';

interface UseSearchOptions<T> {
  searchFields: (keyof T)[];
  debounceMs?: number;
}

interface UseSearchReturn<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtered: T[];
}

/**
 * Hook مخصص للبحث والتصفية
 * يوفر بحث سريع وفعال عبر عدة حقول
 */
export function useSearch<T extends Record<string, any>>(
  items: T[],
  options: UseSearchOptions<T>
): UseSearchReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const lowerSearch = searchTerm.toLowerCase();

    return items.filter(item =>
      options.searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [items, searchTerm, options.searchFields]);

  return { searchTerm, setSearchTerm, filtered };
}
