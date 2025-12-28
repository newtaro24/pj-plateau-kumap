import { useMemo, useState } from 'react';
import type { BearSighting } from '../types';
import { categorizeSituation } from '../utils/statsCalculator';

export interface FilterState {
  months: string[];
  wards: string[];
  situations: string[];
}

export function useBearFilter(sightings: BearSighting[]) {
  const [filters, setFilters] = useState<FilterState>({
    months: [],
    wards: [],
    situations: [],
  });

  // フィルタ適用後のデータ
  const filtered = useMemo(() => {
    return sightings.filter((s) => {
      const month = s.properties.date.substring(0, 7);
      const ward = s.properties.ward;
      const situation = categorizeSituation(s.properties.situation);

      if (filters.months.length > 0 && !filters.months.includes(month)) {
        return false;
      }
      if (filters.wards.length > 0 && !filters.wards.includes(ward)) {
        return false;
      }
      if (filters.situations.length > 0 && !filters.situations.includes(situation)) {
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

  const toggleSituation = (situation: string) => {
    setFilters((prev) => ({
      ...prev,
      situations: prev.situations.includes(situation)
        ? prev.situations.filter((s) => s !== situation)
        : [...prev.situations, situation],
    }));
  };

  const clearFilters = () => {
    setFilters({ months: [], wards: [], situations: [] });
  };

  const hasActiveFilters =
    filters.months.length > 0 || filters.wards.length > 0 || filters.situations.length > 0;

  return {
    filters,
    filtered,
    toggleMonth,
    toggleWard,
    toggleSituation,
    clearFilters,
    hasActiveFilters,
  };
}
