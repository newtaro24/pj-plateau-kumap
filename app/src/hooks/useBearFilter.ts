import { useMemo, useState } from 'react';
import type { BearSighting } from '../types';

export interface FilterState {
  months: string[];
  wards: string[];
  dangerLevels: string[];
}

export function useBearFilter(sightings: BearSighting[]) {
  const [filters, setFilters] = useState<FilterState>({
    months: [],
    wards: [],
    dangerLevels: [],
  });

  // 利用可能なフィルタオプションを取得
  const options = useMemo(() => {
    const monthSet = new Set<string>();
    const wardSet = new Set<string>();

    for (const s of sightings) {
      const month = s.properties.date.substring(0, 7);
      monthSet.add(month);
      wardSet.add(s.properties.ward);
    }

    return {
      months: Array.from(monthSet).sort(),
      wards: Array.from(wardSet).sort(),
      dangerLevels: ['high', 'medium', 'low'] as const,
    };
  }, [sightings]);

  // フィルタ適用後のデータ
  const filtered = useMemo(() => {
    return sightings.filter((s) => {
      const month = s.properties.date.substring(0, 7);
      const ward = s.properties.ward;
      const level = s.properties.dangerLevel;

      if (filters.months.length > 0 && !filters.months.includes(month)) {
        return false;
      }
      if (filters.wards.length > 0 && !filters.wards.includes(ward)) {
        return false;
      }
      if (filters.dangerLevels.length > 0 && !filters.dangerLevels.includes(level)) {
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

  const toggleDangerLevel = (level: string) => {
    setFilters((prev) => ({
      ...prev,
      dangerLevels: prev.dangerLevels.includes(level)
        ? prev.dangerLevels.filter((l) => l !== level)
        : [...prev.dangerLevels, level],
    }));
  };

  const clearFilters = () => {
    setFilters({ months: [], wards: [], dangerLevels: [] });
  };

  const hasActiveFilters =
    filters.months.length > 0 || filters.wards.length > 0 || filters.dangerLevels.length > 0;

  return {
    filters,
    options,
    filtered,
    toggleMonth,
    toggleWard,
    toggleDangerLevel,
    clearFilters,
    hasActiveFilters,
  };
}
