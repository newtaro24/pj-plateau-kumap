import type {
  BearSighting,
  HourlyData,
  MonthlyData,
  SituationData,
  SummaryStats,
  WardData,
  WeekdayData,
} from '../types';

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

  return { total, thisMonth, topWard };
}

export function formatMonthLabel(month: string): string {
  const [, m] = month.split('-');
  return `${Number.parseInt(m, 10)}月`;
}

export function countByHour(sightings: BearSighting[]): HourlyData[] {
  const timeRanges = [
    { hour: '0-3', label: '深夜', min: 0, max: 3 },
    { hour: '4-6', label: '早朝', min: 4, max: 6 },
    { hour: '7-9', label: '朝', min: 7, max: 9 },
    { hour: '10-12', label: '午前', min: 10, max: 12 },
    { hour: '13-15', label: '午後', min: 13, max: 15 },
    { hour: '16-18', label: '夕方', min: 16, max: 18 },
    { hour: '19-21', label: '夜', min: 19, max: 21 },
    { hour: '22-24', label: '深夜', min: 22, max: 24 },
  ];

  const counts = new Map<string, number>();
  for (const r of timeRanges) {
    counts.set(r.hour, 0);
  }

  for (const sighting of sightings) {
    const time = sighting.properties.time;
    if (time === '不明' || !time) continue;

    const hour = Number.parseInt(time.split(':')[0], 10);
    const range = timeRanges.find((r) => hour >= r.min && hour <= r.max);
    if (range) {
      counts.set(range.hour, (counts.get(range.hour) || 0) + 1);
    }
  }

  return timeRanges.map((r) => ({
    hour: r.hour,
    label: r.label,
    count: counts.get(r.hour) || 0,
  }));
}

export function countBySituation(sightings: BearSighting[]): SituationData[] {
  const categorize = (situation: string): string => {
    if (situation.includes('目撃')) return '目撃';
    if (situation.includes('カメラ')) return 'カメラ';
    if (situation.includes('駆除')) return '駆除';
    if (
      situation.includes('足跡') ||
      situation.includes('フン') ||
      situation.includes('堀り') ||
      situation.includes('掘り') ||
      situation.includes('被毛') ||
      situation.includes('爪') ||
      situation.includes('食痕') ||
      situation.includes('枝折り')
    ) {
      return '痕跡';
    }
    return 'その他';
  };

  const counts = new Map<string, number>();

  for (const sighting of sightings) {
    const category = categorize(sighting.properties.situation);
    counts.set(category, (counts.get(category) || 0) + 1);
  }

  const order = ['目撃', '痕跡', 'カメラ', '駆除', 'その他'];
  return order
    .filter((cat) => counts.has(cat))
    .map((category) => ({
      category,
      count: counts.get(category) || 0,
    }));
}

export function countByWeekday(sightings: BearSighting[]): WeekdayData[] {
  const labels = ['日', '月', '火', '水', '木', '金', '土'];
  const counts = new Array(7).fill(0);

  for (const sighting of sightings) {
    const date = new Date(sighting.properties.date);
    const weekday = date.getDay();
    counts[weekday]++;
  }

  return counts.map((count, weekday) => ({
    weekday,
    label: labels[weekday],
    count,
  }));
}
