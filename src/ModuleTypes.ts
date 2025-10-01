export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export type Interval = {
  start: string;
  end: string;
};

export type ModuleInfo = {
  time: Interval;
  week: number;
  module: string;
  location: string;
  staff: string;
  groups: string;
  event_category: string;
  published_online_link?: string;
  department: string;
  notes?: string;
  id: string;
};

export type WeeklyTimetable = Record<Weekday, ModuleInfo[]>;
