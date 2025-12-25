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

export interface SafetyCell {
  lon: number;
  lat: number;
  safety: number;
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
