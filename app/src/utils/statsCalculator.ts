import type { BearSighting, MonthlyData, SummaryStats, WardData } from '../types';

export function countByMonth(sightings: BearSighting[]): MonthlyData[] {
  const counts = new Map<string, number>();

  for (const sighting of sightings) {
    const date = sighting.properties.date;
    const month = date.substring(0, 7); // "2025-04" 形式
    counts.set(month, (counts.get(month) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function countByWard(sightings: BearSighting[]): WardData[] {
  const counts = new Map<string, number>();

  for (const sighting of sightings) {
    const ward = sighting.properties.ward;
    counts.set(ward, (counts.get(ward) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([ward, count]) => ({ ward, count }))
    .sort((a, b) => b.count - a.count);
}

export function calculateSummary(sightings: BearSighting[]): SummaryStats {
  const total = sightings.length;

  // 今月の件数
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = sightings.filter((s) => s.properties.date.startsWith(currentMonth)).length;

  // 最多出没区
  const wardCounts = countByWard(sightings);
  const topWard = wardCounts[0]?.ward || '不明';

  // 危険度高の件数
  const dangerHighCount = sightings.filter((s) => s.properties.dangerLevel === 'high').length;

  return { total, thisMonth, topWard, dangerHighCount };
}

export function formatMonthLabel(month: string): string {
  const [, m] = month.split('-');
  return `${Number.parseInt(m, 10)}月`;
}
