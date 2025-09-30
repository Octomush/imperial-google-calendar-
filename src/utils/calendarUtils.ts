interface Lecture {
  id: string;
  title: string;
  date: string;
  time: string;
  room: string;
  module: string;
}

export const addToGoogleCalendar = (lecture: Lecture) => {
  const [startTime, endTime] = lecture.time.split(" - ");
  const dateObj = new Date(lecture.date);

  const startDateTime = new Date(
    `${lecture.date}T${convertTo24Hour(startTime)}`
  );
  const endDateTime = new Date(`${lecture.date}T${convertTo24Hour(endTime)}`);

  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const eventDetails = {
    text: lecture.title,
    dates: `${formatDateForGoogle(startDateTime)}/${formatDateForGoogle(
      endDateTime
    )}`,
    details: `Module: ${lecture.module}\nRoom: ${lecture.room}`,
    location: lecture.room,
  };

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventDetails.text
  )}&dates=${eventDetails.dates}&details=${encodeURIComponent(
    eventDetails.details
  )}&location=${encodeURIComponent(eventDetails.location)}`;

  window.open(url, "_blank");
};

const convertTo24Hour = (time: string): string => {
  const [timePart, period] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
};

export const addMultipleToGoogleCalendar = (lectures: Lecture[]) => {
  lectures.forEach((lecture, index) => {
    setTimeout(() => {
      addToGoogleCalendar(lecture);
    }, index * 300);
  });
};

// ICS file generation utilities
const generateUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
  lectures: Lecture[],
  selectedModules: string[] = []
) => {
  const now = new Date();
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
    "X-WR-CALDESC:Imperial College London lecture calendar export - Repeating for 8 weeks",
  ].join("\r\n");

  // Group lectures by their weekly pattern (day + time + module)
  const lecturePatterns = new Map<string, Lecture>();

  lectures.forEach((lecture) => {
    const lectureDate = new Date(lecture.date);
    const dayOfWeek = lectureDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const patternKey = `${dayOfWeek}-${lecture.time}-${lecture.module}`;

    // Only keep the first occurrence of each pattern
    if (!lecturePatterns.has(patternKey)) {
      lecturePatterns.set(patternKey, lecture);
    }
  });

  lecturePatterns.forEach((lecture) => {
    const [startTime, endTime] = lecture.time.split(" - ");

    // Calculate the start date for the second week of October 2025
    const secondWeekOfOctober2025 = new Date("2025-10-13"); // Monday of second week
    const lectureDate = new Date(lecture.date);
    const dayOfWeek = lectureDate.getDay();

    // Adjust to the correct day of the week in the second week of October 2025
    const startDate = new Date(secondWeekOfOctober2025);
    const dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Saturday=6, Monday=1 to Monday=0
    startDate.setDate(startDate.getDate() + dayOffset);

    const startDateTime = new Date(
      `${startDate.toISOString().split("T")[0]}T${convertTo24Hour(startTime)}`
    );
    const endDateTime = new Date(
      `${startDate.toISOString().split("T")[0]}T${convertTo24Hour(endTime)}`
    );

    // Calculate the until date (8 weeks from start date)
    const untilDate = new Date(startDate);
    untilDate.setDate(untilDate.getDate() + 7 * 7); // 7 weeks after start (8 weeks total)

    const uid = generateUID();
    const created = formatDateForICS(now);
    const dtstart = formatDateForICS(startDateTime);
    const dtend = formatDateForICS(endDateTime);
    const until = formatDateForICS(untilDate);

    icsContent +=
      "\r\n" +
      [
        "BEGIN:VEVENT",
        `UID:${uid}@imperial.ac.uk`,
        `DTSTAMP:${created}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `RRULE:FREQ=WEEKLY;COUNT=8`,
        `SUMMARY:${escapeICSText(lecture.title)}`,
        `DESCRIPTION:${escapeICSText(
          `Module: ${lecture.module}\nRoom: ${lecture.room}\nRepeats weekly for 8 weeks starting from second week of October 2025`
        )}`,
        `LOCATION:${escapeICSText(lecture.room)}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT",
      ].join("\r\n");
  });

  icsContent += "\r\nEND:VCALENDAR";
  return icsContent;
};

export const downloadICSFile = (
  lectures: Lecture[],
  selectedModules: string[] = [],
  filename?: string
) => {
  const icsContent = generateICSContent(lectures, selectedModules);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const modulesText =
    selectedModules.length > 0 ? `_${selectedModules.join("_")}` : "";
  const defaultFilename = `imperial_calendar_8weeks${modulesText}_${
    new Date().toISOString().split("T")[0]
  }.ics`;
  link.download = filename || defaultFilename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
