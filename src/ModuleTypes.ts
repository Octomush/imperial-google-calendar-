type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export type Interval = {
  start: number;
  end: number;
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

type WeeklyTimetable = Record<Weekday, ModuleInfo[]>;

// trusting the JSON structure we should just do:

import fs from "fs";
const computingJSON = fs.readFileSync("computing.json", "utf-8");
const computingTimeTable: WeeklyTimetable = JSON.parse(computingJSON);

// *optional try catch block maybe?
// maybe we can just make a folder of different
