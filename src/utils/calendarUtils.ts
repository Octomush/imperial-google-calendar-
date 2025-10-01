import { ModuleInfo, Weekday, WeeklyTimetable } from "@/ModuleTypes";

export const TERM_START_DATE = "2025-10-13";

const generateUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const formatDateForICS = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const escapeICSText = (text: string) => {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
};

export const generateICSContent = (
  computingTimetable: WeeklyTimetable,
  selectedModules: string[] = []
) => {
  const modulesText =
    selectedModules.length > 0 ? ` - ${selectedModules.join(", ")}` : "";

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Imperial College London//Calendar Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Imperial College${modulesText}`,
    "X-WR-TIMEZONE:Europe/London",
    "X-WR-CALDESC:Imperial College London lecture calendar export",
  ].join("\r\n");

  const ICSCreatedStamp = formatDateForICS(new Date());

  for (const [day, modulesInDay] of Object.entries(computingTimetable) as [
    Weekday,
    ModuleInfo[]
  ][]) {
    for (const module of modulesInDay) {
      const uid = generateUID();
      const dayOffset = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ].indexOf(day);

      const startDate = new Date(TERM_START_DATE);
      startDate.setDate(startDate.getDate() + dayOffset);
      const startDateTime = new Date(
        `${startDate.toISOString().split("T")[0]}T${module.time.start}:00`
      );
      const endDateTime = new Date(
        `${startDate.toISOString().split("T")[0]}T${module.time.end}:00`
      );

      const dtstart = formatDateForICS(startDateTime);
      const dtend = formatDateForICS(endDateTime);

      if (selectedModules.includes(module.module)) {
        icsContent +=
          "\r\n" +
          [
            "BEGIN:VEVENT",
            `UID:${uid}@imperial.ac.uk`,
            `DTSTAMP:${ICSCreatedStamp}`,
            `DTSTART:${dtstart}`,
            `DTEND:${dtend}`,
            `RRULE:FREQ=WEEKLY;COUNT=8`,
            `SUMMARY:${escapeICSText(module.module)}`,
            `DESCRIPTION:${escapeICSText(module.staff)}`,
            `LOCATION:${escapeICSText(module.location)}`,
            "STATUS:CONFIRMED",
            "TRANSP:OPAQUE",
            "END:VEVENT",
          ].join("\r\n");
      }
    }
  }
  console.log(icsContent);
  icsContent += "\r\nEND:VCALENDAR";
  return icsContent;
};

export const downloadICSFile = (icsContent: string, filename?: string) => {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const defaultFilename = `imperial_calendar_8weeks_${
    new Date().toISOString().split("T")[0]
  }.ics`;
  link.download = filename || defaultFilename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
