import { useMemo, useState } from 'react';
import type { BearSighting } from '../types';

export interface FilterState {
  months: string[];
  wards: string[];
}

export function useBearFilter(sightings: BearSighting[]) {
  const [filters, setFilters] = useState<FilterState>({
    months: [],
    wards: [],
  });

  // フィルタ適用後のデータ
  const filtered = useMemo(() => {
    return sightings.filter((s) => {
      const month = s.properties.date.substring(0, 7);
      const ward = s.properties.ward;

      if (filters.months.length > 0 && !filters.months.includes(month)) {
        return false;
      }
      if (filters.wards.length > 0 && !filters.wards.includes(ward)) {
        return false;
      }
      return true;
    });
  }, [sightings, filters]);

  const toggleMonth = (month: string) => {
    setFilters((prev) => ({
      ...prev,
      months: prev.months.includes(month)
        ? prev.months.filter((m) => m !== month)
        : [...prev.months, month],
    }));
  };

  const toggleWard = (ward: string) => {
    setFilters((prev) => ({
      ...prev,
      wards: prev.wards.includes(ward)
        ? prev.wards.filter((w) => w !== ward)
        : [...prev.wards, ward],
    }));
  };

  const clearFilters = () => {
    setFilters({ months: [], wards: [] });
  };

  const hasActiveFilters = filters.months.length > 0 || filters.wards.length > 0;

  return {
    filters,
    filtered,
    toggleMonth,
    toggleWard,
    clearFilters,
    hasActiveFilters,
  };
}
