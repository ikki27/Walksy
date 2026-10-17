// what GET /visits/sdg-stats returns
export type SdgGoalStats = {
  goal: number; // SDG number, e.g. 3
  visits: number;
  locations: number;
  lastActivity: string; // ISO date
  visitIds: string[];
};

export type SdgStats = {
  totalVisits: number;
  goals: SdgGoalStats[]; // most visits first
};
