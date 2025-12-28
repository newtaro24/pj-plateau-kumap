import { useMemo } from 'react';
import bearSightingsData from '../data/bear_sightings_2025.json';
import type { BearSighting } from '../types';
import {
  calculateSummary,
  countByHour,
  countByMonth,
  countBySituation,
  countByWard,
  countByWeekday,
} from '../utils/statsCalculator';

export function useBearStats() {
  const sightings = bearSightingsData.features as BearSighting[];

  return useMemo(
    () => ({
      sightings,
      monthly: countByMonth(sightings),
      byWard: countByWard(sightings),
      byHour: countByHour(sightings),
      bySituation: countBySituation(sightings),
      byWeekday: countByWeekday(sightings),
      summary: calculateSummary(sightings),
    }),
    [sightings],
  );
}
