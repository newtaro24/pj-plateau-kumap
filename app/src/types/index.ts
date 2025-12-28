export interface BearSighting {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    date: string;
    time: string;
    ward: string;
    location: string;
    situation: string;
    dangerLevel: string;
  };
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface WardData {
  ward: string;
  count: number;
}

export interface SummaryStats {
  total: number;
  thisMonth: number;
  topWard: string;
  dangerHighCount: number;
}

export interface HourlyData {
  hour: string;
  label: string;
  count: number;
}

export interface DangerLevelData {
  level: string;
  label: string;
  count: number;
  color: string;
}

export interface SituationData {
  category: string;
  count: number;
}

export interface WeekdayData {
  weekday: number;
  label: string;
  count: number;
}
